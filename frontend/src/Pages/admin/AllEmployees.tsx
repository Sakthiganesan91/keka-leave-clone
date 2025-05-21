import {
  assignManager,
  changeEmployeeNotice,
  changeEmployeeStatus,
  getAllEmployees,
} from "@/apis/employee";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
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

  const assignManagerMutation = useMutation({
    mutationFn: ({
      employeeEmail,
      managerEmail,
    }: {
      employeeEmail: string;
      managerEmail: string;
    }) => assignManager(employeeEmail, managerEmail),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["allEmployees"] });
      toast.success(data.message);
    },
  });
  const managerAssignmentHandler = (
    employeeEmail: string,
    managerEmail: string,
    index: number
  ) => {
    assignManagerMutation.mutate({ employeeEmail, managerEmail });

    const updatedEdit: boolean[] = [...edit];
    updatedEdit[index] = false;
    setEdit(updatedEdit);

    setEmail("");
  };

  const [email, setEmail] = useState<string>("");
  const [edit, setEdit] = useState<boolean[]>([
    ...Array(data.employees.length).fill(false),
  ]);

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
              <th className="px-4 py-2 border-b border-gray-700">Manager</th>
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
                  <td className="px-4 py-2 border-b border-gray-700">
                    {employee.manager_email && edit[index] === false ? (
                      <div className="flex gap-x-2 items-center">
                        <p>{employee.manager_name}</p>
                        <Button
                          onClick={() => {
                            setEmail(employee.manager_email);
                            const updatedEdit = [...edit];
                            updatedEdit[index] = true;
                            setEdit(updatedEdit);
                          }}
                        >
                          Change
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-x-2">
                        {edit[index] === true ? (
                          <>
                            <Input
                              className="w-[150px]"
                              placeholder="Manager Email"
                              style={{ fontSize: "0.75em" }}
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                            />
                            <Button
                              onClick={() =>
                                managerAssignmentHandler(
                                  employee.email,
                                  email,
                                  index
                                )
                              }
                            >
                              Assign
                            </Button>
                            <Button
                              onClick={() => {
                                const updatedEdit = [...edit];
                                updatedEdit[index] = false;
                                setEdit(updatedEdit);
                              }}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <Button
                            onClick={() => {
                              setEmail(employee.manager_email);
                              const updatedEdit = [...edit];
                              updatedEdit[index] = true;
                              setEdit(updatedEdit);
                            }}
                          >
                            {employee.manager_email ? "Change" : "Assign"}
                          </Button>
                        )}
                      </div>
                    )}
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
