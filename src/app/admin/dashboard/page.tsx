"use client";

import { Header } from "@/components/shared/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, CheckSquare, TrendingUp } from "lucide-react";

const stats = [
  { label: "Total Events", value: "147", icon: Calendar, trend: "+12 this month" },
  { label: "Active Advisors", value: "23", icon: Users, trend: "3 new" },
  { label: "Check-in Rate", value: "72%", icon: CheckSquare, trend: "+5% vs last month" },
  { label: "No-show Rate", value: "28%", icon: TrendingUp, trend: "-5% vs last month" },
];

export default function AdminDashboardPage() {
  return (
    <>
      <Header title="Admin Dashboard" />
      <div className="p-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-[#64748b]">
                  {stat.label}
                </CardTitle>
                <stat.icon className="h-5 w-5 text-[#64748b]" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-[#1a1a2e]">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-[#64748b]">{stat.trend}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-[#1a1a2e]">
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base text-[#64748b]">
                Upcoming events across all advisors will be listed here.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-[#1a1a2e]">
                Pending Approvals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base text-[#64748b]">
                Events awaiting your review and approval.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
