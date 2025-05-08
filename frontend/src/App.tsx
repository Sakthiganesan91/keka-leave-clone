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
function App() {
  const { user } = useAuth();

  return (
    <div className="grid grid-cols-12">
      <SidebarProvider className="col-span-3">
        {user ? (
          <>
            <AppSidebar />
            <SidebarTrigger />
          </>
        ) : null}
      </SidebarProvider>
      <div className="col-span-9 mx-1.5">
        <Routes>
          <Route
            path="/"
            element={user ? <MainPage /> : <Navigate to={"/login"} />}
          />
          <Route
            path="/calendar"
            element={user ? <CalendarPage /> : <Navigate to={"/login"} />}
          />
          <Route
            path="/approve"
            element={
              user && highLevelAuthors.includes(user?.role) ? (
                <ApproveLeave />
              ) : (
                <Navigate to={"/"} />
              )
            }
          />
          <Route
            path="/teams"
            element={
              user && highLevelAuthors.includes(user?.role) ? (
                <ViewTeam />
              ) : (
                <Navigate to={"/"} />
              )
            }
          />

          {user && user?.role === "admin" && (
            <>
              <Route path="/create-employee" element={<>Hello</>} />
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
