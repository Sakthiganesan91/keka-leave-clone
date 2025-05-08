import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const formatTime = (date: Date) => {
  const pad = (n: number) => n.toString().padStart(2, "0");

  const formatted = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds()
  )}`;

  return formatted;
};

export const calculateCustomLeaveHours = ({
  startDate,
  endDate,
  start_date_half,
  end_date_half,
  halfday,
}: {
  startDate: Date;
  endDate: Date;
  start_date_half: string;
  end_date_half: string;
  halfday: string;
}): {
  startD: string;
  endD: string;
  totalDays: number;
} => {
  let start_date = new Date(startDate);
  let end_date = new Date(endDate);

  let startTime = 9;
  let endTime = 18;

  if (halfday === "full day") {
    start_date.setHours(startTime, 0, 0, 0);
    end_date.setHours(endTime, 0, 0, 0);

    let startD: string = formatTime(start_date);
    let endD: string = formatTime(end_date);
    const totalDays = getLeaveDaysByMonth(startD, endD);
    return { startD, endD, totalDays };
  }
  startTime = start_date_half === "am" ? 9 : 14;
  if (end_date_half) {
    endTime = end_date_half === "am" ? 13 : end_date_half === "pm" ? 18 : 14;
  }
  start_date.setHours(startTime, 0, 0, 0);
  end_date.setHours(endTime, 0, 0, 0);

  let startD: string = formatTime(start_date);
  let endD: string = formatTime(end_date);
  const totalDays = getLeaveDaysByMonth(startD, endD);
  return { startD, endD, totalDays };
};

export const getLeaveDaysByMonth = (
  startDateTime: string,
  endDateTime: string
): number => {
  let leaveDays: number = 0;
  const start = new Date(startDateTime);
  const end = new Date(endDateTime);

  for (
    let d = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    d <= end;

  ) {
    const day = d.getDay();
    if (day === 0 || day === 6) {
      d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
      continue;
    }

    let leaveHours = 1;

    const currentDateStr = d.toDateString();
    const startDateStr = start.toDateString();
    const endDateStr = end.toDateString();

    if (currentDateStr === startDateStr && currentDateStr === endDateStr) {
      const startHour = start.getHours();
      const endHour = end.getHours();
      if (startHour === 9 && endHour === 13) leaveHours = 0.5;
      else if (startHour === 14 && endHour === 18) leaveHours = 0.5;
      else leaveHours = 1;
    } else if (currentDateStr === startDateStr) {
      const startHour = start.getHours();
      leaveHours = startHour >= 14 ? 0.5 : 1;
    } else if (currentDateStr === endDateStr) {
      const endHour = end.getHours();
      leaveHours = endHour <= 13 ? 0.5 : 1;
    }

    leaveDays += leaveHours;

    d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
  }

  return leaveDays;
};

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function getMonthName(monthNumber: number) {
  return monthNames[monthNumber];
}

export const debounce = (func: (...args: any[]) => void, delay: number) => {
  let timer: any;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

export const highLevelAuthors = ["hr", "manager", "admin"];
