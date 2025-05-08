import {
  Calendar,
  Megaphone,
  Search,
  Settings,
  Users,
  UserPlus,
  FilePlus,
  ClipboardCheck,
} from "lucide-react";
export const routes = [
  {
    title: "Apply Leave",
    url: "/",
    icon: Megaphone,
  },

  {
    title: "Calendar",
    url: "/calendar",
    icon: Calendar,
  },
];

export const managerRoutes = [
  {
    title: "View Team",
    url: "/teams",
    icon: Users,
  },

  {
    title: "Approve Leaves",
    url: "/approve",
    icon: ClipboardCheck,
  },
];

export const adminRoutes = [
  {
    title: "Add/Update Employees",
    url: "/create-employee",
    icon: UserPlus,
  },
  {
    title: "Add/Update Leave Policies",
    url: "#",
    icon: FilePlus,
  },
];
