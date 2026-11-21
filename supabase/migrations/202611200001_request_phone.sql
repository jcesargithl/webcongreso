-- Agrega el numero de celular / WhatsApp a inscripciones, ponencias e inscripciones corporativas.
-- Los registros anteriores quedan con phone NULL. Ejecutar en Supabase > SQL Editor antes de desplegar.
BEGIN;

ALTER TABLE public.congress_requests ADD COLUMN IF NOT EXISTS phone text;

ALTER TABLE public.congress_requests DROP CONSTRAINT IF EXISTS congress_requests_phone_length;
ALTER TABLE public.congress_requests ADD CONSTRAINT congress_requests_phone_length
  CHECK (phone IS NULL OR char_length(phone) BETWEEN 7 AND 25);

COMMIT;
