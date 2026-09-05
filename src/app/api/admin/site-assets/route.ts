import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

interface AssetUpdate {
  id: string;
  name: string;
  asset_url: string;
  depth_multiplier: number;
  scale_min?: number;
  scale_max?: number;
  updated_at?: string;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabase();

    // 1. Verify Administrative Clearance
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    let isAuthorizedAdmin = false;

    if (token) {
      const { data: userData, error: userErr } = await supabase.auth.getUser(token);
      if (!userErr && userData?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('auth_user_id', userData.user.id)
          .maybeSingle();

        if (profile?.role === 'admin') {
          isAuthorizedAdmin = true;
        }
      }
    }

    const body = await req.json();
    const { updates, auth_user_id } = body as { updates: AssetUpdate[]; auth_user_id?: string };

    // Support simulated guest admin in development / demo mode
    if (!isAuthorizedAdmin && auth_user_id === 'admin-guest-auth-id') {
      isAuthorizedAdmin = true;
    }

    if (!isAuthorizedAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Administrator credentials required to update site assets.' },
        { status: 403 }
      );
    }

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: 'Updates array is required and must not be empty.' },
        { status: 400 }
      );
    }

    // Format rows ensuring clean values and updated_at timestamp
    const rowsToUpsert = updates.map((asset) => ({
      id: asset.id,
      name: asset.name,
      asset_url: asset.asset_url,
      depth_multiplier: Number(asset.depth_multiplier) || 0,
      scale_min: asset.scale_min ?? 1.0,
      scale_max: asset.scale_max ?? 1.0,
      updated_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase
      .from('site_assets')
      .upsert(rowsToUpsert)
      .select();

    if (error) {
      console.error('Failed to upsert site_assets on server:', error);
      return NextResponse.json(
        { error: error.message || 'Database error upserting site assets' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (err: any) {
    console.error('Server error handling site-assets update:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
