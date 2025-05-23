import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./Pages/auth/LoginPage";
import { Toaster } from "@/components/ui/sonner";
import { SidebarProvider, SidebarTrigger } from "./components/ui/sidebar.tsx";
import { AppSidebar } from "./components/sidebar/app-sidebar.tsx";
import MainPage from "./Pages/Home/MainPage.tsx";
import { useAuth } from "./context/auth.tsx";
import CalendarPage from "./Pages/Home/CalendarPage.tsx";
import { highLevelAuthors } from "./lib/utils.ts";
import ApproveLeave from "./Pages/Home/ApproveLeave.tsx";
import ViewTeam from "./Pages/Home/ViewTeam.tsx";
import EmployeeSection from "./Pages/admin/EmployeeSection.tsx";
import AllEmployees from "./Pages/admin/AllEmployees.tsx";
import AddLeavePolicy from "./Pages/admin/AddLeavePolicy.tsx";
import LeavePolicies from "./Pages/admin/LeavePolicies.tsx";

import { io } from "socket.io-client";
import { useEffect } from "react";
import { toast } from "sonner";
import EditProfile from "./Pages/Home/EditProfile.tsx";

function App() {
  const { user } = useAuth();

  const checkHighLevelAuthors = () =>
    user && highLevelAuthors.includes(user?.role);

  const isAdmin = () => user && user?.role === "admin";

  useEffect(() => {
    let socket = io("http://localhost:4000", {
      withCredentials: true,
    });
    const handleMessage = (data: { uploadedBy: number; message: string }) => {
      user?.id === data.uploadedBy &&
        data.message &&
        toast.success(data.message);
    };

    socket.on("job-completed", handleMessage);

    return () => {
      socket.off("message", handleMessage);
    };
  }, []);
  return (
    <div className="grid grid-cols-12">
      {user && (
        <SidebarProvider className="col-span-3">
          <AppSidebar />
          <SidebarTrigger />
        </SidebarProvider>
      )}
      <div className="col-span-9 mx-1">
        <Routes>
          <Route
            path="/"
            element={user ? <MainPage /> : <Navigate to={"/login"} />}
          />
          <Route
            path="/edit-profile"
            element={user ? <EditProfile /> : <Navigate to={"/login"} />}
          />
          <Route
            path="/calendar"
            element={user ? <CalendarPage /> : <Navigate to={"/login"} />}
          />
          <Route
            path="/approve"
            element={
              checkHighLevelAuthors() ? <ApproveLeave /> : <Navigate to={"/"} />
            }
          />
          <Route
            path="/teams"
            element={
              checkHighLevelAuthors() ? <ViewTeam /> : <Navigate to={"/"} />
            }
          />

          {isAdmin() && (
            <>
              <Route path="/create-employee" element={<EmployeeSection />} />

              <Route path="/list-employees" element={<AllEmployees />} />

              <Route path="/list-policies" element={<LeavePolicies />} />

              <Route path="/add-leave-policy" element={<AddLeavePolicy />} />
            </>
          )}

          <Route
            path="/login"
            element={!user ? <LoginPage /> : <Navigate to={"/"} />}
          />
        </Routes>
      </div>

      <Toaster />
    </div>
  );
}

export default App;
