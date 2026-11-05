import { redirect } from 'next/navigation';
import { createClient } from './supabase/server';
import { adminClient } from './supabase/admin';
import type { Profile, Role } from '@/types/core';

export async function getCurrentUser(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  // Fetch profile from database
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, role, full_name, email, created_at')
    .eq('id', user.id)
    .single();

  if (error || !profile) {
    // If trigger hadn't fired or profile missing, fallback or auto-create via admin
    const metaRole = (user.user_metadata?.role as Role) || 'candidate';
    const metaName = user.user_metadata?.full_name || null;
    const metaEmail = user.email || null;

    try {
      await adminClient.from('profiles').upsert({
        id: user.id,
        role: metaRole,
        full_name: metaName,
        email: metaEmail,
      });
    } catch {
      // ignore error
    }

    return {
      id: user.id,
      role: metaRole,
      full_name: metaName,
      email: metaEmail,
    };
  }

  return profile as Profile;
}

export async function requireRole(role: Role | Role[]): Promise<Profile> {
  const profile = await getCurrentUser();

  if (!profile) {
    redirect('/login');
  }

  const allowedRoles = Array.isArray(role) ? role : [role];
  if (!allowedRoles.includes(profile.role)) {
    if (profile.role === 'recruiter') {
      redirect('/recruiter');
    } else {
      redirect('/candidate');
    }
  }

  return profile;
}
