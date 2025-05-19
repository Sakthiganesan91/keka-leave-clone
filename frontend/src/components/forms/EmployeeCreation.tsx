import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  employeeCreationFormValidation,
  EmployeeLoginFormValidation,
} from "@/lib/validation";
import "react-phone-number-input/style.css";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth";
import CustomFormField, { FormFieldTypes } from "../CustomFormField";
import { Form, FormControl } from "../ui/form";
import { Button } from "../ui/button";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { createEmployee, getDepartments } from "@/apis/employee";
import { SelectItem } from "../ui/select";
import { EmployeeCreation as EmployeeCreationProp } from "@/types";
import { toast } from "sonner";

const EmployeeCreation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const [isError, setIsError] = useState(false);

  const { user } = useAuth();

  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: getDepartments,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  const form = useForm<z.infer<typeof employeeCreationFormValidation>>({
    resolver: zodResolver(employeeCreationFormValidation),

    defaultValues: {
      ...employeeCreationFormValidation,

      email: "",
      password: "",
      name: "",
      role: "",
      department: "",
      designation: "",
      phone_number: "",
      performanceBonus: "",
      allowances: "",
      basicSalary: "",
      lop_deduction: "",
      in_notice: "",
      max_approval_level: "",
    },
  });

  const createEmployeeMutation = useMutation({
    mutationFn: (values: { values: EmployeeCreationProp }) =>
      createEmployee(values),

    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error: any) => {
      console.log(error);
      setError(error.response.data.message);
      setIsError(true);
    },
  });

  const onSubmit = async (
    values: z.infer<typeof employeeCreationFormValidation>
  ) => {
    setIsLoading(true);
    createEmployeeMutation.mutate({ values });
    setIsLoading(false);
    form.reset();
  };
  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex-1 space-y-12"
        >
          <div className="flex-1 space-y-6 border border-cyan-300 px-2 py-4 rounded-xl">
            <div>
              <p className="text-xl text-cyan-600 font-bold ">Basic Details</p>
            </div>
            <div className="flex flex-col gap-6 xl:flex-row">
              <CustomFormField
                fieldType={FormFieldTypes.INPUT}
                control={form.control}
                name="email"
                label="Email"
                placeholder="email@example.com"
              />

              <CustomFormField
                fieldType={FormFieldTypes.INPUT}
                control={form.control}
                name="name"
                label="Full Name"
                placeholder="Sakthiganesan"
              />

              <div className="text-red-500"> {isError && error}</div>
            </div>
            <div className="flex flex-col gap-6 xl:flex-row">
              <CustomFormField
                fieldType={FormFieldTypes.PASSWORD}
                control={form.control}
                name="password"
                label="Password"
                placeholder="Password"
                setShowPassword={setShowPassword}
                showPassword={showPassword}
              />

              <CustomFormField
                fieldType={FormFieldTypes.PHONE_INPUT}
                control={form.control}
                name="phone_number"
                label="Phone number"
                placeholder="(555) 123-4567"
              />
            </div>
            <div className="flex flex-col gap-6 xl:flex-row">
              <CustomFormField
                fieldType={FormFieldTypes.INPUT}
                control={form.control}
                name="designation"
                label="Designation"
                placeholder="Developer"
              />
              <CustomFormField
                fieldType={FormFieldTypes.INPUT}
                control={form.control}
                name="max_approval_level"
                label="Maximum Approval Level"
                placeholder="Developer"
              />

              <div className="flex gap-6">
                <CustomFormField
                  fieldType={FormFieldTypes.SELECT}
                  control={form.control}
                  name="department"
                  label="Department"
                  placeholder="Select Department"
                >
                  {departments &&
                    departments?.departments.map(
                      (department: { department: string }) => (
                        <SelectItem
                          key={department.department}
                          value={department.department}
                        >
                          <div className="flex cursor-pointer items-center">
                            <p>{department.department}</p>
                          </div>
                        </SelectItem>
                      )
                    )}
                </CustomFormField>
                <CustomFormField
                  fieldType={FormFieldTypes.SELECT}
                  control={form.control}
                  name="role"
                  label="Role"
                  placeholder="Select Role"
                >
                  {["employee", "manager", "hr", "admin"].map((role) => (
                    <SelectItem key={role} value={role}>
                      <div className="flex cursor-pointer items-center">
                        <p>{role.toUpperCase()}</p>
                      </div>
                    </SelectItem>
                  ))}
                </CustomFormField>
              </div>
            </div>
          </div>

          <div className="flex-1 my-4 space-y-8 border border-cyan-300 px-2 py-4 rounded-xl">
            <div>
              <p className="text-xl text-cyan-600 font-bold">Salary Details</p>
            </div>

            <div className="flex flex-col gap-6 xl:flex-row">
              <CustomFormField
                fieldType={FormFieldTypes.INPUT}
                control={form.control}
                name="basicSalary"
                label="Basic Salary"
                placeholder="15000"
              />
              <CustomFormField
                fieldType={FormFieldTypes.INPUT}
                control={form.control}
                name="allowances"
                label="Allowances"
                placeholder="3000"
              />
            </div>
            <div className="flex flex-col gap-6 xl:flex-row">
              <CustomFormField
                fieldType={FormFieldTypes.INPUT}
                control={form.control}
                name="performanceBonus"
                label="Performance Bonus"
                placeholder="5000"
              />
              <CustomFormField
                fieldType={FormFieldTypes.INPUT}
                control={form.control}
                name="lop_deduction"
                label="Loss Of Pay Deduction"
                placeholder="1000"
              />
            </div>
          </div>
          <Button disabled={isLoading}>
            {isLoading ? "Loading" : "Create"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default EmployeeCreation;
