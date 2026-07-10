'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import type { Profile } from '@/lib/types';

const DEPARTMENTS = [
  'Healthcare',
  'Retail',
  'Warehouse',
  'Security',
  'Hospitality',
  'Transportation',
  'Manufacturing',
  'Other',
];

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [profile, setProfile] = useState<Partial<Profile>>({
    full_name: '',
    role: 'employee',
    department: '',
    avatar_url: null,
  });

  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch user and profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          router.push('/auth');
          return;
        }

        setUserId(user.id);
        setEmail(user.email || '');

        // Fetch profile from database
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Profile fetch error:', profileError);
        }

        if (profileData) {
          setProfile({
            full_name: profileData.full_name || '',
            role: profileData.role || 'employee',
            department: profileData.department || '',
            avatar_url: profileData.avatar_url || null,
          });
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [supabase, router]);

  const handleSave = async () => {
    if (!userId) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          email,
          full_name: profile.full_name || null,
          role: profile.role as 'employee' | 'manager' | 'admin',
          department: profile.department || null,
          updated_at: new Date().toISOString(),
        });

      if (updateError) {
        throw updateError;
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string | null | undefined): string => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      {error && (
        <Alert variant="destructive" className="mb-6 bg-red-500/10 border-red-500/20">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 bg-teal-500/10 border-teal-500/20">
          <CheckCircle className="h-4 w-4 text-teal-500" />
          <AlertDescription className="text-teal-500">Profile saved successfully!</AlertDescription>
        </Alert>
      )}

      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex flex-col items-center mb-6">
            <Avatar className="w-24 h-24 mb-4">
              <AvatarImage src={profile.avatar_url || ''} />
              <AvatarFallback className="text-4xl bg-zinc-800 text-zinc-400">
                {getInitials(profile.full_name)}
              </AvatarFallback>
            </Avatar>
            <p className="text-sm text-zinc-500">Profile photo coming soon</p>
          </div>

          {/* Email (read-only) */}
          <div>
            <Label htmlFor="email" className="text-zinc-300">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              disabled
              className="bg-zinc-800 border-zinc-700 text-zinc-500"
            />
            <p className="text-xs text-zinc-500 mt-1">Email cannot be changed</p>
          </div>

          {/* Full Name */}
          <div>
            <Label htmlFor="fullName" className="text-zinc-300">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="John Doe"
              value={profile.full_name || ''}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>

          {/* Role */}
          <div>
            <Label htmlFor="role" className="text-zinc-300">Role</Label>
            <Select
              value={profile.role}
              onValueChange={(value) => setProfile({ ...profile, role: value as 'employee' | 'manager' | 'admin' })}
            >
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Department */}
          <div>
            <Label htmlFor="department" className="text-zinc-300">Department</Label>
            <Select
              value={profile.department || ''}
              onValueChange={(value) => setProfile({ ...profile, department: value })}
            >
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Profile'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Account Section */}
      <Card className="mt-6 bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Sign out</p>
              <p className="text-sm text-zinc-500">Sign out of your account on this device</p>
            </div>
            <Button
              variant="outline"
              onClick={async () => {
                await supabase.auth.signOut();
                router.push('/auth');
              }}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}