import { TeamEmployee } from "@/types";

const EmployeeCard = ({
  employee,
  isSelected,
}: {
  employee: TeamEmployee;
  isSelected: boolean;
}) => {
  const { name, role, department, designation } = employee;

  return (
    <div
      className={`cursor-pointer bg-gray-800 text-white rounded-xl shadow-2xl p-4 w-full transform transition-all hover:scale-105 my-2 ${
        isSelected ? "border-2 border-cyan-300" : ""
      }`}
    >
      <div className="flex gap-2 items-center">
        <h2 className="text-xs font-bold text-cyan-400 mb-0.5 text-left">
          {name}
        </h2>
        <div className="flex justify-between items-center">
          <span className="bg-cyan-700 text-indigo-100 text-xs font-semibold px-2 py-0.5 rounded-full">
            {role}
          </span>
        </div>
      </div>

      <p className="text-xs text-gray-400 my-2 text-left font-medium">
        {designation} -{" "}
        <span className="text-gray-400 text-xs">{department}</span>
      </p>
    </div>
  );
};

export default EmployeeCard;
