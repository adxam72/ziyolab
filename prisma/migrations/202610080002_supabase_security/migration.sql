-- Custom server authentication: no browser access via Supabase Data API.
-- Table owners / the dedicated trusted backend role bypass RLS;
-- application role and faculty authorization remains in Next.js handlers.
DO $$
DECLARE table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'Faculty','Group','User','Session','RateLimit','Skill','Question','Assessment',
    'SkillScore','LearningTask','Material','MaterialChunk','Assignment','Submission',
    'ResearchProject','ResearchComment','PortfolioItem','ChatMessage'
  ] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM PUBLIC', table_name);
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='anon') THEN
      EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon', table_name);
    END IF;
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='authenticated') THEN
      EXECUTE format('REVOKE ALL ON TABLE public.%I FROM authenticated', table_name);
    END IF;
  END LOOP;
END $$;
