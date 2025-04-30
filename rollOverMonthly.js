import { query as db } from "./database.js";

export async function performLeaveRollover() {
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  try {
    const [eligiblePairs] = await db.execute(`
        SELECT e.employee_id, l.leavepolicy_id, l.max_days_per_month
        FROM employee e
        CROSS JOIN leavepolicy l
        WHERE l.roll_over_monthly_allowed = true
      `);

    for (const {
      employee_id,
      leavepolicy_id,
      max_days_per_month,
    } of eligiblePairs) {
      const [[exists]] = await db.execute(
        `SELECT 1 FROM employee_leave WHERE employee_id = ? AND leavepolicy_id = ? AND month = ? AND year = ?`,
        [employee_id, leavepolicy_id, currentMonth, currentYear]
      );
      if (exists) continue;

      const [[prevLeave]] = await db.execute(
        `SELECT leave_taken_month, carry_leave_count FROM employee_leave 
           WHERE employee_id = ? AND leavepolicy_id = ? AND month = ? AND year = ?`,
        [employee_id, leavepolicy_id, prevMonth, prevYear]
      );

      let carry_leave_count = 0;

      if (!prevLeave) {
        carry_leave_count = max_days_per_month;
      } else {
        const taken = prevLeave.leave_taken_month || 0;
        const carried = prevLeave.carry_leave_count || 0;
        carry_leave_count = max_days_per_month - taken + carried;
      }

      await db.execute(
        `INSERT INTO employee_leave (employee_id, leavepolicy_id, month, year, carry_leave_count)
           VALUES (?, ?, ?, ?, ?)`,
        [
          employee_id,
          leavepolicy_id,
          currentMonth,
          currentYear,
          carry_leave_count ?? 0,
        ]
      );
    }

    console.log("Done");
  } catch (err) {
    console.error("Error in monthly leave rollover:", err);
  }
}

// performLeaveRollover();
