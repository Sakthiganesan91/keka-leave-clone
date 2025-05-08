import { getLeaveRequestsByStatus } from "@/apis/leave";
import { useAuth } from "@/context/auth";
import { useQuery } from "@tanstack/react-query";
import { PartyPopper } from "lucide-react";

import React from "react";
const PendingLeaveTab = () => {
  const { user } = useAuth();

  if (!user) return null;
  const { isPending, isError, data, error } = useQuery({
    queryKey: ["leavesByStatus", "pending"],
    queryFn: () =>
      getLeaveRequestsByStatus({ employee_id: user.id, status: "pending" }),
  });

  if (isError) {
    return <>{error}</>;
  }
  if (isPending) {
    return <>Loading</>;
  }

  if (data) {
    return (
      <>
        <h5 className="font-bold text-2xl mb-4 text-cyan-500">
          Pending Leave Request
        </h5>

        {data.leaves.length === 0 ? (
          <div className="flex gap-2 text-cyan-500">
            <p className="font-bold"> No Pending Request</p> <PartyPopper />
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow-lg">
            {
              <table className="min-w-full table-auto text-left text-sm text-gray-300 bg-gray-900">
                <thead className="bg-gray-800 uppercase  text-cyan-400 text-xs">
                  <tr>
                    <th className="px-3 py-3">Leave Dates</th>
                    <th className="px-3 py-3">Leave Type</th>
                    <th className="px-3 py-3">Requested By</th>
                    <th className="px-3 py-3">Action Taken On</th>
                    <th className="px-3 py-3">Leave Note</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Reject/Cancellation Reason</th>
                    <th className="px-3 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.leaves.map((leave: any) => {
                    const startDate = new Date(
                      leave.start_date.split("T")[0]
                    ).toLocaleDateString();
                    const endDate = new Date(
                      leave.end_date.split("T")[0]
                    ).toLocaleDateString();
                    return (
                      <React.Fragment key={leave.leave_id}>
                        <tr className="border-b border-gray-700 hover:bg-gray-800">
                          <td className="px-3 py-4">
                            <div className="font-medium text-white">
                              {startDate === endDate
                                ? startDate
                                : `${startDate} - ${endDate}`}
                            </div>
                            <div className="text-sm text-gray-400">
                              {leave.noofdays}
                            </div>
                          </td>
                          <td className="px-3 py-4">
                            <div className="text-white font-medium">
                              {leave.leave_type}
                            </div>
                            <div className="text-sm text-gray-400">
                              {leave.applied_on.split("T")[0]}
                            </div>
                          </td>

                          <td className="px-3 py-4">{leave.requested_name}</td>
                          <td className="px-3 py-4">
                            {leave.status_updated_on}
                          </td>
                          <td className="px-3 py-4 text-white">
                            {leave.leave_reason}
                          </td>

                          <td className="px-3 py-4">
                            <span className="text-green-400 font-semibold">
                              {leave.status}
                            </span>
                            <div className="text-sm text-gray-400">
                              {leave.manager_name}
                            </div>
                          </td>
                          <td className="px-3 py-4 text-gray-400">
                            {leave.cancelled_by}
                          </td>
                          <td className="px-3 py-4 text-right text-white">⋯</td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            }
          </div>
        )}
      </>
    );
  }
};

export default PendingLeaveTab;
