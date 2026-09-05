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
    const body = await req.json();
    const { updates } = body as { updates: AssetUpdate[] };

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

    const supabase = createServerSupabase();

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
