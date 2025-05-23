import {
  approveLeaveRequest,
  getLeavesForApproval,
  rejectOrCancelRequest,
} from "@/apis/leave.ts";
import { useAuth } from "@/context/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "../ui/button";

import { toast } from "sonner";

const ApproveLeaveTab = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  if (!user) return null;
  const { isPending, isError, data, error } = useQuery({
    queryKey: ["pendingApprovalLeaves"],
    queryFn: () => getLeavesForApproval(user.id),
  });
  // rejectOrCancelRequest
  const approveMutation = useMutation({
    mutationFn: (values: { leave_id: number; id: number }) =>
      approveLeaveRequest({ ...values }),

    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["pendingApprovalLeaves"] });
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const rejectOrCancelMutation = useMutation({
    mutationFn: (values: { leave_id: number; id: number; status: string }) =>
      rejectOrCancelRequest({ ...values }),

    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["pendingApprovalLeaves"] });
    },
    onError: (error) => {
      console.log(error);
    },
  });
  if (isError) {
    return <>{error}</>;
  }
  if (isPending) {
    return <>Loading</>;
  }

  const approveLeave = (leave_id: number) => {
    approveMutation.mutate({
      leave_id: leave_id,
      id: user?.id,
    });
  };

  const rejectOrCancel = (leave_id: number) => {
    rejectOrCancelMutation.mutate({
      leave_id: leave_id,
      id: user?.id,
      status: "rejected",
    });
  };

  const getDate = (startDate: string, endDate: string) =>
    startDate === endDate ? startDate : `${startDate} - ${endDate}`;

  const getFormattedDate = (date: string) =>
    new Date(date.split("T")[0]).toLocaleDateString();

  if (data) {
    return (
      <div>
        <h5 className="font-bold text-2xl text-cyan-500 my-4">
          Leave Requests For Approval
        </h5>

        {data.leavesToBeHandled.length === 0 ? (
          <div className="flex justify-between text-cyan-500">
            No Request for Approval
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow-lg my-5">
            {
              <table className="min-w-full table-auto text-left text-sm text-gray-300 bg-gray-900">
                <thead className="bg-gray-800 uppercase  text-cyan-400 text-xs">
                  <tr>
                    <th className="px-3 py-3">Leave Dates</th>
                    <th className="px-3 py-3">Leave Type</th>
                    <th className="px-3 py-3">Requested By</th>

                    <th className="px-3 py-3">Leave Note</th>
                    <th className="px-3 py-3">Status</th>

                    <th className="px-3 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.leavesToBeHandled.map((leave: any) => {
                    const startDate = getFormattedDate(leave.start_date);
                    const endDate = getFormattedDate(leave.end_date);
                    return (
                      <tr
                        className="border-b border-gray-700 hover:bg-gray-800"
                        key={leave.leave_id}
                      >
                        <td className="px-3 py-4">
                          <div className="font-medium text-white">
                            {getDate(startDate, endDate)}
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

                        <td className="px-3 py-4">
                          <p className="font-bold">{leave.name}</p>

                          <span className="text-xs">{leave.designation}</span>
                        </td>

                        <td className="px-3 py-4 text-white">
                          {leave.leave_reason}
                        </td>

                        <td className="px-3 py-4">
                          <span className="text-yellow-400 font-semibold">
                            {leave.status}
                          </span>
                        </td>

                        <td className="px-3 py-4 text-right text-white flex gap-1">
                          <Button
                            className="text-black bg-cyan-400"
                            onClick={() => approveLeave(leave.leave_id)}
                          >
                            Approve
                          </Button>
                          <Button
                            className="text-white bg-red-500"
                            onClick={() => {
                              rejectOrCancel(leave.leave_id);
                            }}
                          >
                            Reject
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            }
          </div>
        )}
      </div>
    );
  }
};

export default ApproveLeaveTab;
