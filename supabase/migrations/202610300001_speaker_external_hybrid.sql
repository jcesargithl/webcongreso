-- Migration: Update modality check to allow speaker_external as 'Híbrido'
BEGIN;

CREATE OR REPLACE FUNCTION public.validate_congress_request_workflow()
RETURNS trigger LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
DECLARE
  expected_fee numeric;
  expected_mode text;
  registration public.congress_requests%ROWTYPE;
BEGIN
  IF NEW.workflow_version <> 2 THEN RETURN NEW; END IF;
  IF NEW.kind NOT IN ('registration', 'paper') THEN
    RAISE EXCEPTION 'Invalid request kind' USING ERRCODE = '23514';
  END IF;
  expected_fee := CASE NEW.category_id
    WHEN 'student_internal_attendee' THEN 20
    WHEN 'student_external' THEN 30
    WHEN 'speaker_external' THEN 100
    WHEN 'attendee_external' THEN 70
    WHEN 'speaker_internal_teacher' THEN 0
    WHEN 'speaker_internal_student' THEN 0
    ELSE NULL END;
  IF expected_fee IS NULL THEN
    RAISE EXCEPTION 'Invalid registration category' USING ERRCODE = '23514';
  END IF;
  expected_mode := CASE WHEN NEW.category_id IN ('student_external', 'attendee_external', 'speaker_external') THEN 'Híbrido' ELSE 'Presencial' END;
  IF NEW.mode IS DISTINCT FROM expected_mode THEN
    RAISE EXCEPTION 'Modality does not match category' USING ERRCODE = '23514';
  END IF;
  IF NEW.kind = 'registration' THEN
    IF NEW.registration_id IS NOT NULL OR NEW.registration_fee IS DISTINCT FROM expected_fee
       OR NEW.institutional_fee IS DISTINCT FROM (CASE WHEN expected_fee > 0 THEN 1 ELSE 0 END) THEN
      RAISE EXCEPTION 'Invalid registration amounts' USING ERRCODE = '23514';
    END IF;
    IF expected_fee = 0 THEN
      IF NEW.payment_status <> 'exempt' OR NEW.payment_method IS NOT NULL OR NEW.receipt_path IS NOT NULL THEN
        RAISE EXCEPTION 'Internal speaker registration is exempt' USING ERRCODE = '23514';
      END IF;
    ELSE
      IF NEW.payment_method IS DISTINCT FROM 'pagalo_pe' OR NEW.payment_sequence IS NULL
         OR NEW.payment_sequence !~ '^[0-9]{6}$' OR NEW.payment_date IS NULL
         OR NULLIF(trim(NEW.payment_document_number), '') IS NULL
         OR NEW.payment_amount IS DISTINCT FROM expected_fee + 1
         OR NEW.receipt_path IS NULL OR NEW.receipt_path NOT LIKE 'receipts/%.pdf'
         OR NEW.payment_status NOT IN ('pending', 'approved', 'rejected') THEN
        RAISE EXCEPTION 'Incomplete payment receipt' USING ERRCODE = '23514';
      END IF;
      IF NEW.payment_status IN ('approved', 'rejected') AND (NEW.payment_verified_at IS NULL OR NEW.payment_verified_by IS NULL) THEN
        RAISE EXCEPTION 'Payment review requires administrator audit data' USING ERRCODE = '23514';
      END IF;
      IF NEW.status::text = 'approved' AND NEW.payment_status <> 'approved' THEN
        RAISE EXCEPTION 'Payment must be approved first' USING ERRCODE = '23514';
      END IF;
    END IF;
  ELSE
    IF NEW.registration_id IS NULL OR NEW.registration_fee IS DISTINCT FROM 0 OR NEW.institutional_fee IS DISTINCT FROM 0
       OR NEW.payment_status <> 'exempt' OR NEW.file_path IS NULL OR NEW.file_path NOT LIKE 'papers/%.pdf'
       OR NULLIF(trim(NEW.topic), '') IS NULL THEN
      RAISE EXCEPTION 'Incomplete paper submission' USING ERRCODE = '23514';
    END IF;
    SELECT * INTO registration FROM public.congress_requests
      WHERE id = NEW.registration_id AND kind = 'registration' FOR SHARE;
    IF NOT FOUND OR registration.category_id IS DISTINCT FROM NEW.category_id
       OR NEW.category_id NOT IN ('speaker_external', 'speaker_internal_teacher', 'speaker_internal_student') THEN
      RAISE EXCEPTION 'A speaker registration is required' USING ERRCODE = '23514';
    END IF;
    IF NEW.status::text <> 'rejected' AND (registration.status::text = 'rejected'
       OR (NEW.category_id = 'speaker_external' AND registration.payment_status <> 'approved')) THEN
      RAISE EXCEPTION 'Speaker registration or payment is not approved' USING ERRCODE = '23514';
    END IF;
  END IF;
  RETURN NEW;
END $$;

COMMIT;

