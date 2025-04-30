import { query as connection } from "../database.js";

function getLeaveDaysByMonth(startDate, endDate) {
  const leaveDaysByMonth = {};

  const start = new Date(startDate);
  const end = new Date(endDate);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const day = d.getDay();
    if (day === 0 || day === 6) continue;

    const month = d.getMonth() + 1;
    const year = d.getFullYear();

    const key = `${year}-${month.toString().padStart(2, "0")}`;
    leaveDaysByMonth[key] = (leaveDaysByMonth[key] || 0) + 1;
  }

  return leaveDaysByMonth;
}

const getManagerId = async (employeeId) => {
  const [results] = await connection.query(
    `SELECT manager_id FROM employee WHERE employee_id = ?`,
    [employeeId]
  );
  return results[0].manager_id;
};

const validateLeaveRequest = async (
  employeeId,
  start_date,
  end_date,
  leaveType,
  noofdays,
  is_half_day
) => {
  const [leave_raise_request] = await connection.query(
    `SELECT leave_id FROM leave_request 
     WHERE employee_id = ? AND status IN ('pending', 'approved')
       AND ((start_date) <= (?) AND (end_date) >= (?));`,
    [employeeId, end_date, start_date]
  );
  if (leave_raise_request.length > 0) {
    throw Error("Leave Request is already submitted or in pending state");
  }

  const [attendance_results] = await connection.query(
    `SELECT attendance_id FROM attendance
     WHERE employee_id = ? AND date BETWEEN DATE(?) AND DATE(?) AND is_present = 1`,
    [employeeId, start_date, end_date]
  );
  if (attendance_results.length > 0) {
    throw Error("Attendance Already Exist, Cannot Apply Leave Further");
  }

  const leavePolicy = await getLeavePolicy(leaveType);

  if (leaveType.toLowerCase() !== "loss of pay") {
    await validateLeaveCount(
      employeeId,
      leaveType,
      noofdays,
      leavePolicy,
      start_date,
      end_date
    );
  }

  if (leavePolicy.allow_half_day === 0 && is_half_day === true) {
    throw Error("You cannot avail half day for this leave type");
  }

  if (leaveType.toLowerCase() === "floater") {
    await validateFloaterLeave(start_date, noofdays);
  }
};

const isLeaveWithinMonthlyLimit = async ({
  employeeId,
  leaveType,
  start_date,
  end_date,
  leavePolicy,
}) => {
  const daysPerMonth = {};

  let current = new Date(start_date);
  const end = new Date(end_date);

  while (current <= end) {
    const year = current.getFullYear();
    const month = current.getMonth() + 1;
    const key = `${year}-${month}`;
    if (!daysPerMonth[key]) daysPerMonth[key] = 0;
    daysPerMonth[key] += 1;

    current.setDate(current.getDate() + 1);
  }

  for (const [key, newLeaveDays] of Object.entries(daysPerMonth)) {
    const [year, month] = key.split("-").map(Number);

    //write a connection query to get carry_leave_count from employee_leave for the given employeeId and month and leavepolicy_id
    const [carry_forwarded_result] = await connection.query(
      `SELECT carry_leave_count FROM employee_leave WHERE employee_id = ? AND month = ? AND leavepolicy_id = ?`,
      [employeeId, month, leavePolicy.leavepolicy_id]
    );

    const carry_forwarded_from_last_month =
      carry_forwarded_result[0]?.carry_leave_count || 0;

    const [results] = await connection.query(
      `SELECT COALESCE(SUM(noofdays), 0) as daysTaken
       FROM leave_request
       WHERE leave_type = ?
         AND employee_id = ?
         AND status IN ("approved", "pending")
         AND (
              (MONTH(start_date) = ? AND YEAR(start_date) = ?)
           OR (MONTH(end_date) = ? AND YEAR(end_date) = ?)
         )`,
      [leaveType, employeeId, month, year, month, year]
    );

    const alreadyTaken = parseInt(results[0].daysTaken) || 0;
    const totalAllowedThisMonth =
      (leavePolicy.max_days_per_month || 0) +
      (carry_forwarded_from_last_month || 0);

    if (
      totalAllowedThisMonth &&
      alreadyTaken + newLeaveDays > totalAllowedThisMonth
    ) {
      return true;
    }
  }

  return false;
};

