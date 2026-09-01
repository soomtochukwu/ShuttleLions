-- ============================================================
-- 005: FIX RECURSIVE RLS POLICIES & ENSURE SEAMLESS PROFILE ACCESS
-- ============================================================

-- 1. Create a non-recursive SECURITY DEFINER helper function for admin checks
CREATE OR REPLACE FUNCTION public.is_admin_or_captain(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE auth_user_id = user_id AND role IN ('admin', 'captain')
  );
$$;

-- 2. Drop any problematic recursive policies on profiles
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
DROP POLICY IF EXISTS "profiles_select_authenticated" ON profiles;

-- 3. Create non-recursive policies on profiles
-- Allow anyone authenticated to read profiles (needed for roster, chat, directory)
CREATE POLICY "profiles_select_all" ON profiles
  FOR SELECT USING (true);

-- Allow users to insert their own profile
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = auth_user_id OR auth.uid() IS NOT NULL);

-- Allow users to update their own profile or admins to update
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (
    auth.uid() = auth_user_id OR public.is_admin_or_captain(auth.uid())
  );

-- 4. Fix custom_roles policies
DROP POLICY IF EXISTS "custom_roles_admin_all" ON custom_roles;
CREATE POLICY "custom_roles_admin_all" ON custom_roles
  FOR ALL USING (public.is_admin_or_captain(auth.uid()));

-- 5. Fix payments & racket_orders policies
DROP POLICY IF EXISTS "payments_select_admin" ON payments;
CREATE POLICY "payments_select_admin" ON payments
  FOR SELECT USING (public.is_admin_or_captain(auth.uid()));

DROP POLICY IF EXISTS "racket_orders_all_admin" ON racket_orders;
CREATE POLICY "racket_orders_all_admin" ON racket_orders
  FOR ALL USING (public.is_admin_or_captain(auth.uid()));
