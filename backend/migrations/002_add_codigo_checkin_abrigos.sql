ALTER TABLE abrigos
ADD COLUMN IF NOT EXISTS codigo_checkin VARCHAR(7);

UPDATE abrigos
SET codigo_checkin = UPPER(
	SUBSTRING(REPLACE(id::text, '-', ''), 1, 3) || '-' || SUBSTRING(REPLACE(id::text, '-', ''), 4, 3)
)
WHERE codigo_checkin IS NULL;

ALTER TABLE abrigos
ALTER COLUMN codigo_checkin SET NOT NULL;

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_constraint
		WHERE conname = 'abrigos_codigo_checkin_key'
	) THEN
		ALTER TABLE abrigos
		ADD CONSTRAINT abrigos_codigo_checkin_key UNIQUE (codigo_checkin);
	END IF;
END $$;
