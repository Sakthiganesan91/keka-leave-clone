import LeavePolicy from "@/components/forms/LeavePolicy";

const AddLeavePolicy = () => {
  return (
    <div className="my-4">
      <p className="text-2xl my-4 text-cyan-400 font-bold">Add New Policy</p>
      <div>
        <LeavePolicy />
      </div>
    </div>
  );
};

export default AddLeavePolicy;
