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
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Employee {
  employee_id: number;
  phone_number: string | null;
}

export default function EditEmployeeForm() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formData, setFormData] = useState<Employee | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryFn: () => getEmployeeById(user?.id!),
    queryKey: ["employee", user?.id!],
  });

  useEffect(() => {
    if (data) {
      setFormData(data);
    }
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            [name]: value,
          }
        : null
    );
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
      setPassword("");
      setConfirmPassword("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    phoneMutation.mutate({ ...formData, employee_id: user?.id! });
  };

  const changePassword = (event: React.FormEvent) => {
    event.preventDefault();
    if (!password || !confirmPassword) {
      toast.error("Password fields cannot be Empty");
      return;
    }
    if (password.trim() !== confirmPassword.trim()) {
      toast.error("Passwords do not match");
      return;
    }
    passwordMutation.mutate({ password, employee_id: user?.id! });
  };

  if (isError) return <>Error loading data</>;
  if (isLoading || !formData) return <>Loading...</>;

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="max-w-2xl p-6 space-y-5 shadow-md rounded-2xl"
      >
        <h2 className="text-2xl font-bold text-cyan-500 my-4">Edit Profile</h2>

        <div className="grid gap-1.5">
          <Label htmlFor="employee_id" className="capitalize my-2">
            Employee ID
          </Label>
          <Input
            id="employee_id"
            name="employee_id"
            type="text"
            value={formData.employee_id ?? ""}
            disabled
            className="bg-muted cursor-not-allowed"
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="phone_number" className="capitalize my-2">
            Phone Number
          </Label>
          <Input
            id="phone_number"
            name="phone_number"
            type="text"
            value={formData.phone_number ?? ""}
            onChange={handleChange}
          />
        </div>

        <Button type="submit">Save Changes</Button>
      </form>

      <form
        onSubmit={changePassword}
        className="max-w-2xl p-6 space-y-5 shadow-md rounded-2xl"
      >
        <h2 className="text-2xl font-bold text-cyan-500 my-2">
          Change Password
        </h2>
        <Label htmlFor="password">New Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="my-2"
        />

        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="my-2"
        />

        <Button type="submit" className="my-2">
          Change Password
        </Button>
      </form>
    </>
  );
}
