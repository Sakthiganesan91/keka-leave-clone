import { getPolicyIds } from "@/apis/policies";
import { useQuery } from "@tanstack/react-query";

import ReaminingLeaveChart from "./ReaminingLeaveChart";
import { BarChart } from "../charts/BarChart";
import { useAuth } from "@/context/auth";
import { getRemainingLeavesByEmpoyeeIdByMonth } from "@/apis/leave";
import { getMonthName } from "@/lib/utils";

const ShowRemainingLeaves = () => {
  const { user } = useAuth();
  const { data, isError, error } = useQuery({
    queryFn: () => getPolicyIds(),
    queryKey: ["policyIds"],
  });

  const { data: barChartData } = useQuery({
    queryFn: () =>
      getRemainingLeavesByEmpoyeeIdByMonth({
        employee_id: user?.id!,
      }),
    queryKey: ["leavesByMonth", user?.id!],
  });

  if (isError) {
    return <>{error}</>;
  }
  if (data && barChartData) {
    console.log("Bar Chart Data");
    console.log(barChartData);
    return (
      <>
        <div>
          <BarChart
            showLegend={false}
            data={Array.from({ length: 12 }, (_, i) => {
              const month = i + 1;
              const found = barChartData.leaveRemaining.find(
                (item: any) => item.month === month
              );

              const updated = {
                ...found,
                month: getMonthName(month),
              };

              return updated || { month: getMonthName(month), Leave_Taken: 0 };
            })}
            index="month"
            categories={["Leave_Taken"]}
            xAxisLabel="Month"
            yAxisLabel="Leave Taken"
          />
        </div>
        <div className="flex gap-2 flex-wrap mx-8 my-2">
          {data.policies.map(
            ({ leavepolicy_id }: { leavepolicy_id: number }) => (
              <div key={leavepolicy_id}>
                <ReaminingLeaveChart leavePolicyId={leavepolicy_id} />
              </div>
            )
          )}
        </div>
      </>
    );
  }
};

export default ShowRemainingLeaves;
