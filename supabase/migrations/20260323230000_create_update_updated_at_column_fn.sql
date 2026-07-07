-- Generic trigger function used by headcount_plans (20260324000001) and any
-- future table with an `updated_at` column. Never had its own migration —
-- discovered as a gap while backfilling prod (headcount_plans referenced it
-- but it was never created).
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
