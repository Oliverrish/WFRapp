"use client";

import { Header } from "@/components/shared/header";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users } from "lucide-react";

export default function EventsPage() {
  return (
    <>
      <Header title="Events" />
      <div className="p-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f0f4f8]">
              <Calendar className="h-8 w-8 text-[#1e3a5f]" />
            </div>
            <h2 className="text-xl font-semibold text-[#1a1a2e]">
              Your Events
            </h2>
            <p className="mt-2 max-w-sm text-base text-[#64748b]">
              Your upcoming and past events will appear here. Create your first event to get started.
            </p>
          </CardContent>
        </Card>

        {/* Example event row (static placeholder) */}
        <Card className="mt-6">
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm font-medium text-[#64748b]">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Time</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4 text-right">
                    <Users className="ml-auto h-4 w-4" />
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="text-sm text-[#1a1a2e]">
                  <td className="px-6 py-4 font-medium">Apr 15</td>
                  <td className="px-6 py-4">6:00 - 7:00 pm</td>
                  <td className="px-6 py-4">Scotch & Sirloin Restaurant (Florida)</td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm">
                      <sup>4</sup>/<sub>6</sub>{" "}
                      <span className="text-[#64748b]">(67%)</span>
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
