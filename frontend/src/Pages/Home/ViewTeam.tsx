import { getTeamEmployees } from "@/apis/employee";
import ViewTeamCard from "@/components/home/ViewTeamCard";
import { TeamEmployee } from "@/types";
import { useQuery } from "@tanstack/react-query";

const ViewTeam = () => {
  const { data, isError, isLoading } = useQuery({
    queryKey: ["teamEmployees"],
    queryFn: () => getTeamEmployees({}),
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
  if (isError) {
    return <>Error</>;
  }
  if (isLoading) {
    return <>Loading</>;
  }

  if (data) {
    return (
      <div className="my-2">
        <div className="font-bold text-cyan-400 text-4xl my-4">
          <p>My Team</p>
        </div>
        <div className="grid md:grid-cols-2 grid-cols-1 gap-1 gap-y-4">
          {data.employee_results.map((employee: TeamEmployee) => (
            <ViewTeamCard employee={employee} key={employee.employee_id} />
          ))}
        </div>
      </div>
    );
  }
};

export default ViewTeam;
