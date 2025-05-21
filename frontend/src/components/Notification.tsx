import { cn } from "@/lib/utils";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "@/context/auth";

type CardProps = React.ComponentProps<typeof Card>;

type Notification = {
  message: string;
};
export default function Notification({ className, ...props }: CardProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const { user } = useAuth();

  useEffect(() => {
    let socket = io("http://localhost:4000", {
      withCredentials: true,
    });

    const handleJobCompleted = (data: {
      uploadedBy: number;
      message: string;
    }) => {
      console.log(data);
      if (user?.id === data.uploadedBy) {
        setNotifications((prev) => [...prev, { message: data.message }]);
      }
    };

    socket.on("job-completed", handleJobCompleted);

    return () => {
      socket.off("job-completed", handleJobCompleted);
      socket.disconnect();
    };
  }, []);
  return (
    <Card className={cn("w-[480px]")} {...props}>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div>
          {notifications.map((notification, index) => (
            <div
              key={index}
              className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0"
            >
              <span className="flex h-2 w-2 translate-y-1 rounded-full bg-cyan-500" />
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  {notification.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
