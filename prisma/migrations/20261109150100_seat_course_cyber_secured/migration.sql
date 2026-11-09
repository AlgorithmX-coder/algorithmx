-- Every new firm seat is a Cyber Secured seat. Existing seats keep their
-- course; they still claim, and claim the whole licence.
ALTER TABLE "Seat" ALTER COLUMN "course" SET DEFAULT 'CYBER_SECURED';
