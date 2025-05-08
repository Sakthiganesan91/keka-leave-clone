import { getRemainingLeavesByEmpoyeeId } from "@/apis/leave";
import { useAuth } from "@/context/auth";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { DonutChart } from "../charts/DonutChart";

const ReaminingLeaveChart = ({ leavePolicyId }: { leavePolicyId: number }) => {
  const { user } = useAuth();
  const { data, isError, error } = useQuery({
    queryFn: () =>
      getRemainingLeavesByEmpoyeeId({
        employee_id: user?.id!,
        leavepolicy_id: leavePolicyId,
      }),
    queryKey: ["getRemainingLeaves", user?.id, leavePolicyId],
  });

  if (isError) {
    <>{error}</>;
  }
  if (data) {
    const { leave_type_name, leave_remaining, leave_taken, leave_allocated } =
      data.leaveRemaining;

    return (
      <>
        {leave_type_name && (
          <div className="max-w-xs rounded-lg overflow-hidden shadow-lg bg-gray-800 text-white p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-cyan-500">
                {leave_type_name} Leave
              </h2>
            </div>

            <div>
              <div className="my-6 h-48 flex flex-col items-center justify-center bg-gray-700 rounded-lg relative">
                <DonutChart
                  className="mx-auto border-none outine-none break-words"
                  data={[
                    {
                      name: "Leave Remaining",
                      value: leave_remaining,
                    },
                    {
                      name: "Leave Taken",
                      value: leave_taken,
                    },
                  ]}
                  category="name"
                  value="value"
                  variant="donut"
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: "bold",
                    border: "none",
                    outline: "none",
                  }}
                  showLabel={true}
                  label={leave_remaining + " Day(s) Available"}
                  colors={["cyan", "pink"]}
                />
              </div>

              <div className="grid grid-cols-2 gap-px bg-gray-700 rounded-md overflow-hidden border border-gray-700">
                <div className="bg-gray-800 p-3">
                  <div className="text-xs text-gray-400 uppercase tracking-wider">
                    Available
                  </div>
                  <div className="text-lg font-semibold text-gray-100">
                    {leave_remaining} days
                  </div>
                </div>

                <div className="bg-gray-800 p-3">
                  <div className="text-xs text-gray-400 uppercase tracking-wider">
                    Consumed
                  </div>
                  <div className="text-lg font-semibold text-gray-100">
                    {leave_taken} day(s)
                  </div>
                </div>

                <div className="bg-gray-800 p-3 col-span-2 text-center">
                  <div className="text-xs text-gray-400 uppercase tracking-wider ">
                    Annual Quota
                  </div>
                  <div className="text-lg font-semibold text-gray-100">
                    {leave_allocated} days
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
};

export default ReaminingLeaveChart;
