
-- ds160_payments: track Mercado Pago payments for DS-160 applications
CREATE TABLE public.ds160_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.ds160_applications(id) ON DELETE CASCADE,
  mp_preference_id text,
  mp_payment_id text,
  status text NOT NULL DEFAULT 'pending', -- pending | approved | rejected | cancelled | refunded
  amount numeric(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'MXN',
  addon_live_advisory boolean NOT NULL DEFAULT false,
  payer_email text,
  raw_payload jsonb,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.ds160_payments TO authenticated;
GRANT ALL ON public.ds160_payments TO service_role;

ALTER TABLE public.ds160_payments ENABLE ROW LEVEL SECURITY;

-- Admin & secretary can read all payments
CREATE POLICY "staff read payments" ON public.ds160_payments
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'secretary'));

-- Admin can update
CREATE POLICY "admin update payments" ON public.ds160_payments
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Authenticated users can read their own application's payments
CREATE POLICY "owner reads own payments" ON public.ds160_payments
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.ds160_applications a
    WHERE a.id = ds160_payments.application_id AND a.user_id = auth.uid()
  ));

CREATE TRIGGER trg_ds160_payments_updated_at
  BEFORE UPDATE ON public.ds160_payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add payment_status column to ds160_applications
ALTER TABLE public.ds160_applications
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'unpaid'; -- unpaid | pending | paid

CREATE INDEX IF NOT EXISTS idx_ds160_payments_app ON public.ds160_payments(application_id);
CREATE INDEX IF NOT EXISTS idx_ds160_payments_pref ON public.ds160_payments(mp_preference_id);
CREATE INDEX IF NOT EXISTS idx_ds160_payments_pid ON public.ds160_payments(mp_payment_id);

-- Token-based RPC: create a payment record for a guest/owner via edit_token
CREATE OR REPLACE FUNCTION public.create_ds160_payment_with_token(
  _application_id uuid,
  _edit_token uuid,
  _amount numeric,
  _addon_live_advisory boolean
) RETURNS public.ds160_payments
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  app public.ds160_applications;
  pay public.ds160_payments;
BEGIN
  SELECT * INTO app FROM public.ds160_applications
    WHERE id = _application_id AND edit_token = _edit_token;
  IF app.id IS NULL THEN
    RAISE EXCEPTION 'application not found';
  END IF;

  INSERT INTO public.ds160_payments(application_id, amount, addon_live_advisory, status)
  VALUES (_application_id, _amount, COALESCE(_addon_live_advisory, false), 'pending')
  RETURNING * INTO pay;

  RETURN pay;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.create_ds160_payment_with_token(uuid, uuid, numeric, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_ds160_payment_with_token(uuid, uuid, numeric, boolean) TO anon, authenticated;

-- Token-based: get payment status for an application
CREATE OR REPLACE FUNCTION public.get_ds160_payment_with_token(
  _application_id uuid,
  _edit_token uuid
) RETURNS public.ds160_payments
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  app public.ds160_applications;
  pay public.ds160_payments;
BEGIN
  SELECT * INTO app FROM public.ds160_applications
    WHERE id = _application_id AND edit_token = _edit_token;
  IF app.id IS NULL THEN
    RAISE EXCEPTION 'application not found';
  END IF;

  SELECT * INTO pay FROM public.ds160_payments
    WHERE application_id = _application_id
    ORDER BY created_at DESC
    LIMIT 1;

  RETURN pay;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_ds160_payment_with_token(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_ds160_payment_with_token(uuid, uuid) TO anon, authenticated;
