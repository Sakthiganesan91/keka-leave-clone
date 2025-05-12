import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Form } from "@/components/ui/form";

import { EmployeeLoginFormValidation } from "@/lib/validation";

import "react-phone-number-input/style.css";
import CustomFormField, { FormFieldTypes } from "../CustomFormField";
import { useMutation } from "@tanstack/react-query";
import { login } from "@/apis/auth";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth";

const RegisterForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const [isError, setIsError] = useState(false);

  const { setUser, login: loginGlobal } = useAuth();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof EmployeeLoginFormValidation>>({
    resolver: zodResolver(EmployeeLoginFormValidation),

    defaultValues: {
      ...EmployeeLoginFormValidation,

      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: (values: { email: string; password: string }) =>
      login({ ...values }),

    onSuccess: (data) => {
      console.log(data);

      setUser({
        role: data.user.role,
        email: data.user.email,
        id: data.user.employee_id,
      });
      loginGlobal({
        role: data.user.role,
        email: data.user.email,
        id: data.user.employee_id,
      });
      navigate("/");
    },
    onError: (error: any) => {
      setError(error.response.data.message);
      setIsError(true);
    },
  });
  const onSubmit = async (
    values: z.infer<typeof EmployeeLoginFormValidation>
  ) => {
    setIsLoading(true);

    loginMutation.mutate({ ...values });

    setIsLoading(false);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex-1 space-y-12"
      >
        <div className="flex flex-col gap-6 xl:flex-row">
          <CustomFormField
            fieldType={FormFieldTypes.INPUT}
            control={form.control}
            name="email"
            label="Email"
            placeholder="email@example.com"
          />

          <CustomFormField
            fieldType={FormFieldTypes.PASSWORD}
            control={form.control}
            name="password"
            label="Password"
            placeholder="Password"
            setShowPassword={setShowPassword}
            showPassword={showPassword}
          />
          <div className="text-red-500"> {isError && error}</div>
        </div>

        <Button disabled={isLoading}>{isLoading ? "Loading" : "Login"}</Button>
      </form>
    </Form>
  );
};
export default RegisterForm;
