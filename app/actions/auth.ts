'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { adminClient } from '@/lib/supabase/admin';
import type { ActionResult, Role } from '@/types/core';

const signUpSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['candidate', 'recruiter']),
});

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function signUp(
  rawInput: Record<string, unknown> | FormData
): Promise<ActionResult<{ redirectUrl: string }>> {
  try {
    const rawData =
      rawInput instanceof FormData
        ? Object.fromEntries(rawInput.entries())
        : rawInput;

    const parsed = signUpSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        ok: false,
        error: parsed.error.issues.map((i) => i.message).join(', '),
      };
    }

    const { full_name, email, password, role } = parsed.data;
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          role,
        },
      },
    });

    if (error || !data.user) {
      if (error?.message?.toLowerCase().includes('rate limit')) {
        return {
          ok: false,
          error:
            "Supabase email rate limit exceeded! Please go to your Supabase Dashboard -> Authentication -> Providers -> Email -> toggle 'Confirm email' to OFF.",
        };
      }
      return { ok: false, error: error?.message || 'Failed to sign up' };
    }

    // Auto-confirm the user's email via admin client so they are never blocked by confirmation
    try {
      await adminClient.auth.admin.updateUserById(data.user.id, {
        email_confirm: true,
      });
    } catch (adminErr) {
      console.warn('Auto-confirm email via admin client failed:', adminErr);
    }

    // Ensure profile row exists in public.profiles table
    await adminClient.from('profiles').upsert({
      id: data.user.id,
      role: role as Role,
      full_name,
      email,
    });

    // Auto sign-in so session cookie is created immediately
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

    const redirectUrl = role === 'recruiter' ? '/recruiter' : '/candidate';
    return { ok: true, data: { redirectUrl } };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown signup error';
    return { ok: false, error: message };
  }
}

export async function signIn(
  rawInput: Record<string, unknown> | FormData
): Promise<ActionResult<{ redirectUrl: string }>> {
  try {
    const rawData =
      rawInput instanceof FormData
        ? Object.fromEntries(rawInput.entries())
        : rawInput;

    const parsed = signInSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        ok: false,
        error: parsed.error.issues.map((i) => i.message).join(', '),
      };
    }

    const { email, password } = parsed.data;
    const supabase = await createClient();

    let { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // If email is not confirmed, auto-confirm it via admin client and retry immediately
    if (error && error.message.toLowerCase().includes('email not confirmed')) {
      try {
        const { data: profile } = await adminClient
          .from('profiles')
          .select('id')
          .eq('email', email)
          .maybeSingle();

        if (profile?.id) {
          await adminClient.auth.admin.updateUserById(profile.id, {
            email_confirm: true,
          });

          // Retry sign-in
          const retry = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          data = retry.data;
          error = retry.error;
        }
      } catch (autoConfirmErr) {
        console.warn('Auto-confirmation attempt error:', autoConfirmErr);
      }
    }

    if (error || !data.user) {
      return { ok: false, error: error?.message || 'Invalid email or password' };
    }

    // Determine role to redirect
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    const role = (profile?.role || data.user.user_metadata?.role || 'candidate') as Role;
    const redirectUrl = role === 'recruiter' ? '/recruiter' : '/candidate';

    return { ok: true, data: { redirectUrl } };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown login error';
    return { ok: false, error: message };
  }
}

export async function signOut(): Promise<ActionResult<null>> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { ok: false, error: error.message };
    }
    return { ok: true, data: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown signout error';
    return { ok: false, error: message };
  }
}
