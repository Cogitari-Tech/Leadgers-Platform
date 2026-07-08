-- SEC-15: get_account_balances was SECURITY DEFINER with no tenant filter and
-- EXECUTE granted to anon, exposing every tenant's financial data via
-- /rest/v1/rpc/get_account_balances with only the public anon key.
-- Fix: require an authenticated caller, scope accounts to the caller's active
-- tenants, and revoke anon/PUBLIC execute.

CREATE OR REPLACE FUNCTION public.get_account_balances(
  p_start_date timestamp with time zone,
  p_end_date timestamp with time zone
)
RETURNS TABLE(
  account_id uuid,
  account_name text,
  account_code character varying,
  account_type character varying,
  is_analytical boolean,
  debit_total numeric,
  credit_total numeric,
  balance numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  RETURN QUERY
  SELECT
    a.id AS account_id,
    a.name AS account_name,
    a.code AS account_code,
    a.type AS account_type,
    a.is_analytical,
    COALESCE(SUM(CASE WHEN t.account_debit_id = a.id THEN t.amount ELSE 0 END), 0) AS debit_total,
    COALESCE(SUM(CASE WHEN t.account_credit_id = a.id THEN t.amount ELSE 0 END), 0) AS credit_total,
    CASE
      WHEN a.type IN ('Ativo', 'Despesa', 'checking', 'savings', 'investment', 'cash') THEN
        COALESCE(SUM(CASE WHEN t.account_debit_id = a.id THEN t.amount ELSE 0 END), 0)
        - COALESCE(SUM(CASE WHEN t.account_credit_id = a.id THEN t.amount ELSE 0 END), 0)
      ELSE
        COALESCE(SUM(CASE WHEN t.account_credit_id = a.id THEN t.amount ELSE 0 END), 0)
        - COALESCE(SUM(CASE WHEN t.account_debit_id = a.id THEN t.amount ELSE 0 END), 0)
    END AS balance
  FROM public.accounts a
  LEFT JOIN public.transactions t
    ON (t.account_debit_id = a.id OR t.account_credit_id = a.id)
    AND t.tenant_id = a.tenant_id
    AND t.date >= p_start_date::date
    AND t.date <= p_end_date::date
  WHERE a.is_analytical = true
    AND a.tenant_id IN (
      SELECT tm.tenant_id
      FROM public.tenant_members tm
      WHERE tm.user_id = auth.uid()
        AND tm.status = 'active'
    )
  GROUP BY a.id, a.name, a.code, a.type, a.is_analytical
  ORDER BY a.code;
END;
$function$;

REVOKE ALL ON FUNCTION public.get_account_balances(timestamptz, timestamptz) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_account_balances(timestamptz, timestamptz) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_account_balances(timestamptz, timestamptz) TO authenticated, service_role;
