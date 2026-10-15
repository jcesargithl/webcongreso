BEGIN;

CREATE TABLE IF NOT EXISTS public.congress_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL,
  category text,
  name text NOT NULL,
  email text NOT NULL,
  doc_type text,
  doc_number text,
  mode text NOT NULL DEFAULT 'Presencial',
  institution text,
  topic text,
  message text,
  file_url text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Older installations stored identity documents as bigint. Convert them before
-- creating text-based lookup indexes, preserving the existing values.
ALTER TABLE public.congress_requests
  ADD COLUMN IF NOT EXISTS doc_type text,
  ADD COLUMN IF NOT EXISTS doc_number text;
ALTER TABLE public.congress_requests
  ALTER COLUMN doc_number TYPE text USING doc_number::text;

ALTER TABLE public.congress_requests
  ADD COLUMN IF NOT EXISTS category_id text,
  ADD COLUMN IF NOT EXISTS receipt_path text,
  ADD COLUMN IF NOT EXISTS file_path text,
  ADD COLUMN IF NOT EXISTS registration_fee numeric(10,2),
  ADD COLUMN IF NOT EXISTS institutional_fee numeric(10,2),
  ADD COLUMN IF NOT EXISTS payment_method text,
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS payment_document_number text,
  ADD COLUMN IF NOT EXISTS payment_sequence text,
  ADD COLUMN IF NOT EXISTS payment_amount numeric(10,2),
  ADD COLUMN IF NOT EXISTS payment_date date,
  ADD COLUMN IF NOT EXISTS payment_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS payment_verified_by uuid,
  ADD COLUMN IF NOT EXISTS payment_verified_by_email text,
  ADD COLUMN IF NOT EXISTS payment_notes text,
  ADD COLUMN IF NOT EXISTS workflow_version smallint NOT NULL DEFAULT 1;

-- Match the real primary-key type without converting or deleting existing IDs.
DO $$
DECLARE id_type text;
BEGIN
  SELECT format_type(atttypid, atttypmod) INTO id_type
  FROM pg_attribute WHERE attrelid = 'public.congress_requests'::regclass AND attname = 'id';
  IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public.congress_requests'::regclass AND attname = 'registration_id' AND NOT attisdropped) THEN
    EXECUTE format('ALTER TABLE public.congress_requests ADD COLUMN registration_id %s', id_type);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.congress_requests'::regclass AND conname = 'congress_requests_registration_id_fkey') THEN
    ALTER TABLE public.congress_requests ADD CONSTRAINT congress_requests_registration_id_fkey
      FOREIGN KEY (registration_id) REFERENCES public.congress_requests(id);
  END IF;
END $$;

-- Replace earlier mode-only constraints to support the card's hybrid modality.
DO $$
DECLARE constraint_name text;
BEGIN
  FOR constraint_name IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.congress_requests'::regclass AND contype = 'c'
      AND conkey = ARRAY[(SELECT attnum FROM pg_attribute WHERE attrelid = 'public.congress_requests'::regclass AND attname = 'mode')]::smallint[]
  LOOP
    EXECUTE format('ALTER TABLE public.congress_requests DROP CONSTRAINT %I', constraint_name);
  END LOOP;
END $$;
ALTER TABLE public.congress_requests ALTER COLUMN mode DROP DEFAULT;
ALTER TABLE public.congress_requests ALTER COLUMN mode TYPE text USING mode::text;
ALTER TABLE public.congress_requests ALTER COLUMN mode SET DEFAULT 'Presencial';
ALTER TABLE public.congress_requests ADD CONSTRAINT congress_requests_mode_check
  CHECK (mode IN ('Presencial', 'Virtual', 'Híbrido')) NOT VALID;

