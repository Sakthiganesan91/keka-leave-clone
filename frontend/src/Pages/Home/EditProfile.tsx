import {
  changePasswordEmployee,
  changePhoneNumber,
  getEmployeeById,
} from "@/apis/employee";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useAuth } from "@/context/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

interface Employee {
  employee_id: number;
  phone_number: string | null;
}

export default function EditEmployeeForm() {
  const { user } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryFn: () => getEmployeeById(user?.id!),
    queryKey: ["employee", user?.id!],
  });
  const [formData, setFormData] = useState<Employee>(data!);
  const queryClient = useQueryClient();
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const phoneMutation = useMutation({
    mutationFn: changePhoneNumber,
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["employee", user?.id!] });
    },
  });
  const passwordMutation = useMutation({
    mutationFn: changePasswordEmployee,
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["employee", user?.id!] });
      setConfirmPassword("");
      setPassword("");
    },
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...formData, employee_id: user?.id! };
    console.log("Updated data:", data);
    phoneMutation.mutate(data);
  };

  const changePassword = (event: React.FormEvent) => {
    event.preventDefault();
    if (password.length <= 0 || confirmPassword.length <= 0) {
      toast.error("Password fields cannot be Empty");
    }
    if (password.trim() !== confirmPassword.trim()) {
      toast.error("Password is not matching");
    }
    const data = { password, employee_id: user?.id! };
    passwordMutation.mutate(data);
  };

  if (isError) {
    return <>error</>;
  }

  if (isLoading) {
    return <>Loading...</>;
  }

  if (data) {
    return (
      <>
        <form
          onSubmit={handleSubmit}
          className="max-w-2xl p-6 space-y-5 shadow-md rounded-2xl"
        >
          <h2 className="text-2xl font-bold text-cyan-500 my-4">
            Edit Profile
          </h2>

          {Object.entries(formData).map(([key, value]) => {
            const isReadOnly = key === "employee_id";

            return (
              <div key={key} className="grid gap-1.5">
                <Label htmlFor={key} className="capitalize">
                  {key.replace(/_/g, " ")}
                </Label>
                <Input
                  id={key}
                  name={key}
                  type={key.includes("password") ? "password" : "text"}
                  value={value === null ? "" : value}
                  onChange={handleChange}
                  disabled={isReadOnly}
                  className={isReadOnly ? "bg-muted cursor-not-allowed" : ""}
                />
              </div>
            );
          })}
          <Button type="submit">Save Changes</Button>
        </form>

        <form
          onSubmit={changePassword}
          className="max-w-2xl p-6 space-y-5 shadow-md rounded-2xl"
        >
          <div>
            <h2 className="text-2xl font-bold text-cyan-500 my-2">
              Change Password
            </h2>
            <Label htmlFor={"password"} className="capitalize">
              New Password
            </Label>
            <Input
              className="my-2"
              id={"password"}
              name={"password"}
              type={"password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Label htmlFor={"password"} className="capitalize mt-3">
              Confirm New Password
            </Label>
            <Input
              className="my-2"
              id={"confirmPassword"}
              name={"confirmPassword"}
              type={"password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Button type="submit" className="my-2">
              Change Password
            </Button>
          </div>
        </form>
      </>
    );
  }
}
