import { query as db } from "../database.js";

export async function performYearlyLeaveRollover() {
  const today = new Date();
  const currentYear = today.getFullYear();
  const prevYear = currentYear - 1;

  try {
    const [employeeLeavePolicy] = await db.execute(`
        SELECT e.employee_id, l.leavepolicy_id, 
               l.max_days_per_year, l.roll_over_allowed, l.roll_over_count
        FROM employee e
        CROSS JOIN leavepolicy l
        WHERE l.roll_over_allowed = true
      `);

    for (const {
      employee_id,
      leavepolicy_id,
      max_days_per_year,
      roll_over_count,
    } of employeeLeavePolicy) {
      const [[exists]] = await db.execute(
        `SELECT 1 FROM employee_leave_yearly 
           WHERE employee_id = ? AND leavepolicy_id = ? AND year = ?`,
        [employee_id, leavepolicy_id, currentYear]
      );
      if (exists) continue;

      const [[prevYearData]] = await db.execute(
        `SELECT leave_remaining FROM employee_leave_yearly 
           WHERE employee_id = ? AND leavepolicy_id = ? AND year = ?`,
        [employee_id, leavepolicy_id, prevYear]
      );

      let rollover_prev_year = 0;

      rollover_prev_year =
        prevYearData?.leave_remaining || 0 + max_days_per_year < roll_over_count
          ? prevYearData?.leave_remaining || 0 + max_days_per_year
          : 0;

      const total_available = (max_days_per_year ?? 0) + rollover_prev_year;

      await db.execute(
        `INSERT INTO employee_leave_yearly 
           (employee_id, leavepolicy_id, year, leave_allocated, leave_taken, leave_remaining, rollover_prev_year)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          employee_id,
          leavepolicy_id,
          currentYear,
          max_days_per_year ?? 0,
          0,
          total_available,
          rollover_prev_year,
        ]
      );
    }

    console.log("Yearly leave rollover completed.");
  } catch (err) {
    console.error("Error in yearly leave rollover:", err);
  }
}

// performYearlyLeaveRollover();
