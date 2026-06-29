'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Profile() {
  const [profile, setProfile] = useState({
    name: "John Doe",
    role: "Nurse",
    location: "Lagos",
    hourlyRate: "4800",
    bio: "Experienced nurse with 5+ years.",
    phone: "08012345678"
  });

  const handleSave = () => {
    alert("Profile saved! (Demo)");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      <Card className="bg-zinc-950 border-zinc-800">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center mb-6">
            <Avatar className="w-24 h-24 mb-4">
              <AvatarImage src="" />
              <AvatarFallback className="text-4xl">JD</AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm">Change Photo</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Full Name</Label>
              <Input value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} className="bg-zinc-900 border-zinc-700" />
            </div>
            <div>
              <Label>Job Role</Label>
              <Select value={profile.role} onValueChange={(value) => setProfile({...profile, role: value})}>
                <SelectTrigger className="bg-zinc-900 border-zinc-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Nurse">Nurse</SelectItem>
                  <SelectItem value="Retail Worker">Retail Worker</SelectItem>
                  <SelectItem value="Warehouse Staff">Warehouse Staff</SelectItem>
                  <SelectItem value="Security Guard">Security Guard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Location</Label>
            <Input value={profile.location} onChange={(e) => setProfile({...profile, location: e.target.value})} className="bg-zinc-900 border-zinc-700" />
          </div>

          <div>
            <Label>Hourly Rate (₦/hr)</Label>
            <Input type="number" value={profile.hourlyRate} onChange={(e) => setProfile({...profile, hourlyRate: e.target.value})} className="bg-zinc-900 border-zinc-700" />
          </div>

          <div>
            <Label>Phone</Label>
            <Input value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} className="bg-zinc-900 border-zinc-700" />
          </div>

          <div>
            <Label>Bio</Label>
            <Textarea value={profile.bio} onChange={(e) => setProfile({...profile, bio: e.target.value})} className="bg-zinc-900 border-zinc-700 min-h-[100px]" />
          </div>

          <Button onClick={handleSave} className="w-full bg-teal-600 hover:bg-teal-700">
            Save Profile
          </Button>
        </CardContent
        >
      </Card>
    </div>
  );
}