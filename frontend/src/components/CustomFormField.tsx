import React, { Dispatch, SetStateAction } from "react";
import { Eye, EyeOff } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import "react-phone-number-input/style.css";

import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

import PhoneInput from "react-phone-number-input";
import { Control } from "react-hook-form";

import { E164Number } from "libphonenumber-js";
import { Select, SelectContent, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";

export enum FormFieldTypes {
  INPUT = "input",
  TEXTAREA = "textarea",
  PHONE_INPUT = "phoneInput",
  CHECKBOX = "checkbox",
  DATE_PICKER = "datePicker",
  SELECT = "select",
  SKELETON = "skeleton",
  PASSWORD = "password",
}
interface CustomProps {
  control: Control<any>;
  fieldType: FormFieldTypes;
  name: string;
  label?: string;
  placeholder?: string;
  iconSrc?: string;
  iconAlt?: string;
  disabled?: boolean;
  dateformat?: string;
  showTimeSelect?: boolean;
  children?: React.ReactNode;
  showPassword?: boolean;
  setShowPassword?: Dispatch<SetStateAction<boolean>>;
  renderSkeleton?: (field: any) => React.ReactNode;
}

const RenderField = ({ field, props }: { field: any; props: CustomProps }) => {
  const {
    fieldType,
    name,
    label,
    placeholder,
    iconSrc,
    iconAlt,
    showTimeSelect,
    dateformat,
    renderSkeleton,
    showPassword,
    setShowPassword,
  } = props;
  switch (fieldType) {
    case FormFieldTypes.INPUT:
      return (
        <div className="flex rounded-md border border-dark-500 bg-dark-400">
          {iconSrc && (
            <img
              src={iconSrc}
              height={24}
              width={24}
              alt={iconAlt || "icon"}
              className="ml-2"
            />
          )}
          <FormControl>
            <Input
              placeholder={placeholder}
              {...field}
              className="shad-input border-0"
            />
          </FormControl>
        </div>
      );

    case FormFieldTypes.PHONE_INPUT:
      return (
        <div>
          <PhoneInput
            defaultCountry="IN"
            placeholder={placeholder}
            international
            withCountryCallingCode
            value={field.value as E164Number | undefined}
            onChange={field.onChange}
            className="input-phone"
          />
        </div>
      );

    case FormFieldTypes.DATE_PICKER:
      return (
        <div className="flex rounded-md border border-dark-500 bg-dark-400 ">
          <img
            src="/calendar.svg"
            alt="calendar"
            height={24}
            width={24}
            className="ml-2"
          />
          <FormControl>
            <DatePicker
              selected={field.value}
              autoFocus={false}
              onChange={(date) => field.onChange(date)}
              dateFormat={dateformat ?? "dd/MM/yyyy"}
              showTimeSelect={showTimeSelect ?? false}
              timeInputLabel="Time : "
              wrapperClassName="date-picker"
            />
          </FormControl>
        </div>
      );
    case FormFieldTypes.SKELETON:
      return renderSkeleton ? <>{renderSkeleton(field)}</> : null;
    case FormFieldTypes.SELECT:
      return (
        <FormControl>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger className="shad-select-trigger">
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent className="shad-select-content">
              {props.children}
            </SelectContent>
          </Select>
        </FormControl>
      );

    case FormFieldTypes.TEXTAREA:
      return (
        <FormControl>
          <Textarea
            placeholder={placeholder}
            {...field}
            className="shad-textArea"
            disabled={props.disabled}
          />
        </FormControl>
      );
    case FormFieldTypes.CHECKBOX:
      return (
        <FormControl>
          <div className="flex items-center gap-4">
            <Checkbox
              id={name}
              checked={field.value}
              onCheckedChange={field.onChange}
            />
            <label htmlFor={name} className="checkbox-label">
              {label}
            </label>
          </div>
        </FormControl>
      );
    case FormFieldTypes.PASSWORD:
      return (
        <div className="flex rounded-md border border-dark-500 bg-dark-400 items-center">
          <FormControl>
            <Input
              placeholder={placeholder}
              {...field}
              type={showPassword ? "input" : "password"}
              className="shad-input border-0"
            />
          </FormControl>

          <button
            className="shad-input border-0 mx-1.5"
            type="button"
            onClick={() => setShowPassword && setShowPassword(!showPassword)}
          >
            {!showPassword ? <Eye /> : <EyeOff />}
          </button>
        </div>
      );

    default:
      return null;
  }
};

function CustomFormField(props: CustomProps) {
  const { control, fieldType, name, label } = props;
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex-1">
          {fieldType !== FormFieldTypes.CHECKBOX && label && (
            <FormLabel>{label}</FormLabel>
          )}

          <RenderField field={field} props={props} />
          <FormMessage className="shad-error" />
        </FormItem>
      )}
    />
  );
}

export default CustomFormField;
