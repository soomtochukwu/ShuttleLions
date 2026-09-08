-- ============================================================
-- 015: ENFORCE ADMIN & EXECUTIVE DATABASE PRIVILEGES & RLS
-- ============================================================

-- 1. Security Definer Helper Functions
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE auth_user_id = user_id AND role = 'admin'
  );
$$;

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

CREATE OR REPLACE FUNCTION public.is_executive(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    LEFT JOIN public.custom_roles cr ON cr.id = p.role
    WHERE p.auth_user_id = user_id
      AND (
        p.role IN ('admin', 'captain', 'treasurer', 'logistician', 'media_personnel')
        OR cr.is_system = true
        OR cr.can_upload_media = true
        OR cr.can_audit_finances = true
        OR cr.can_manage_schedule = true
      )
  );
$$;

-- 2. PostgreSQL BEFORE UPDATE Trigger on profiles to prevent privilege escalation
CREATE OR REPLACE FUNCTION public.prevent_unauthorized_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_id uuid;
  caller_is_admin boolean;
BEGIN
  -- If role and custom_role_id are not being modified, allow update
  IF (OLD.role IS NOT DISTINCT FROM NEW.role) AND 
     (OLD.custom_role_id IS NOT DISTINCT FROM NEW.custom_role_id) THEN
    RETURN NEW;
  END IF;

  -- Allow if executed by service_role (e.g. server-side API using SUPABASE_SERVICE_ROLE_KEY) or postgres
  IF current_setting('request.jwt.claim.role', true) = 'service_role' OR
     current_user = 'postgres' OR
     current_user = 'supabase_admin' THEN
    RETURN NEW;
  END IF;

  -- Get current authenticated user ID
  caller_id := auth.uid();

  -- Check if caller is verified admin or captain
  IF caller_id IS NOT NULL THEN
    SELECT public.is_admin_or_captain(caller_id) INTO caller_is_admin;
    IF caller_is_admin THEN
      RETURN NEW;
    END IF;
  END IF;

  -- Unauthorized attempt to escalate or alter role
  RAISE EXCEPTION 'Unauthorized: Only verified club administrators can assign or alter athlete roles (attempted to change role from % to %)', OLD.role, NEW.role
    USING ERRCODE = '42501';
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_unauthorized_role_change ON public.profiles;
CREATE TRIGGER trg_prevent_unauthorized_role_change
  BEFORE UPDATE OF role, custom_role_id ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_unauthorized_role_change();

-- 3. Profiles RLS Policies:
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (
    auth.uid() = auth_user_id OR public.is_admin_or_captain(auth.uid())
  )
  WITH CHECK (
    (auth.uid() = auth_user_id AND role = (SELECT p2.role FROM profiles p2 WHERE p2.id = profiles.id))
    OR public.is_admin_or_captain(auth.uid())
  );

-- 4. Custom Roles RLS Policies:
DROP POLICY IF EXISTS "custom_roles_select_all" ON custom_roles;
CREATE POLICY "custom_roles_select_all" ON custom_roles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "custom_roles_admin_all" ON custom_roles;
CREATE POLICY "custom_roles_admin_all" ON custom_roles
  FOR ALL USING (public.is_admin_or_captain(auth.uid()))
  WITH CHECK (public.is_admin_or_captain(auth.uid()));

-- 5. Events RLS Policies:
DROP POLICY IF EXISTS "events_write_authorized" ON events;
DROP POLICY IF EXISTS "events_write_admin" ON events;
CREATE POLICY "events_write_authorized" ON events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      LEFT JOIN custom_roles cr ON cr.id = p.role
      WHERE p.auth_user_id = auth.uid()
        AND (
          p.role IN ('admin', 'captain')
          OR p.role ILIKE '%logistician%'
          OR (cr.can_manage_schedule = true)
        )
    )
  );

-- 6. Media Uploads RLS Policies:
DROP POLICY IF EXISTS "media_insert_auth" ON media_uploads;
DROP POLICY IF EXISTS "media_insert_authorized" ON media_uploads;
CREATE POLICY "media_insert_authorized" ON media_uploads
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      LEFT JOIN custom_roles cr ON cr.id = p.role
      WHERE p.id = uploader_id
        AND p.auth_user_id = auth.uid()
        AND (
          p.role IN ('admin', 'captain', 'media_personnel')
          OR cr.can_upload_media = true
        )
    )
  );

-- 7. Payments Status Update RLS Policies:
DROP POLICY IF EXISTS "payments_update_admin" ON payments;
CREATE POLICY "payments_update_admin" ON payments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles p
      LEFT JOIN custom_roles cr ON cr.id = p.role
      WHERE p.auth_user_id = auth.uid()
        AND (
          p.role IN ('admin', 'treasurer')
          OR cr.can_audit_finances = true
        )
    )
  );

-- 8. Shop Orders Status Update RLS Policies:
DROP POLICY IF EXISTS "shop_orders_update_admin" ON shop_orders;
CREATE POLICY "shop_orders_update_admin" ON shop_orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles p
      LEFT JOIN custom_roles cr ON cr.id = p.role
      WHERE p.auth_user_id = auth.uid()
        AND (
          p.role IN ('admin', 'logistician')
          OR cr.can_manage_schedule = true
        )
    )
  );

-- 9. Site Assets RLS Policies:
DROP POLICY IF EXISTS "site_assets_write_admin" ON site_assets;
CREATE POLICY "site_assets_write_admin" ON site_assets
  FOR ALL USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
