import {
  changeEmployeeNotice,
  changeEmployeeStatus,
  getAllEmployees,
} from "@/apis/employee";
import { Switch } from "@/components/ui/switch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const AllEmployees = () => {
  const queryClient = useQueryClient();
  const { data, isError, isLoading } = useQuery({
    queryKey: ["allEmployees"],
    queryFn: () => getAllEmployees(),
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  const inActiveMutation = useMutation({
    mutationFn: (values: { employeeId: number; isActive: boolean }) =>
      changeEmployeeStatus({ ...values }),
    onSuccess: (data) => {
      console.log(data);
      queryClient.invalidateQueries({ queryKey: ["allEmployees"] });
      toast.success(data.message);
    },
    onError: (error) => {
      console.log(error);
    },
  });
  const noticeMutation = useMutation({
    mutationFn: (values: { employeeId: number; inNotice: boolean }) =>
      changeEmployeeNotice({ ...values }),
    onSuccess: (data) => {
      console.log(data);
      queryClient.invalidateQueries({ queryKey: ["allEmployees"] });
      toast.success(data.message);
    },
    onError: (error) => {
      console.log(error);
    },
  });
  if (isLoading) {
    return <>Loading...</>;
  }
  if (isError) {
    return <>Error</>;
  }

  if (data) {
    return (
      <div className="my-2 border-1 rounded-2xl">
        <table className="min-w-full border border-gray-700 rounded-md text-left text-sm text-white">
          <thead className="bg-cyan-800 text-gray-300">
            <tr>
              <th className="px-4 py-2 border-b border-gray-700">Name</th>
              <th className="px-4 py-2 border-b border-gray-700">Email</th>
              <th className="px-4 py-2 border-b border-gray-700">Department</th>
              <th className="px-4 py-2 border-b border-gray-700">
                Designation
              </th>
              <th className="px-4 py-2 border-b border-gray-700">Is Active</th>
              <th className="px-4 py-2 border-b border-gray-700">
                In Notice Period
              </th>
            </tr>
          </thead>
          <tbody>
            {data.employees &&
              data.employees.map((employee: any, index: number) => (
                <tr key={index} className="hover:bg-cyan-700">
                  <td className="px-4 py-2 border-b border-gray-700">
                    {employee.name}
                  </td>
                  <td className="px-4 py-2 border-b border-gray-700">
                    {employee.email}
                  </td>
                  <td className="px-4 py-2 border-b border-gray-700">
                    {employee.department}
                  </td>
                  <td className="px-4 py-2 border-b border-gray-700">
                    {employee.designation}
                  </td>
                  <td className="px-4 py-2 border-b border-gray-700">
                    <Switch
                      checked={employee.is_active}
                      onCheckedChange={(checked) => {
                        console.log(checked);
                        inActiveMutation.mutate({
                          employeeId: employee.employee_id,
                          isActive: checked,
                        });
                      }}
                    />
                  </td>
                  <td className="px-4 py-2 border-b border-gray-700">
                    <Switch
                      checked={employee.in_notice}
                      onCheckedChange={(checked) => {
                        console.log(checked);
                        noticeMutation.mutate({
                          employeeId: employee.employee_id,
                          inNotice: checked,
                        });
                      }}
                    />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    );
  }
};

export default AllEmployees;
