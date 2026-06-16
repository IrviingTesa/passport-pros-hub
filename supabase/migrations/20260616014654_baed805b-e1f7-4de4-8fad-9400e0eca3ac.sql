CREATE OR REPLACE FUNCTION public.validate_ds160()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.status NOT IN ('draft','submitted','in_review','completed','rejected') THEN
    RAISE EXCEPTION 'invalid status';
  END IF;
  IF NEW.current_step < 1 OR NEW.current_step > 5 THEN
    RAISE EXCEPTION 'current_step must be between 1 and 5';
  END IF;
  IF length(trim(NEW.email)) = 0 THEN
    RAISE EXCEPTION 'email cannot be empty';
  END IF;
  IF length(NEW.email) > 255 THEN
    RAISE EXCEPTION 'email too long';
  END IF;
  IF length(NEW.full_name) > 200 THEN
    RAISE EXCEPTION 'full_name too long';
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_ds160_with_token(_id uuid, _edit_token uuid, _form_data jsonb, _current_step integer, _status text, _email text, _full_name text, _purpose_of_trip text, _embassy text)
 RETURNS public.ds160_applications
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  result public.ds160_applications;
BEGIN
  IF _status NOT IN ('draft','submitted') THEN
    RAISE EXCEPTION 'invalid status for token update';
  END IF;
  IF _current_step < 1 OR _current_step > 5 THEN
    RAISE EXCEPTION 'current_step must be between 1 and 5';
  END IF;

  UPDATE public.ds160_applications
  SET
    form_data = _form_data,
    current_step = _current_step,
    status = _status,
    email = _email,
    full_name = _full_name,
    purpose_of_trip = _purpose_of_trip,
    embassy = _embassy,
    submitted_at = CASE WHEN _status = 'submitted' AND submitted_at IS NULL THEN now() ELSE submitted_at END
  WHERE id = _id
    AND edit_token = _edit_token
    AND status IN ('draft','submitted')
  RETURNING * INTO result;

  IF result.id IS NULL THEN
    RAISE EXCEPTION 'application not found or not editable';
  END IF;

  RETURN result;
END;
$function$;