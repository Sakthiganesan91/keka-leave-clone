import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
} from "@/components/ui/table";
import { toast } from "sonner";
import { deleteLeavePolicy, getLeavePolicies } from "@/apis/policies";

const LeavePolicies = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["leave-policies"],
    queryFn: getLeavePolicies,
  });

  const deleteMutation = useMutation({
    mutationFn: (leavepolicy_id: number) => {
      return deleteLeavePolicy(leavepolicy_id);
    },
    onSuccess: () => {
      toast.success("Leave policy deleted.");
      queryClient.invalidateQueries({ queryKey: ["leave-policies"] });
    },
    onError: (error) => {
      console.log(error);
      toast.error("Failed to delete leave policy.");
    },
  });

  const handleEdit = (policy: any) => {
    console.log("Edit clicked for", policy.leave_type_name);
  };

  const handleDelete = (leavepolicy_id: number) => {
    if (confirm("Are you sure you want to delete this leave policy?")) {
      deleteMutation.mutate(leavepolicy_id);
    }
  };

  if (isLoading) return <div>Loading leave policies...</div>;
  if (isError) return <div>Error fetching leave policies.</div>;

  if (data) {
    console.log(data);
    return (
      <Card className="mt-4">
        <CardContent className="overflow-x-auto p-1">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Need Approval</TableHead>
                <TableHead>Allow Half Day</TableHead>
                <TableHead>Max Days / Year</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Deduct Salary</TableHead>
                <TableHead>Approval Level</TableHead>
                <TableHead>Max Days / Month</TableHead>
                <TableHead>Not Approved Leaves</TableHead>
                <TableHead>Roll Over Allowed</TableHead>
                <TableHead>Roll Over Count</TableHead>
                <TableHead>Roll Over Monthly</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.policies.map((policy: any) => (
                <TableRow key={policy.leave_type_name}>
                  <TableCell>{policy.leave_type_name}</TableCell>
                  <TableCell>{policy.need_approval ? "Yes" : "No"}</TableCell>
                  <TableCell>{policy.allow_half_day ? "Yes" : "No"}</TableCell>
                  <TableCell>{policy.max_days_per_year ?? "-"}</TableCell>
                  <TableCell>{policy.paid ? "Yes" : "No"}</TableCell>
                  <TableCell>{policy.deduct_salary ? "Yes" : "No"}</TableCell>
                  <TableCell>{policy.approval_level_needed}</TableCell>
                  <TableCell>{policy.max_days_per_month ?? "-"}</TableCell>
                  <TableCell>
                    {policy.not_approved_leave
                      ? Object.values(policy.not_approved_leave).join(", ")
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {policy.roll_over_allowed ? "Yes" : "No"}
                  </TableCell>
                  <TableCell>{policy.roll_over_count ?? "-"}</TableCell>
                  <TableCell>
                    {policy.roll_over_monthly_allowed ? "Yes" : "No"}
                  </TableCell>
                  <TableCell className="space-x-1">
                    <Button size="sm" onClick={() => handleEdit(policy)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(policy.leavepolicy_id)}
                      disabled={deleteMutation.isPending}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }
};

export default LeavePolicies;
