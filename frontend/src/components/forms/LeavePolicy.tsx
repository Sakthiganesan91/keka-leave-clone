import { useForm, Controller } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";

import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { LeavePolicyFormValues } from "@/types";
import { addPolicies } from "@/apis/policies";
import { toast } from "sonner";

const leaveTypes = ["casual", "sick", "earned", "maternity", "paternity"];

export default function LeavePolicyForm() {
  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<LeavePolicyFormValues>({
    defaultValues: {
      leave_type_name: "",
      need_approval: false,
      allow_half_day: false,
      max_days_per_year: 0,
      paid: false,
      deduct_salary: false,
      approval_level_needed: 1,
      max_days_per_month: 0,
      not_approved_leave: {},
      roll_over_allowed: false,
      roll_over_count: 0,
      roll_over_monthly_allowed: false,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: LeavePolicyFormValues) => addPolicies(data),
    onSuccess: () => {
      toast.success("Leave Policy Saved");

      reset();
    },
    onError: () => toast.error("Error saving policy"),
  });

  const onSubmit = (data: LeavePolicyFormValues) => {
    mutation.mutate(data);
  };

  const constraints = {
    required: true,
    valueAsNumber: true,
  };
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 max-w-4xl mx-auto"
    >
      <div>
        <div>
          <Label htmlFor="leave_type_name" className="my-[16px]">
            Leave Type Name
          </Label>
          <Input
            {...register("leave_type_name", { required: true })}
            id="leave_type_name"
          />
          {errors.leave_type_name && (
            <p className="text-red-500 text-sm">This field is required</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="max_days_per_year" className="my-[16px]">
            Max Days Per Year
          </Label>
          <Input
            type="number"
            id="max_days_per_year"
            {...register("max_days_per_year", {
              required: true,
              valueAsNumber: true,
            })}
          />
        </div>
        <div>
          <Label htmlFor="approval_level_needed" className="my-[16px]">
            Approval Level Needed
          </Label>
          <Input
            type="number"
            id="approval_level_needed"
            {...register("approval_level_needed", constraints)}
          />
        </div>
        <div>
          <Label htmlFor="max_days_per_month" className="my-[16px]">
            Max Days Per Month
          </Label>
          <Input
            type="number"
            id="max_days_per_month"
            {...register("max_days_per_month", constraints)}
          />
        </div>
        <div>
          <Label htmlFor="roll_over_count" className="my-[16px]">
            Roll Over Count
          </Label>
          <Input
            type="number"
            id="roll_over_count"
            {...register("roll_over_count", constraints)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { name: "need_approval", label: "Need Approval" },
          { name: "allow_half_day", label: "Allow Half Day" },
          { name: "paid", label: "Paid Leave" },
          { name: "deduct_salary", label: "Deduct Salary" },
          { name: "roll_over_allowed", label: "Roll Over Allowed" },
          {
            name: "roll_over_monthly_allowed",
            label: "Monthly Roll Over Allowed",
          },
        ].map(({ name, label }) => (
          <div
            key={name}
            className="flex items-center justify-between border p-2 rounded-md"
          >
            <Label htmlFor={name} className="my-[16px]">
              {label}
            </Label>
            <Controller
              name={name as keyof LeavePolicyFormValues}
              control={control}
              render={({ field }) => (
                <Switch
                  id={name}
                  checked={Boolean(field.value)}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>
        ))}
      </div>
      <div>
        <Label className="block my-4">Not Approved Consecutive Leaves</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {leaveTypes.map((type) => {
            const current = watch("not_approved_leave") || {};
            const isChecked = type in current;

            const toggleCheckbox = (checked: boolean) => {
              const updated = { ...current };
              if (checked) {
                updated[type.toLowerCase()] = type.toLowerCase();
              } else {
                delete updated[type.toLowerCase()];
              }
              setValue("not_approved_leave", updated);
            };

            return (
              <div key={type} className="flex items-center gap-2">
                <Checkbox
                  id={`not_approved_${type}`}
                  checked={isChecked}
                  onCheckedChange={toggleCheckbox}
                />
                <Label htmlFor={`not_approved_${type}`}>{type}</Label>
              </div>
            );
          })}
        </div>
      </div>

      <Button type="submit" className="mt-6" disabled={mutation.isPending}>
        {mutation.isPending ? "Submitting..." : "Submit"}
      </Button>
    </form>
  );
}
