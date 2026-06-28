CREATE OR REPLACE FUNCTION public.create_ds160_application(
  _email text,
  _full_name text,
  _purpose_of_trip text,
  _embassy text,
  _form_data jsonb,
  _current_step integer,
  _status text,
  _user_id uuid
)
RETURNS public.ds160_applications
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result public.ds160_applications;
BEGIN
  IF _status NOT IN ('draft','submitted') THEN
    RAISE EXCEPTION 'invalid status';
  END IF;
  IF _current_step < 1 OR _current_step > 5 THEN
    RAISE EXCEPTION 'current_step must be between 1 and 5';
  END IF;

  INSERT INTO public.ds160_applications(
    email, full_name, purpose_of_trip, embassy, form_data,
    current_step, status, user_id,
    submitted_at
  )
  VALUES (
    _email, _full_name, _purpose_of_trip, _embassy, COALESCE(_form_data, '{}'::jsonb),
    _current_step, _status, _user_id,
    CASE WHEN _status = 'submitted' THEN now() ELSE NULL END
  )
  RETURNING * INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_ds160_application(text, text, text, text, jsonb, integer, text, uuid) TO anon, authenticated;