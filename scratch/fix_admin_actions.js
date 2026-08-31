const fs = require('fs');
const path = require('path');
const p = path.resolve('app/admin/bookings/actions.ts');
let code = fs.readFileSync(p, 'utf8');

const replacement = 
    await tx.booking.update({
      where: { id: bookingId },
      data: { status },
    });

    if (booking.bookingGroupId) {
      await tx.bookingGroup.update({
        where: { id: booking.bookingGroupId },
        data: { status: status as unknown as import('@/app/generated/prisma').BookingGroupStatus },
      });
      const groupPayment = await tx.payment.findUnique({
        where: { bookingGroupId: booking.bookingGroupId },
      });
      if (groupPayment) {
        await tx.payment.update({
          where: { id: groupPayment.id },
          data: { status: paymentStatusForBooking(status) },
        });
      }
    }
;

code = code.replace(
      await tx.booking.update({\n      where: { id: bookingId },\n      data: { status },\n    });,
  replacement.trim()
);

fs.writeFileSync(p, code, 'utf8');
