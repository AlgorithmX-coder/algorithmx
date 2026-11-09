-- The Cyber Awareness product row: the third Cyber Secured track. Data
-- only, no schema change. Its existence is what the claim and the portal
-- enrol on (enrolOnEveryTrack), so it ships with the first released module.
-- Never sold on its own: the firm buys the Cyber Secured licence, so no
-- standalone price. Excluded from the consumer listings by allow-list.
INSERT INTO "Product" ("id", "slug", "name", "ageMin", "ageMax", "priceGBP", "weeks", "status", "emoji", "ageRange", "duration", "weeksCount", "createdAt", "updatedAt")
VALUES ('prod_cyber_awareness_000001', 'cyber-awareness', 'Cyber Awareness', 18, 99, 0, 0, 'ACTIVE'::"ProductStatus", '🔒', 'Working adults', 'About 2 hours', 0, now(), now())
ON CONFLICT ("slug") DO NOTHING;
