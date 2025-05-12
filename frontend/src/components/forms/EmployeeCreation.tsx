import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { EmployeeLoginFormValidation } from "@/lib/validation";
import "react-phone-number-input/style.css";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth";
import CustomFormField, { FormFieldTypes } from "../CustomFormField";
import { Form } from "../ui/form";
import { Button } from "../ui/button";

const EmployeeCreation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const [isError, setIsError] = useState(false);

  const { user } = useAuth();
  const form = useForm<z.infer<typeof EmployeeLoginFormValidation>>({
    resolver: zodResolver(EmployeeLoginFormValidation),

    defaultValues: {
      ...EmployeeLoginFormValidation,

      email: "",
      password: "",
    },
  });

  const onSubmit = async (
    values: z.infer<typeof EmployeeLoginFormValidation>
  ) => {
    setIsLoading(true);

    setIsLoading(false);
  };
  return (
    <div>
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

          <Button disabled={isLoading}>
            {isLoading ? "Loading" : "Login"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default EmployeeCreation;