const validateLeaveCount = async (
  employeeId,
  leaveType,
  noofdays,
  leavePolicy,
  start_date,
  end_date
) => {
  const start = new Date(start_date);
  const end = new Date(end_date);

  const startYear = start.getFullYear();
  const endYear = end.getFullYear();
  const yearArray = [startYear, endYear];

  let flag = false;
  for (const year of yearArray) {
    const [employee_leave_yearly] = await connection.query(
      `SELECT leave_taken FROM employee_leave_yearly 
     WHERE employee_id = ? AND leavepolicy_id = ? AND year = ?`,
      [employeeId, leavePolicy.leavepolicy_id, year]
    );

    const leaveCount = employee_leave_yearly[0]?.leave_taken || 0;
    flag = !(leaveCount < leavePolicy.max_days_per_year);
    if (flag) {
      throw Error("Maximum Leave Exceeded");
    }
  }

  if (
    leavePolicy.max_days_per_month !== null &&
    (await isLeaveWithinMonthlyLimit({
      employeeId,
      leaveType,
      start_date,
      end_date,
      leavePolicy,
    }))
  ) {
    throw Error("Maximum Leave Exceeded");
  }
};

const validateFloaterLeave = async (start_date, noofdays) => {
  if (noofdays > 1) {
    throw Error("You cannot avail more than one day for this leave type");
  }
  const [holidays_result] = await connection.query(
    `SELECT date FROM holidays WHERE DATE(date) = DATE(?) AND is_floater = ?`,
    [start_date, true]
  );
  if (holidays_result.length === 0) {
    throw Error("Floater Leave cannot be availed");
  }
};

const getLeavePolicy = async (leaveType) => {
  const [results] = await connection.query(
    `SELECT * FROM leavepolicy WHERE leave_type_name = ?`,
    [leaveType]
  );
  return results[0];
};

