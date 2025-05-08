import { TeamEmployee } from "@/types";
import { Button } from "../ui/button";
import EmployeeLeaveModal from "../modals/EmployeeLeaveModal";
import { Dialog, DialogTrigger } from "../ui/dialog";

const ViewTeamCard = ({ employee }: { employee: TeamEmployee }) => {
  const { name, role, department, designation, employee_id } = employee;
  return (
    <div className="cursor-pointer">
      <div className="bg-gray-800 text-white rounded-xl shadow-2xl p-6 w-full max-w-xs transform transition-all hover:scale-105">
        <h2 className="text-2xl font-bold text-center text-cyan-400 mb-1">
          {name}
        </h2>

        <p className="text-center text-sm text-gray-400 mb-3">{designation}</p>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-300">Role:</span>
            <span className="bg-cyan-500 text-indigo-100 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {role}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-300">Department:</span>
            <span className="text-gray-400">{department} </span>
          </div>
        </div>

        <hr className="border-gray-700 my-4" />

        <div className="text-center">
          <Dialog>
            <DialogTrigger>
              <Button className="font-semibold py-2 px-4 rounded-lg text-sm transition-colors duration-150">
                View Leave History
              </Button>
            </DialogTrigger>
            <EmployeeLeaveModal employee_id={employee_id} />
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default ViewTeamCard;
