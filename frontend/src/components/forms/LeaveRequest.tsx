import {
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { Button } from "../ui/button";

import { zodResolver } from "@hookform/resolvers/zod";

import { useForm } from "react-hook-form";
import { z } from "zod";

import CustomFormField, { FormFieldTypes } from "../CustomFormField";
import { LeaveFormValidation } from "@/lib/validation";

import { Form, FormControl } from "../ui/form";
import { useMemo, useState } from "react";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { SelectItem } from "../ui/select";
import { calculateCustomLeaveHours } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addLeaveReqest } from "@/apis/leave";
import { useAuth } from "@/context/auth";
import { toast } from "sonner";

const LeaveRequest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const form = useForm<z.infer<typeof LeaveFormValidation>>({
    resolver: zodResolver(LeaveFormValidation),
    defaultValues: {
      start_date: new Date(),
      end_date: new Date(),
      leave_reason: ""!,
      leaveType: "",
      halfday: "",
      start_date_half: "",
      end_date_half: "",
    },
  });

  const leaveRequestMutation = useMutation({
    mutationFn: ({
      employeeId,
      leaveRequest,
    }: {
      employeeId: number;
      leaveRequest: {
        start_date: string;
        end_date: string;
        noofdays: number;
        leave_reason: string;
        leaveType: string;
        is_half_day: boolean;
      };
    }) => addLeaveReqest(employeeId, leaveRequest),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["leavesByStatus", "pending"],
      });

      queryClient.invalidateQueries({
        queryKey: ["leavesByEmployeeId", user?.id!],
      });

      queryClient.invalidateQueries({
        queryKey: ["leavesByMonth", user?.id!],
      });

      queryClient.invalidateQueries({
        queryKey: ["getRemainingLeaves", user?.id],
      });
      console.log(data);
      toast.success(data.message);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data.error);
      console.log(error);
    },
  });
  const onSubmit = async (values: z.infer<typeof LeaveFormValidation>) => {
    setIsLoading(true);
    const { startD: start_date, endD: end_date } = calculateCustomLeaveHours({
      startDate: values.start_date,
      endDate: values.end_date,
      start_date_half: values.start_date_half,
      end_date_half: values.end_date_half,
      halfday: values.halfday,
    });

    const leaveRequest = {
      start_date,
      end_date,
      noofdays: diffInDays,
      leave_reason: values.leave_reason,
      leaveType: values.leaveType,
      is_half_day: values.halfday === "custom" ? true : false,
    };

    leaveRequestMutation.mutate({ employeeId: user?.id!, leaveRequest });
    form.reset();
    setIsLoading(false);
  };

  const countOfDates = useMemo(() => {
    const startDate = form.getValues().start_date;
    const endDate = form.getValues().end_date;
    console.log(startDate.getDate() === endDate.getDate() ? 1 : 2);
    return startDate.getDate() === endDate.getDate() ? 1 : 2;
  }, [
    form.watch("start_date"),
    form.watch("end_date"),
    form.watch("start_date_half"),
    form.watch("end_date_half"),
  ]);

  const diffInDays = useMemo(() => {
    const startDate = form.getValues().start_date;
    const endDate = form.getValues().end_date;
    const startDayHalf = form.getValues().start_date_half;
    const endDayHalf = form.getValues().end_date_half;

    if (
      startDate &&
      endDate &&
      (startDayHalf || endDayHalf) &&
      form.getValues().halfday
    ) {
      const { totalDays } = calculateCustomLeaveHours({
        startDate: startDate,
        endDate: endDate,
        start_date_half: startDayHalf,
        end_date_half: endDayHalf,
        halfday: form.getValues().halfday,
      });

      return totalDays;
    }
    if (
      startDate &&
      endDate &&
      startDate.toDateString() === endDate.toDateString()
    )
      return 1;
    if (!startDate || !endDate || startDate > endDate) return 0;
    return startDate && endDate
      ? Math.ceil(
          (new Date(endDate).getTime() - new Date(startDate).getTime()) /
            (1000 * 60 * 60 * 24)
        ) + 1
      : 0;
  }, [
    form.watch("start_date"),
    form.watch("end_date"),
    form.watch("start_date_half"),
    form.watch("end_date_half"),
    form.watch("halfday"),
  ]);

  const showCustomSelection = useMemo(() => {
    const option = form.getValues().halfday;

    if (option === "custom") return true;
    return false;
  }, [form.watch("halfday")]);

  const styles = {
    maxWidth: "40vw",
  };
  return (
    <SheetContent style={styles}>
      <SheetHeader>
        <SheetTitle>Apply Leave Request</SheetTitle>
      </SheetHeader>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex-1 space-y-3 mx-10"
        >
          <div className="grid gap-4 py-4">
            <>
              <CustomFormField
                fieldType={FormFieldTypes.DATE_PICKER}
                control={form.control}
                name="start_date"
                label="Leave Start Date"
                dateformat="dd/MM/yyyy"
                iconSrc="/calendar.svg"
              />

              <CustomFormField
                fieldType={FormFieldTypes.DATE_PICKER}
                control={form.control}
                name="end_date"
                label="Leave End Date"
                dateformat="dd/MM/yyyy"
                iconSrc="/calendar.svg"
              />

              <p className="font-bold">
                No Of Days <span className="text-gray-500">{diffInDays}</span>
              </p>

              <CustomFormField
                fieldType={FormFieldTypes.SELECT}
                control={form.control}
                name="halfday"
                label="Type"
                placeholder="Choose Timing"
              >
                {["Full Day", "Custom"].map((option) => (
                  <SelectItem key={option} value={option.toLowerCase()}>
                    <div className="flex cursor-pointer items-center gap-2">
                      <p>{option}</p>
                    </div>
                  </SelectItem>
                ))}
              </CustomFormField>

              {showCustomSelection && (
                <div className="flex gap-4">
                  <div className="font-medium">
                    <p>
                      {diffInDays > 1 ? "From" : "On"}{" "}
                      {form.getValues().start_date.toDateString()}
                    </p>
                    <CustomFormField
                      fieldType={FormFieldTypes.SELECT}
                      control={form.control}
                      name="start_date_half"
                      placeholder="AM"
                    >
                      {["AM", "PM"].map((option) => (
                        <SelectItem key={option} value={option.toLowerCase()}>
                          <div className="flex cursor-pointer items-center gap-2">
                            <p>{option}</p>
                          </div>
                        </SelectItem>
                      ))}
                    </CustomFormField>
                  </div>
                  {diffInDays >= 1 && countOfDates === 2 && (
                    <div className="font-medium">
                      <p>To {form.getValues().end_date.toDateString()}</p>
                      <CustomFormField
                        fieldType={FormFieldTypes.SELECT}
                        control={form.control}
                        name="end_date_half"
                        placeholder="AM"
                      >
                        {["AM", "PM"].map((option) => (
                          <SelectItem key={option} value={option.toLowerCase()}>
                            <div className="flex cursor-pointer items-center gap-2">
                              <p>{option}</p>
                            </div>
                          </SelectItem>
                        ))}
                      </CustomFormField>
                    </div>
                  )}
                </div>
              )}
              <CustomFormField
                fieldType={FormFieldTypes.SKELETON}
                control={form.control}
                name="leaveType"
                label="Leave Type"
                renderSkeleton={(field) => {
                  return (
                    <FormControl>
                      <RadioGroup
                        className="flex h-11 gap-6 xl:justify-between"
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        {["Floater", "Casual", "Sick", "Earned"].map(
                          (option) => (
                            <div key={option} className="radio-group">
                              <RadioGroupItem value={option} id={option} />

                              <Label
                                htmlFor={option}
                                className="cursor-pointer"
                              >
                                {option}
                              </Label>
                            </div>
                          )
                        )}
                      </RadioGroup>
                    </FormControl>
                  );
                }}
              />

              <CustomFormField
                fieldType={FormFieldTypes.TEXTAREA}
                control={form.control}
                name="leave_reason"
                label="Leave Reason"
                placeholder="Leave Reason"
              />
            </>

            <SheetFooter>
              <div className="flex justify-between gap-1">
                <SheetClose asChild>
                  <Button type="button" className="flex-2">
                    Cancel
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button type="submit" className="flex-2">
                    {isLoading ? "Loading" : "Apply"}
                  </Button>
                </SheetClose>
              </div>
            </SheetFooter>
          </div>
        </form>
      </Form>
    </SheetContent>
  );
};

export default LeaveRequest;
