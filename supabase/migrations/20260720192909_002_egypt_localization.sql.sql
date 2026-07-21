/*
# Egyptian localization — EGP currency & price adjustment

1. Updates settings: currency → ج.م (Egyptian Pound), support phone/email
2. Updates all product prices to EGP-appropriate ranges (scrubs in Egypt
   typically 450–1400 EGP), keeping the same relative discounts.
3. Updates social_links WhatsApp to an Egyptian-format placeholder.
*/

UPDATE settings SET value_ar = 'ج.م' WHERE key = 'currency';

UPDATE settings SET value_ar = '+20 100 000 0000' WHERE key = 'support_phone';

UPDATE settings SET value_ar = 'support@askrbk.eg' WHERE key = 'support_email';

-- Reprice products to EGP (multiply by ~4x and round to nearest 10)
UPDATE products SET
  price = CEIL(price * 4 / 10) * 10,
  compare_at_price = CASE WHEN compare_at_price IS NOT NULL THEN CEIL(compare_at_price * 4 / 10) * 10 ELSE NULL END;

UPDATE social_links SET url = 'https://wa.me/201000000000' WHERE platform = 'whatsapp';
