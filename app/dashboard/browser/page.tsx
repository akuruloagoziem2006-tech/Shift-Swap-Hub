'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, DollarSign } from "lucide-react";

const mockShifts = [
  { id: 1, role: "Nurse", date: "2026-06-25", time: "07:00 - 15:00", location: "Lagos General Hospital", pay: "₦5200/hr" },
  { id: 2, role: "Retail Worker", date: "2026-06-26", time: "09:00 - 18:00", location: "Ikeja Mall", pay: "₦2800/hr" },
];

export default function BrowseShifts() {
  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Browse Shifts</h1>

      <div className="grid gap-6">
        {mockShifts.map((shift) => (
          <Card key={shift.id} className="bg-zinc-950 border-zinc-800">
            <CardHeader>
              <CardTitle>{shift.role}</CardTitle>
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
                  <DollarSign className="w-5 h-5 text-teal-500" />
                  <div>{shift.pay}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-teal-500" />
                <div>{shift.location}</div>
              </div>
              <Button className="w-full bg-teal-600 hover:bg-teal-700">I'm Interested</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
