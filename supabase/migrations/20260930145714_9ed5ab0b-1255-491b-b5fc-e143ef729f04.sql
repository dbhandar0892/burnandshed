CREATE TABLE public.entitlements (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  trial_started_at TIMESTAMPTZ,
  premium BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.entitlements TO authenticated;
GRANT ALL ON public.entitlements TO service_role;
ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own entitlement" ON public.entitlements FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER update_entitlements_updated_at BEFORE UPDATE ON public.entitlements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Starts the one-time 7-day trial for the signed-in account (never restarts it).
CREATE OR REPLACE FUNCTION public.start_trial()
RETURNS public.entitlements
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE result public.entitlements;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
  INSERT INTO public.entitlements (user_id, trial_started_at)
  VALUES (auth.uid(), now())
  ON CONFLICT (user_id) DO UPDATE
    SET trial_started_at = COALESCE(public.entitlements.trial_started_at, now())
  RETURNING * INTO result;
  RETURN result;
END; $$;
REVOKE EXECUTE ON FUNCTION public.start_trial() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.start_trial() TO authenticated;