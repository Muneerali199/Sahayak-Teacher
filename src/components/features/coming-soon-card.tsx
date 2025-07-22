"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ComingSoonCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export default function ComingSoonCard({
  title,
  description,
  icon,
}: ComingSoonCardProps) {
  return (
    <div className="flex items-center justify-center h-full">
      <Card className="w-full max-w-lg text-center shadow-lg">
        <CardHeader>
          <div className="mx-auto bg-secondary rounded-full p-3 w-fit text-primary mb-4">
            {icon}
          </div>
          <CardTitle className="font-headline">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Badge variant="outline">Coming Soon</Badge>
        </CardContent>
      </Card>
    </div>
  );
}
