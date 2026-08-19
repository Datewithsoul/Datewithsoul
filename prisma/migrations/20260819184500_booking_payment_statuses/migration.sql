ALTER TABLE "Booking" ALTER COLUMN "status" DROP DEFAULT;

CREATE TYPE "BookingStatus_new" AS ENUM ('BOOKING', 'AWAITING_PAYMENT', 'PAYMENT_REVIEW', 'PAID', 'CANCELLED');

ALTER TABLE "Booking"
  ALTER COLUMN "status" TYPE "BookingStatus_new"
  USING (
    CASE "status"::text
      WHEN 'PENDING' THEN 'AWAITING_PAYMENT'
      WHEN 'CONFIRMED' THEN 'PAID'
      WHEN 'CANCELLED' THEN 'CANCELLED'
      WHEN 'BOOKING' THEN 'BOOKING'
      WHEN 'AWAITING_PAYMENT' THEN 'AWAITING_PAYMENT'
      WHEN 'PAYMENT_REVIEW' THEN 'PAYMENT_REVIEW'
      WHEN 'PAID' THEN 'PAID'
      ELSE 'AWAITING_PAYMENT'
    END
  )::"BookingStatus_new";

DROP TYPE "BookingStatus";
ALTER TYPE "BookingStatus_new" RENAME TO "BookingStatus";
ALTER TABLE "Booking" ALTER COLUMN "status" SET DEFAULT 'BOOKING'::"BookingStatus";

ALTER TABLE "Payment" ALTER COLUMN "status" DROP DEFAULT;

CREATE TYPE "PaymentStatus_new" AS ENUM ('PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED');

ALTER TABLE "Payment"
  ALTER COLUMN "status" TYPE "PaymentStatus_new"
  USING (
    CASE "status"::text
      WHEN 'PENDING' THEN 'PENDING'
      WHEN 'VERIFIED' THEN 'VERIFIED'
      WHEN 'REJECTED' THEN 'REJECTED'
      WHEN 'UNDER_REVIEW' THEN 'UNDER_REVIEW'
      ELSE 'PENDING'
    END
  )::"PaymentStatus_new";

DROP TYPE "PaymentStatus";
ALTER TYPE "PaymentStatus_new" RENAME TO "PaymentStatus";
ALTER TABLE "Payment" ALTER COLUMN "status" SET DEFAULT 'PENDING'::"PaymentStatus";

UPDATE "Payment" AS p
SET status = CASE b.status::text
  WHEN 'PAYMENT_REVIEW' THEN 'UNDER_REVIEW'::"PaymentStatus"
  WHEN 'PAID' THEN 'VERIFIED'::"PaymentStatus"
  WHEN 'CANCELLED' THEN 'REJECTED'::"PaymentStatus"
  ELSE 'PENDING'::"PaymentStatus"
END
FROM "Booking" AS b
WHERE p."bookingId" = b.id;
