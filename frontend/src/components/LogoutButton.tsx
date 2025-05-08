import { Button } from "../components/ui/button";
import { logout } from "@/apis/auth";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth";
const LogoutButton = () => {
  const { logout: logoutGlobal } = useAuth();
  const navigate = useNavigate();
  const logoutMutation = useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      navigate("/login");
      logoutGlobal();
    },
  });
  return (
    <Button
      type="button"
      onClick={() => logoutMutation.mutate()}
      className="my-4"
    >
      Logout
    </Button>
  );
};

export default LogoutButton;
