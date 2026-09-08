import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

interface UpdateRoleBody {
  member_id: string;
  role: string;
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication token required.' },
        { status: 401 }
      );
    }

    const supabase = createServerSupabase();
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);

    if (userErr || !userData?.user) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid or expired authentication session.' },
        { status: 401 }
      );
    }

    // Verify caller role on the server directly from database
    const { data: callerProfile, error: callerErr } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('auth_user_id', userData.user.id)
      .maybeSingle();

    if (callerErr || !callerProfile) {
      return NextResponse.json(
        { error: 'Forbidden: Caller profile not found.' },
        { status: 403 }
      );
    }

    if (!['admin', 'captain'].includes(callerProfile.role)) {
      return NextResponse.json(
        { error: 'Forbidden: Only verified club administrators or team captains can modify member roles.' },
        { status: 403 }
      );
    }

    const body = (await req.json()) as UpdateRoleBody;
    const { member_id, role } = body;

    if (!member_id || !role) {
      return NextResponse.json(
        { error: 'Bad Request: member_id and target role are required.' },
        { status: 400 }
      );
    }

    // Execute role update with server client
    const { data: updatedProfile, error: updateErr } = await supabase
      .from('profiles')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', member_id)
      .select('id, full_name, email, role')
      .single();

    if (updateErr) {
      console.error('Server error updating profile role:', updateErr);
      return NextResponse.json(
        { error: updateErr.message || 'Database error updating role.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedProfile,
      message: `Member role successfully updated to ${role}.`,
    });
  } catch (err: any) {
    console.error('Server error in /api/admin/roles:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error.' },
      { status: 500 }
    );
  }
}
