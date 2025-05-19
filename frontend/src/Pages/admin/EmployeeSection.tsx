import EmployeeCreation from "@/components/forms/EmployeeCreation";
import React from "react";

const EmployeeSection = () => {
  return (
    <div>
      <div className="my-4 mx-8">
        <div className="font-bold text-cyan-400 text-2xl my-2">
          Create Employee
        </div>
        <EmployeeCreation />
      </div>
    </div>
  );
};

export default EmployeeSection;
