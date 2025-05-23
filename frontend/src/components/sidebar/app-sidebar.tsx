import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  adminRoutes,
  managerRoutes,
  routes,
} from "@/constants/routes.constant";
import LogoutButton from "../LogoutButton";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/auth";
import { highLevelAuthors } from "@/lib/utils";

export function AppSidebar() {
  const { user } = useAuth();
  return (
    <Sidebar
      style={{
        width: "fit-content",
      }}
    >
      <SidebarContent className="bg-black">
        <SidebarGroup>
          <SidebarGroupLabel className="text-1xl text-cyan-500 font-bold my-2">
            Leave Management System
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {routes.map((route) => (
                <SidebarMenuItem
                  key={route.title}
                  className="hover:bg-cyan-600"
                >
                  <SidebarMenuButton asChild>
                    <Link to={route.url}>
                      <route.icon />
                      <span>{route.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {highLevelAuthors.includes(user?.role! || "") &&
                managerRoutes.map((route) => (
                  <SidebarMenuItem
                    key={route.title}
                    className="hover:bg-cyan-600"
                  >
                    <SidebarMenuButton asChild>
                      <Link to={route.url}>
                        <route.icon />
                        <span>{route.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}

              {user?.role! === "admin" &&
                adminRoutes.map((route) => (
                  <SidebarMenuItem
                    key={route.title}
                    className="hover:bg-cyan-600"
                  >
                    <SidebarMenuButton asChild>
                      <Link to={route.url}>
                        <route.icon />
                        <span>{route.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <LogoutButton />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
