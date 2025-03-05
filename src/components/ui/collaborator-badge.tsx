
import React from "react";
import { BadgeProps, Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CollaboratorBadgeProps extends BadgeProps {
  status: "pending" | "accepted" | "rejected";
}

const CollaboratorBadge = ({
  status,
  className,
  ...props
}: CollaboratorBadgeProps) => {
  const statusClasses = {
    pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    accepted: "bg-green-100 text-green-800 hover:bg-green-200",
    rejected: "bg-red-100 text-red-800 hover:bg-red-200",
  };

  return (
    <Badge
      variant="outline"
      className={cn(statusClasses[status], className)}
      {...props}
    />
  );
};

export default CollaboratorBadge;
