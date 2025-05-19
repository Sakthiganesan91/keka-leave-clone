import { getTeamLeaves } from "@/apis/leave";
import Calendar from "@/components/home/Calendar";
import EmployeeList from "@/components/home/EmployeeList";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

const CalendarPage = () => {
  const [employeeId, setEmployeeId] = useState(0);
  const { data, isError, isLoading } = useQuery({
    queryKey: ["teamLeaves", employeeId],
    queryFn: () => getTeamLeaves(employeeId),
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  if (isError) {
    return <>Error</>;
  }

  if (data) {
    return (
      <div className="grid grid-cols-8 gap-1 my-4">
        <div className="col-span-2">
          <div className="h-1/3 overflow-y-auto">
            <EmployeeList
              setEmployeeId={setEmployeeId}
              selectedId={employeeId}
            />
          </div>
          {employeeId !== 0 && (
            <Button
              onClick={() => {
                setEmployeeId(0);
              }}
            >
              Clear
            </Button>
          )}
        </div>
        <div className="col-span-6">
          <Calendar
            events={data.leaveData.map((l: any) => {
              return {
                ...l,
                start: new Date(l.start),
                end: new Date(l.end),
              };
            })}
          />
        </div>
      </div>
    );
  }
};

export default CalendarPage;
