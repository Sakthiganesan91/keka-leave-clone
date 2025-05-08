import { LeaveEvent } from "@/types";
import { DateTime } from "luxon";
import { useState } from "react";
import {
  Calendar as ReactBigCal,
  View,
  luxonLocalizer,
} from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
const localizer = luxonLocalizer(DateTime);

const Calendar = ({ events }: { events: LeaveEvent[] }) => {
  const [view, setView] = useState<View>("month");
  //   const [date, setDate] = useState(new Date());

  //   const onDrillDown = useCallback(
  //     (newDate: Date) => {
  //       setDate(newDate);
  //       setView("day");
  //     },
  //     [setDate, setView]
  //   );
  return (
    <div>
      <ReactBigCal
        localizer={localizer}
        events={events}
        // date={date}
        popup={true}
        startAccessor="start"
        endAccessor="end"
        eventPropGetter={(event) => {
          let backgroundColor = "#9e9e9e";

          switch (event.type) {
            case "casual":
              backgroundColor = "#4caf50";
              break;
            case "sick":
              backgroundColor = "#f44336";
              break;
            case "floater":
              backgroundColor = "#2196f3";
              break;
            case "earned":
              backgroundColor = "#ff9800";
              break;
          }

          return {
            style: {
              backgroundColor,
              color: "white",
              borderRadius: "5px",
              border: "none",
            },
          };
        }}
        style={{ height: 600, fontSize: "0.40rem" }}
        views={["month", "work_week", "day"]}
        view={view}
        defaultView="month"
        onView={(view) => {
          setView(view);
        }}
      />
    </div>
  );
};

export default Calendar;
