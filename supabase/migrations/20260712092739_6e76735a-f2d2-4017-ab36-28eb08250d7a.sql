
-- Revogar EXECUTE de anon e PUBLIC em todas as funções SECURITY DEFINER
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.has_cleaner_role(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.can_access_booking(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.cancel_booking(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.approve_cleaner_application(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.claim_job(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.list_open_jobs() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.cleaner_rating_summary(uuid) FROM PUBLIC, anon;

-- Garantir EXECUTE para authenticated onde é necessário
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_cleaner_role(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_booking(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_booking(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_cleaner_application(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_job(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_open_jobs() TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleaner_rating_summary(uuid) TO authenticated, anon;
