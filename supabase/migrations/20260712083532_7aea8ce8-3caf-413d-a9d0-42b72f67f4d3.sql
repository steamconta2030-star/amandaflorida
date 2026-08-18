
-- Lock down SECURITY DEFINER functions: revoke from PUBLIC, grant only to roles that need EXECUTE.

-- Used inside RLS policies (called as the querying role). Must remain executable by anon+authenticated.
REVOKE ALL ON FUNCTION public.can_access_booking(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_access_booking(uuid) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.has_cleaner_role(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_cleaner_role(uuid) TO anon, authenticated;

-- Callable RPCs — signed-in users only.
REVOKE ALL ON FUNCTION public.approve_cleaner_application(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.approve_cleaner_application(uuid, uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.cancel_booking(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cancel_booking(uuid, text) TO authenticated;

REVOKE ALL ON FUNCTION public.claim_job(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_job(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.list_open_jobs() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_open_jobs() TO authenticated;

-- Trigger-only helper: no one needs direct EXECUTE.
REVOKE ALL ON FUNCTION public.tidly_touch_updated_at() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.cleaner_profiles_guard_publish() FROM PUBLIC;
