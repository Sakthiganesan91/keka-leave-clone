import {
  approveLeaveRequest,
  getLeavesByEmployeeId,
  rejectOrCancelRequest,
} from "@/apis/leave";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { useAuth } from "@/context/auth";

const EmployeeLeaveModal = ({ employee_id }: { employee_id: number }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  if (!user) return null;

  // rejectOrCancelRequest
  const approveMutation = useMutation({
    mutationFn: (values: { leave_id: number; id: number }) =>
      approveLeaveRequest({ ...values }),

    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({
        queryKey: ["leavesByEmployeeId", employee_id],
      });
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const getDate = (startDate: string, endDate: string) =>
    startDate === endDate ? startDate : `${startDate} - ${endDate}`;

  const getFormattedDate = (date: string) =>
    new Date(date.split("T")[0]).toLocaleDateString();

  const rejectOrCancelMutation = useMutation({
    mutationFn: (values: { leave_id: number; id: number; status: string }) =>
      rejectOrCancelRequest({ ...values }),

    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({
        queryKey: ["leavesByEmployeeId", employee_id],
      });
    },
    onError: (error) => {
      console.log(error);
    },
  });
  const { data, isError, isLoading } = useQuery({
    queryFn: () => getLeavesByEmployeeId({ employee_id }),
    queryKey: ["leavesByEmployeeId", employee_id],
  });

  if (isLoading) {
    <>Loading...</>;
  }

  if (isError) {
    <>Error</>;
  }

  if (data) {
    return (
      <DialogContent className="min-w-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="my-2 text-cyan-500 text-2xl ml-4">
            Employee Leave History
          </DialogTitle>

          {data.leaves.length === 0 ? (
            <div className="flex justify-between text-cyan-500">
              <p className="font-bold"> No Leave History</p>
            </div>
          ) : (
            <div className="overflow-auto rounded-lg shadow-lg mx-4">
              {
                <table className=" text-left text-sm text-gray-300 bg-gray-900">
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
                      const startDate = getFormattedDate(leave.start_date);
                      const endDate = getFormattedDate(leave.end_date);
                      return (
                        <React.Fragment key={leave.leave_id}>
                          <tr className="border-b border-gray-700 hover:bg-gray-800">
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

                            <td className="px-3 py-4">{leave.name}</td>
                            <td className="px-3 py-4">
                              {leave.status_updated_at?.split("T")[0]}
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
                              {leave.cancellation_comment}
                            </td>
                            {leave.status === "pending" &&
                            leave.approver_id === user?.id ? (
                              <td className="px-3 py-4 text-right text-white flex gap-1">
                                <Button
                                  className="text-black bg-cyan-400"
                                  onClick={() => {
                                    approveMutation.mutate({
                                      leave_id: leave.leave_id,
                                      id: user?.id,
                                    });
                                  }}
                                >
                                  Approve
                                </Button>
                                <Button
                                  className="text-white bg-red-500"
                                  onClick={() => {
                                    rejectOrCancelMutation.mutate({
                                      leave_id: leave.leave_id,
                                      id: user?.id,
                                      status: "rejected",
                                    });
                                  }}
                                >
                                  Reject
                                </Button>
                              </td>
                            ) : (
                              <p className="m-4">No Actions Required</p>
                            )}
                          </tr>
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              }
            </div>
          )}
        </DialogHeader>
      </DialogContent>
    );
  }
};

export default EmployeeLeaveModal;
