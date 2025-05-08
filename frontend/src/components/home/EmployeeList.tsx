import { TeamEmployee } from "@/types";
import EmployeeCard from "./EmployeeCard";
import { getDepartments, getRoles, getTeamEmployees } from "@/apis/employee";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { debounce } from "@/lib/utils";
import { SearchX } from "lucide-react";
const EmployeeList = ({
  setEmployeeId,
  selectedId,
}: {
  setEmployeeId: React.Dispatch<React.SetStateAction<number>>;
  selectedId: number;
}) => {
  const [inputValue, setInputValue] = useState("");
  const [employeeName, setEmployeeName] = useState("");

  const [role, setRole] = useState("all");
  const [department, setDepartment] = useState("all");
  let inputRef = useRef<HTMLInputElement | null>(null);

  const handleEmployeeId = (employee_id: number) => {
    setEmployeeId(employee_id);
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, [employeeName]);
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setEmployeeName(value);
    }, 1000),
    []
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    debouncedSearch(event.target.value);
  };

  const handleRoleChange = (event: any) => {
    setRole(event.target.value);
  };

  const { data, isError, isLoading } = useQuery({
    queryKey: ["teamEmployees", employeeName, role, department],
    queryFn: () => getTeamEmployees({ employeeName, role, department }),
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  const { data: roles } = useQuery({
    queryKey: ["roles"],
    queryFn: getRoles,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: getDepartments,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  if (isError) return <>Error</>;
  if (isLoading) return <>Loading</>;

  if (data) {
    return (
      <div>
        <div className="font-bold text-cyan-600 text-xl">
          <p>My Team</p>
        </div>

        <div className="">
          <div>
            <label htmlFor="roles">Role</label>
            <div className="my-2 bg-gray-800 w-fit py-1 rounded-sm font-bold text-gray-400 ">
              <select
                className="outline-none border-none focus:border-none focus:outline-none "
                onChange={(event) => {
                  handleRoleChange(event);
                }}
              >
                <optgroup className="bg-gray-800 text-gray-400 ">
                  <option value="all">All</option>
                  {roles &&
                    roles.roles &&
                    roles.roles.map((role: { role: string }) => (
                      <option value={role.role}>{role.role}</option>
                    ))}
                </optgroup>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="dept">Dept</label>
            <div className="my-2 bg-gray-800 py-1 rounded-sm font-bold text-gray-400 ">
              <select
                className="outline-none border-none focus:border-none focus:outline-none "
                onChange={(event) => {
                  setDepartment(event.target.value);
                  console.log(event.target.value);
                }}
              >
                <optgroup className="bg-gray-800 text-gray-400 ">
                  <option value="all">All</option>
                  {departments &&
                    departments.departments &&
                    departments.departments.map(
                      (department: { department: string }) => (
                        <option value={department.department}>
                          {department.department}
                        </option>
                      )
                    )}
                </optgroup>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="text"
            ref={inputRef}
            value={inputValue}
            onChange={(event) => {
              handleChange(event);
            }}
            placeholder="Search Employee"
            className="bg-gray-800 rounded-sm outline-none text-white my-2 mx-0.5 py-2 px-2 w-full text-xs"
          />
          {inputValue.length > 0 && (
            <div
              className="cursor-pointer"
              onClick={() => {
                setInputValue("");
                setEmployeeName("");
              }}
            >
              <SearchX />
            </div>
          )}
        </div>

        {data?.employee_results?.map((employee: TeamEmployee) => (
          <div
            onClick={() => {
              handleEmployeeId(employee.employee_id);
            }}
          >
            <EmployeeCard
              employee={employee}
              key={employee.employee_id}
              isSelected={selectedId === employee.employee_id}
            />
          </div>
        ))}
      </div>
    );
  }
};

export default EmployeeList;
