'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function PostShift() {
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    role: '',
    location: '',
    pay: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Shift posted successfully! (Demo)");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Post a Shift</h1>

      <Card className="bg-zinc-950 border-zinc-800">
        <CardHeader>
          <CardTitle>Shift Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Date</Label>
                <Input type="date" className="bg-zinc-900 border-zinc-700" />
              </div>
              <div>
                <Label>Role</Label>
                <Select>
                  <SelectTrigger className="bg-zinc-900 border-zinc-700">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nurse">Nurse</SelectItem>
                    <SelectItem value="retail">Retail Worker</SelectItem>
                    <SelectItem value="warehouse">Warehouse Staff</SelectItem>
                    <SelectItem value="security">Security Guard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Time</Label>
                <Input type="time" className="bg-zinc-900 border-zinc-700" />
              </div>
              <div>
                <Label>End Time</Label>
                <Input type="time" className="bg-zinc-900 border-zinc-700" />
              </div>
            </div>

            <div>
              <Label>Location</Label>
              <Input placeholder="e.g. Lagos" className="bg-zinc-900 border-zinc-700" />
            </div>

            <div>
              <Label>Pay Rate (₦/hr)</Label>
              <Input type="number" placeholder="4500" className="bg-zinc-900 border-zinc-700" />
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea placeholder="Additional information" className="bg-zinc-900 border-zinc-700 min-h-[100px]" />
            </div>

            <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700">
              Post Shift
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
