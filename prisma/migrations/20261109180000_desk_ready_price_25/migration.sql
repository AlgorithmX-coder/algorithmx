-- Desk Ready: owner set the price to £25 (2026-11-09), down from the £99 it
-- launched with that morning. Consumer prices are VAT inclusive, so £25 nets
-- £20.83. Data only; touches the one row and nothing else.

UPDATE "Product" SET "priceGBP" = 2500, "updatedAt" = now() WHERE "slug" = 'desk-ready';
