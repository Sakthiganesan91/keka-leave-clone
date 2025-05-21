import EmployeeCreation from "@/components/forms/EmployeeCreation";
import { useMutation } from "@tanstack/react-query";
import React, { useState } from "react";
import { toast } from "sonner";
import { uploadFile } from "@/apis/employee";

const EmployeeSection = () => {
  const [loading, setIsLoading] = useState(false);

  const mutation = useMutation({
    mutationFn: uploadFile,
    onSuccess: (data) => {
      console.log("Upload success:", data);
      setIsLoading(false);
      toast.success(data.message);
    },
    onError: (error) => {
      console.log(error);
    },
  });
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsLoading(true);

    const file = event.target.files?.[0];

    if (file) {
      mutation.mutate(file);
    }

    event.target.value = "";
  };
  return (
    <div>
      <div className="my-4 mx-8">
        <div className="flex items-center justify-between m-4">
          <div className="font-bold text-cyan-400 text-2xl my-2">
            Create Employee
          </div>
          <div>
            <label
              htmlFor="file-upload"
              className="inline-flex items-center px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium rounded-lg shadow cursor-pointer transition-colors duration-200"
            >
              {loading ? "Loading..." : "Upload Employee Sheet"}
              <input
                id="file-upload"
                type="file"
                accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet , application/vnd.ms-excel"
                className="hidden"
                onChange={(event) => handleFileUpload(event)}
              />
            </label>
          </div>
        </div>
        <EmployeeCreation />
      </div>
    </div>
  );
};

export default EmployeeSection;
