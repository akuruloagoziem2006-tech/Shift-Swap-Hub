'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin } from "lucide-react";

const myShifts = [
  { id: 1, type: "Posted", role: "Nurse", date: "2026-06-25", time: "07:00 - 15:00", location: "Lagos General Hospital", status: "Pending" },
  { id: 2, type: "Accepted", role: "Security Guard", date: "2026-06-24", time: "20:00 - 06:00", location: "Victoria Island", status: "Confirmed" },
];

export default function MyShifts() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">My Shifts</h1>

      <div className="space-y-6">
        {myShifts.map((shift) => (
          <Card key={shift.id} className="bg-zinc-950 border-zinc-800">
            <CardHeader>
              <div className="flex justify-between">
                <CardTitle>{shift.role}</CardTitle>
                <Badge variant={shift.status === "Confirmed" ? "default" : "secondary"}>{shift.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-teal-500" />
                  <div>{shift.date}</div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-teal-500" />
                  <div>{shift.time}</div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-teal-500" />
                  <div>{shift.location}</div>
                </div>
              </div>
              <Button variant="outline" size="sm">View Details</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