const handleLossOfPay = async (employeeId, startDate, endDate) => {
  if (!employeeId || !startDate || !endDate) {
    throw new Error("Employee ID, Start Date, and End Date are required");
  }

  const [salaryResults] = await connection.query(
    `SELECT base_salary, lop_deduction_per_day FROM employee_salary WHERE employee_id = ?`,
    [employeeId]
  );

  if (!salaryResults.length) {
    throw new Error("Employee salary record not found");
  }

  const { base_salary, lop_deduction_per_day } = salaryResults[0];

  const leaveDaysByMonth = getLeaveDaysByMonth(startDate, endDate);

  for (const [monthYear, leaveDays] of Object.entries(leaveDaysByMonth)) {
    const [year, month] = monthYear.split("-").map(Number);

    const gross_salary = base_salary;
    const lop_amount = leaveDays * lop_deduction_per_day;
    const final_salary = gross_salary - lop_amount;

    const [existingPayroll] = await connection.query(
      `SELECT payroll_id FROM payroll WHERE employee_id = ? AND month = ? AND year = ?`,
      [employeeId, month, year]
    );

    if (existingPayroll.length) {
      await connection.query(
        `
        UPDATE payroll
        SET lop_days = lop_days + ?, 
            total_deductions = total_deductions + ?,
            final_salary = final_salary - ?
        WHERE employee_id = ? AND month = ? AND year = ?
        `,
        [leaveDays, lop_amount, lop_amount, employeeId, month, year]
      );
    } else {
      await connection.query(
        `
        INSERT INTO payroll (employee_id, month, year, lop_days, gross_salary, total_deductions, final_salary)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          employeeId,
          month,
          year,
          leaveDays,
          gross_salary,
          lop_amount,
          final_salary,
        ]
      );
    }
  }
};

const assignApprovers = async (leaveId, manager_id, leavePolicy) => {
  const approvers = [];

  let currentManagerId = manager_id;
  let level = 1;

  while (currentManagerId && level < leavePolicy.approval_level_needed) {
    approvers.push({ approver_id: currentManagerId, level });

    const [result] = await connection.query(
      `SELECT manager_id FROM employee WHERE employee_id = ?`,
      [currentManagerId]
    );

    currentManagerId = result[0]?.manager_id;
    level++;
  }

  const [hr_list] = await connection.query(
    `SELECT employee_id FROM employee WHERE role = 'hr'`
  );

  hr_list.forEach((hr) => {
    approvers.push({
      approver_id: hr.employee_id,
      level: leavePolicy.approval_level_needed,
    });
  });

  for (const approver of approvers) {
    await connection.query(
      `INSERT INTO leave_approvers (leave_id, approver_id, level)
       VALUES (?, ?, ?)`,
      [leaveId, approver.approver_id, approver.level]
    );
  }
};

const createLeaveRequest = async ({
  employeeId,
  leavePolicy,
  start_date,
  end_date,
  noofdays,
  is_half_day,
  half_day_type,
  leave_reason,
  status,
  leaveType,
  manager_id,
}) => {
  const [results] = await connection.query(
    `INSERT INTO leave_request (
      employee_id,
      leavepolicy_id,
      start_date,
      end_date,
      noofdays,
      is_half_day,
      half_day_type,
      leave_reason,
      status,
      leave_type,
      current_level,
      approver_id,
      leave_month
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, MONTH(CURRENT_DATE()))`,
    [
      employeeId,
      leavePolicy.leavepolicy_id,
      start_date,
      end_date,
      noofdays,
      is_half_day,
      half_day_type,
      leave_reason,
      status,
      leaveType,
      1,
      manager_id,
    ]
  );
  return results.insertId;
};

const isWeekend = (date) => {
  const day = new Date(date).getDay();
  return day === 6 || day === 0;
};

export const raiseLeaveRequest = async (req, res) => {
  const { employee_id } = req.params;
  const employeeId = employee_id;
  const {
    leaveType,
    start_date,
    end_date,
    noofdays,
    leave_reason,
    is_half_day,
    half_day_type,
  } = req.body;

  try {
    if (!employeeId) throw Error("Employee ID is required");

    const [employeeDetails] = await connection.query(
      `SELECT in_notice FROM employee WHERE employee_id = ?`,
      [employeeId]
    );
    if (employeeDetails[0]?.in_notice) {
      throw Error("Employees in their notice period cannot apply for leave");
    }

    if (isWeekend(start_date) || isWeekend(end_date)) {
      throw Error("Leave cannot be applied for weekends (Saturday or Sunday)");
    }

    const leavePolicy = await getLeavePolicy(leaveType);
    const notApprovedLeave = leavePolicy.not_approved_leave || "[]";

    const notApprovedLeaveTypes = Object.values(notApprovedLeave);

    const [conflictingLeaves] = await connection.query(
      `SELECT leave_type FROM leave_request 
         WHERE employee_id = ? 
           AND leave_type IN (?) 
           AND (DATE(end_date) = DATE_SUB(DATE(?), INTERVAL 1 DAY) 
                OR DATE(start_date) = DATE_ADD(DATE(?), INTERVAL 1 DAY))`,
      [employeeId, notApprovedLeaveTypes, start_date, end_date]
    );

    if (conflictingLeaves.length > 0) {
      throw Error(`Conflicting leave found Leave cannot be applied.`);
    }

    const manager_id = await getManagerId(employeeId);
    await validateLeaveRequest(
      employeeId,
      start_date,
      end_date,
      leaveType,
      noofdays,
      is_half_day
    );

    let status = leaveType.toLowerCase() === "sick" ? "accepted" : "pending";

    const leaveId = await createLeaveRequest({
      employeeId,
      leavePolicy,
      start_date,
      end_date,
      noofdays,
      is_half_day,
      half_day_type,
      leave_reason,
      status,
      leaveType,
      manager_id,
    });

    if (leaveType.toLowerCase() === "sick") {
      updateAttendance(employeeId, leaveType, start_date, end_date, leaveId);
      updateEmployeeLeave(
        employeeId,
        leavePolicy.leavepolicy_id,
        leavePolicy.max_days_per_year,
        leavePolicy.max_days_per_month,
        start_date,
        end_date
      );
    }

    await assignApprovers(leaveId, manager_id, leavePolicy);

    res.status(201).json({
      message: "Leave Request Raised Successfully",
      leaveId,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

export const getLeaveRequest = async (req, res) => {
  const { manager_id } = req.query;

  try {
    const [leave_request_results] = await connection.query(
      `SELECT * from leave_request where approver_id = ? and status='pending'`,
      [manager_id]
    );

    res.status(200).json({
      leavesToBeHandled: leave_request_results,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const cancelOrRejectLeaveRequest = async (req, res) => {
  const leave_id = req.params.leave_id;

  const { cancellation_comment, status } = req.body;
  const { id } = req.query;

  try {
    const [leave_request_results] = await connection.query(
      `SELECT leavepolicy_id,employee_id,start_date,end_date from leave_request where leave_id = ?;`,
      [leave_id]
    );

    const start_date = leave_request_results[0].start_date;
    const end_date = leave_request_results[0].end_date;
    const employeeId = leave_request_results[0].employee_id;

    await connection.query(
      `DELETE FROM attendance WHERE employee_id = ? AND leave_id = ?`,
      [employeeId, leave_id]
    );

    const leavePolicyId = leave_request_results[0].leavepolicy_id;
    await updateEmployeeLeaveAfterCancellationOrRejection(
      employeeId,
      leavePolicyId,
      start_date,
      end_date
    );

    const [updated_results] = await connection.query(
      `
    UPDATE leave_request SET cancellation_comment = ?, cancelled_by = ?, status = ?, status_updated_at= CURRENT_TIMESTAMP() where leave_id = ? and (approver_id= ? or employee_id=? or ? = (SELECT manager_id from employee where employee_id = ?));`,
      [cancellation_comment, id, status, leave_id, id, id, id, employeeId]
    );

    res.status(200).json({
      message: "Leave Updated Successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

const markApproverAsApproved = async (leaveId, approverId) => {
  try {
    await connection.query(
      `
    UPDATE leave_approvers set approved=true where leave_id = ? and approver_id = ?;`,
      [leaveId, approverId]
    );
  } catch (error) {
    throw error;
  }
};

const handleFinalApproval = async ({
  leave_id,
  id,
  employeeId,
  leaveType,
  startDate,
  endDate,
  noofdays,
  leavePolicyId,
  max_days_per_year,
}) => {
  const [approvers] = await connection.query(
    `SELECT CASE 
       WHEN EXISTS (
         SELECT 1 
         FROM leave_approvers la
         JOIN employee e ON la.approver_id = e.employee_id
         WHERE la.approver_id = ? 
           AND e.role = (SELECT role FROM employee WHERE employee_id = ?)
       ) 
       THEN 1 
       ELSE 0 
     END AS result`,
    [id, id]
  );

  if (!approvers[0].result) {
    throw Error("Only HR can permit the last level of Leave Request");
  }

  await connection.query(
    `UPDATE leave_request
     SET status = 'approved', status_updated_at = CURRENT_TIMESTAMP(), approver_id = ?
     WHERE leave_id = ?`,
    [id, leave_id]
  );

  const [leavePolicy] = await connection.query(
    `SELECT max_days_per_year, max_days_per_month 
     FROM leavepolicy 
     WHERE leavepolicy_id = ?`,
    [leavePolicyId]
  );
  const { max_days_per_month } = leavePolicy[0];
  await updateAttendance(employeeId, leaveType, startDate, endDate, leave_id);

  if (leaveType.toLowerCase() !== "loss of pay") {
    await updateEmployeeLeave(
      employeeId,
      leavePolicyId,
      max_days_per_year,
      max_days_per_month,
      startDate,
      endDate
    );
  }

  if (leaveType.toLowerCase() === "loss of pay") {
    await handleLossOfPay(employeeId, startDate, endDate);
  }

  await markApproverAsApproved(leave_id, id);
};

const handleIntermediateApproval = async ({ leave_id, id, currentLevel }) => {
  const [manager] = await connection.query(
    `SELECT is_active FROM employee WHERE employee_id = (SELECT approver_id FROM leave_request WHERE leave_id = ?)`,
    [leave_id]
  );

  const [canApprove] = await connection.query(
    `SELECT COUNT(*) as count 
     FROM leave_approvers 
     WHERE approver_id = ? AND level = ?`,
    [id, currentLevel]
  );

  if (manager[0].is_active === 1 && !canApprove[0].count) {
    throw Error("You are not authorized to approve at this level");
  }

  const nextLevel = currentLevel + 1;

  const [nextApprover] = await connection.query(
    `SELECT approver_id 
     FROM leave_approvers 
     WHERE level = ? LIMIT 1`,
    [nextLevel]
  );

  const [hr] = await connection.query(
    `SELECT employee_id,is_active FROM employee WHERE role = 'hr' LIMIT 1`
  );

  let nextApproverId = null;

  if (nextApprover.length) {
    nextApproverId = nextApprover[0].approver_id;
  } else if (hr.length && hr[0].is_active === 1) {
    nextApproverId = hr[0].employee_id;
  } else {
    const [employee] = await connection.query(
      `SELECT employee_id FROM leave_request WHERE leave_id = ?`,
      [leave_id]
    );
    nextApproverId = employee[0]?.employee_id || null;
  }

  await connection.query(
    `UPDATE leave_request 
     SET current_level = ?, approver_id = ?, status_updated_at = CURRENT_TIMESTAMP()
     WHERE leave_id = ?`,
    [nextLevel, nextApproverId, leave_id]
  );

  await markApproverAsApproved(leave_id, id);
};

const updateAttendance = async (
  employeeId,
  leaveType,
  startDate,
  endDate,
  leave_id
) => {
  const [employeeDetails] = await connection.query(
    `SELECT email FROM employee WHERE employee_id = ?`,
    [employeeId]
  );

  if (!employeeDetails.length) throw Error("Employee not found");

  const employeeEmail = employeeDetails[0].email;

  const start = new Date(startDate);
  const end = new Date(endDate);

  for (let date = start; date <= end; date.setDate(date.getDate() + 1)) {
    const day = new Date(date).getDay();
    if (day === 6 || day === 0) continue;

    await connection.query(
      `INSERT INTO attendance (employee_id, email, date, is_present, is_leave, leave_type,leave_id) 
       VALUES (?, ?, ?, ?, ?, ?,?)`,
      [
        employeeId,
        employeeEmail,
        new Date(date),
        false,
        true,
        leaveType,
        leave_id,
      ]
    );
  }
};

const updateEmployeeLeave = async (
  employeeId,
  leavePolicyId,
  max_days_per_year,
  max_days_per_month,
  startDate,
  endDate
) => {
  const leaveDaysByMonth = getLeaveDaysByMonth(startDate, endDate);
  const year = new Date(startDate).getFullYear();
  let totalDays = 0;

  for (const days of Object.values(leaveDaysByMonth)) {
    totalDays += days;
  }

  for (const [monthYear, days] of Object.entries(leaveDaysByMonth)) {
    const [yr, mo] = monthYear.split("-").map(Number);
    const [yearlyExists] = await connection.query(
      `SELECT COUNT(*) as count FROM employee_leave_yearly WHERE employee_id = ? AND leavepolicy_id = ? AND year = ?`,
      [employeeId, leavePolicyId, yr]
    );

    if (yearlyExists[0].count === 0) {
      await connection.query(
        `INSERT INTO employee_leave_yearly (employee_id, leavepolicy_id, year, leave_allocated, leave_taken, leave_remaining)
         VALUES (?, ?, ?, ?, 0, ?)`,
        [employeeId, leavePolicyId, yr, max_days_per_year, max_days_per_year]
      );
    }
  }

  for (const [monthYear, days] of Object.entries(leaveDaysByMonth)) {
    const [yr, mo] = monthYear.split("-").map(Number);

    const [monthlyExists] = await connection.query(
      `SELECT COUNT(*) as count FROM employee_leave 
       WHERE employee_id = ? AND leavepolicy_id = ? AND month = ? AND year = ?`,
      [employeeId, leavePolicyId, mo, yr]
    );

    if (monthlyExists[0].count) {
      await connection.query(
        `UPDATE employee_leave 
         SET leave_taken_month = leave_taken_month + ? 
         WHERE employee_id = ? AND leavepolicy_id = ? AND month = ? AND year = ?`,
        [days, employeeId, leavePolicyId, mo, yr]
      );
    } else {
      await connection.query(
        `INSERT INTO employee_leave (employee_id, leavepolicy_id, month, year, leave_taken_month)
         VALUES (?, ?, ?, ?, ?)`,
        [employeeId, leavePolicyId, mo, yr, days]
      );
    }
  }

  for (const [year, days] of Object.entries(leaveDaysByMonth)) {
    const [yr, month] = year.split("-").map(Number);

    const [totalTakenResult] = await connection.query(
      `SELECT SUM(leave_taken_month) AS total FROM employee_leave 
     WHERE employee_id = ? AND leavepolicy_id = ? AND year = ?`,
      [employeeId, leavePolicyId, yr]
    );

    const leaveTaken = totalTakenResult[0].total || 0;
    const remaining = max_days_per_year - leaveTaken;

    await connection.query(
      `UPDATE employee_leave_yearly 
     SET leave_taken = ?, leave_remaining = ? 
     WHERE employee_id = ? AND leavepolicy_id = ? AND year = ?`,
      [leaveTaken, remaining, employeeId, leavePolicyId, yr]
    );
  }
};

const updateEmployeeLeaveAfterCancellationOrRejection = async (
  employee_id,
  leavepolicy_id,
  start_date,
  end_date
) => {
  try {
    const leaveDaysByMonth = getLeaveDaysByMonth(start_date, end_date);

    const yearObject = {};
    for (const [monthYear, days] of Object.entries(leaveDaysByMonth)) {
      const [yr, mo] = monthYear.split("-").map(Number);

      if (!yearObject[yr]) {
        yearObject[yr] = days;
      } else {
        yearObject[yr] += days;
      }
    }

    for (const [year, days] of Object.entries(yearObject)) {
      const [yearlyExists] = await connection.query(
        `SELECT COUNT(*) as count FROM employee_leave_yearly WHERE employee_id = ? AND leavepolicy_id = ? AND year = ?`,
        [employee_id, leavepolicy_id, year]
      );

      if (yearlyExists[0].count !== 0) {
        await connection.query(
          `UPDATE employee_leave_yearly
         SET leave_taken = leave_taken - ?, leave_remaining = leave_remaining + ?
         WHERE employee_id = ? AND leavepolicy_id = ? AND year = ?`,
          [days, days, employee_id, leavepolicy_id, year]
        );
      }
    }

    for (const [monthYear, days] of Object.entries(leaveDaysByMonth)) {
      const [yr, month] = monthYear.split("-").map(Number);

      const [monthlyExists] = await connection.query(
        `SELECT COUNT(*) as count FROM employee_leave 
         WHERE employee_id = ? AND leavepolicy_id = ? AND month = ? AND year = ?`,
        [employee_id, leavepolicy_id, month, yr]
      );
      if (monthlyExists[0].count) {
        await connection.query(
          `UPDATE employee_leave 
           SET leave_taken_month = leave_taken_month - ? 
           WHERE employee_id = ? AND leavepolicy_id = ? AND month = ? AND year = ?`,
          [days, employee_id, leavepolicy_id, month, yr]
        );
      }
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

export const acceptLeaveRequest = async (req, res) => {
  const leave_id = req.params.leave_id;
  const { id } = req.query;

  try {
    const [leaveRequest] = await connection.query(
      `SELECT leavepolicy_id, current_level, start_date, end_date, employee_id, leave_type, noofdays 
       FROM leave_request 
       WHERE leave_id = ?`,
      [leave_id]
    );

    if (!leaveRequest.length) throw Error("Leave request not found");

    const {
      current_level: currentLevel,
      leavepolicy_id: leavePolicyId,
      start_date: startDate,
      end_date: endDate,
      employee_id: employeeId,
      leave_type: leaveType,
      noofdays,
    } = leaveRequest[0];

    const [leavePolicy] = await connection.query(
      `SELECT max_days_per_year, approval_level_needed 
       FROM leavepolicy 
       WHERE leavepolicy_id = ?`,
      [leavePolicyId]
    );

    if (!leavePolicy.length) throw Error("Leave policy not found");

    const { max_days_per_year, approval_level_needed: approvalLevelNeeded } =
      leavePolicy[0];

    if (currentLevel === approvalLevelNeeded) {
      await handleFinalApproval({
        leave_id,
        id,
        employeeId,
        leaveType,
        startDate,
        endDate,
        noofdays,
        leavePolicyId,
        max_days_per_year,
      });
      return res.status(200).json({ message: "Leave Approved" });
    }

    await handleIntermediateApproval({
      leave_id,
      id,
      currentLevel,
    });

    res.status(200).json({ message: "Leave Request Updated" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