-- Preserve prior records. Ambiguous "Estudiante EPEP" or "Público General"
-- values deliberately remain unclassified; an administrator can identify them.
UPDATE public.congress_requests SET category_id = CASE category
  WHEN 'Estudiante EPEP · Asistente Interno' THEN 'student_internal_attendee'
  WHEN 'Asistente Interno' THEN 'student_internal_attendee'
  WHEN 'Estudiante Externo · Público General' THEN 'student_external'
  WHEN 'Estudiante Externo' THEN 'student_external'
  WHEN 'Ponente Externo · Investigadores' THEN 'speaker_external'
  WHEN 'Ponente Externo' THEN 'speaker_external'
  WHEN 'Investigadores' THEN 'speaker_external'
  WHEN 'Asistente Externo · Público General' THEN 'attendee_external'
  WHEN 'Asistente Externo' THEN 'attendee_external'
  WHEN 'Docente EPEP · Ponente Interno' THEN 'speaker_internal_teacher'
  WHEN 'Docente EPEP' THEN 'speaker_internal_teacher'
  WHEN 'Estudiante EPEP · Ponente Interno' THEN 'speaker_internal_student'
  ELSE NULL END
WHERE workflow_version = 1 AND category_id IS NULL;

UPDATE public.congress_requests SET
  registration_fee = CASE
    WHEN kind = 'paper' THEN 0
    WHEN category_id = 'student_internal_attendee' THEN 20
    WHEN category_id = 'student_external' THEN 30
    WHEN category_id = 'speaker_external' THEN 100
    WHEN category_id = 'attendee_external' THEN 70
    WHEN category_id IN ('speaker_internal_teacher', 'speaker_internal_student') THEN 0
    ELSE registration_fee END,
  institutional_fee = COALESCE(institutional_fee, 0),
  payment_status = CASE
    WHEN kind = 'paper' OR category_id IN ('speaker_internal_teacher', 'speaker_internal_student') THEN 'exempt'
    WHEN category_id IS NOT NULL AND status::text IN ('approved', 'cash') THEN 'approved'
    WHEN status::text = 'rejected' THEN 'rejected'
    ELSE 'pending' END
WHERE workflow_version = 1;

CREATE UNIQUE INDEX IF NOT EXISTS congress_registration_document_v2_unique
  ON public.congress_requests (doc_type, upper(doc_number))
  WHERE kind = 'registration' AND workflow_version = 2;

CREATE UNIQUE INDEX IF NOT EXISTS congress_payment_receipt_v2_unique
  ON public.congress_requests (payment_sequence, payment_date)
  WHERE kind = 'registration' AND workflow_version = 2 AND payment_method = 'pagalo_pe';

CREATE INDEX IF NOT EXISTS congress_registration_lookup
  ON public.congress_requests (doc_type, doc_number, lower(email)) WHERE kind = 'registration';

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
  expected_mode := CASE WHEN NEW.category_id IN ('student_external', 'attendee_external') THEN 'Híbrido' ELSE 'Presencial' END;
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
DROP TRIGGER IF EXISTS congress_request_workflow_guard ON public.congress_requests;
CREATE TRIGGER congress_request_workflow_guard
  BEFORE INSERT OR UPDATE ON public.congress_requests
  FOR EACH ROW EXECUTE FUNCTION public.validate_congress_request_workflow();

ALTER TABLE public.congress_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.congress_requests FROM anon, authenticated;
GRANT ALL ON public.congress_requests TO service_role;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('congress-files', 'congress-files', false, 10485760, ARRAY['application/pdf'])
ON CONFLICT (id) DO UPDATE SET public = false, file_size_limit = 10485760, allowed_mime_types = ARRAY['application/pdf'];

-- Existing permissive storage policies must not expose these personal documents.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'congress_files_server_only') THEN
    CREATE POLICY congress_files_server_only ON storage.objects AS RESTRICTIVE
      FOR ALL TO anon, authenticated
      USING (bucket_id <> 'congress-files') WITH CHECK (bucket_id <> 'congress-files');
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
COMMIT;
