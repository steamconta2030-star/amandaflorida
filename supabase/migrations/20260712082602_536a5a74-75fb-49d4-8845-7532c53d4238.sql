
-- Funções internas: nenhuma exposição pública
REVOKE ALL ON FUNCTION public.has_cleaner_role(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.cleaner_profiles_guard_publish() FROM PUBLIC, anon, authenticated;

-- Funções do marketplace: só authenticated, sem anon
REVOKE ALL ON FUNCTION public.list_open_jobs() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_open_jobs() TO authenticated;

REVOKE ALL ON FUNCTION public.claim_job(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_job(uuid) TO authenticated;

-- Também aperta as pré-existentes que estavam abertas ao anon
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.tidly_touch_updated_at() FROM PUBLIC, anon, authenticated;
