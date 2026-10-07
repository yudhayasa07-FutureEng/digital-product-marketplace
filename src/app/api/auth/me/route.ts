import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';

export async function GET() {
  const { user, profile } = await getAuthContext();
  return NextResponse.json({ user: user && profile ? { id: profile.id, name: profile.name, email: profile.email, avatar: profile.avatar || undefined, role: profile.role, active_mode: profile.active_mode, seller_status: profile.seller_status, created_at: profile.created_at } : null });
}
export async function PUT(request: Request) {
  const { supabase, user, profile } = await getAuthContext();
  if (!user || !profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { active_mode } = await request.json();
  if (active_mode !== 'buyer' && active_mode !== 'seller') return NextResponse.json({ error: 'Mode tidak valid' }, { status: 400 });
  if (active_mode === 'seller' && profile.seller_status !== 'approved' && profile.role !== 'admin') return NextResponse.json({ error: 'Akun Seller belum disetujui.' }, { status: 403 });
  const { data, error } = await supabase.from('profiles').update({ active_mode, updated_at: new Date().toISOString() }).eq('id', user.id).select('id,name,email,avatar,role,active_mode,seller_status,created_at').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ user: data });
}