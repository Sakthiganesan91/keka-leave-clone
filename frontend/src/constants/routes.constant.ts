import {
  Calendar,
  Megaphone,
  Users,
  UserPlus,
  FilePlus,
  ClipboardCheck,
  User,
  BookText,
  UserRoundPen,
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
  {
    title: "Edit Profile",
    url: "/edit-profile",
    icon: UserRoundPen,
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
    title: "Add Employee",
    url: "/create-employee",
    icon: UserPlus,
  },
  {
    title: "Employees",
    url: "/list-employees",
    icon: User,
  },
  {
    title: "Policies",
    url: "/list-policies",
    icon: BookText,
  },
  {
    title: "Add Leave Policies",
    url: "/add-leave-policy",
    icon: FilePlus,
  },
];
