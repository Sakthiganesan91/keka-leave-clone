import PendingLeaveTab from "@/components/home/PendingLeaveTab";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import LeaveRequest from "@/components/forms/LeaveRequest";
import MyLeaves from "@/components/home/MyLeaves";
import ShowRemainingLeaves from "@/components/home/ShowRemainingLeaves";
const MainPage = () => {
  return (
    <div className="my-6">
      <div className="flex justify-end">
        <Sheet>
          <div className="overflow-x-auto rounded-lg my-5">
            <SheetTrigger>
              <Button>Request Leave</Button>
            </SheetTrigger>
          </div>
          <LeaveRequest />
        </Sheet>
      </div>

      <div>
        <PendingLeaveTab />
      </div>
      <hr className="my-8" />
      <div>
        <div className="my-4 text-xl font-bold text-cyan-500">
          Remaining Leaves
        </div>
        <div>
          <ShowRemainingLeaves />
        </div>
      </div>
      <hr className="my-8" />
      <div className="my-4 text-xl font-bold text-cyan-500">
        My Leave Request
      </div>

      <div>
        <MyLeaves />
      </div>
    </div>
  );
};

export default MainPage;
