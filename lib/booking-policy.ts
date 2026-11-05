import { MAX_COURSE_CHANGES, PAYMENT_WINDOW_MS, REQUEST_DEADLINE_DAYS } from "@/lib/booking-status";

const MS_PER_MINUTE = 60_000;
const PAYMENT_WINDOW_MINUTES = PAYMENT_WINDOW_MS / MS_PER_MINUTE;

/** Rules for changing or cancelling a booking; also quoted in the LINE message when a request is rejected. */
export const BOOKING_CHANGE_POLICY = {
  title: "3. การเปลี่ยนแปลงการจอง",
  content: [
    `หากต้องการเปลี่ยนรอบเรียน กรุณาส่งคำขอผ่านหน้าประวัติการจองล่วงหน้าอย่างน้อย ${REQUEST_DEADLINE_DAYS} วันก่อนวันเรียน`,
    `แต่ละการจองสามารถเปลี่ยนรอบเรียนได้เพียง ${MAX_COURSE_CHANGES} ครั้ง`,
    `หากต้องการยกเลิกการจอง กรุณาส่งคำขอยกเลิกผ่านหน้าประวัติการจองล่วงหน้าอย่างน้อย ${REQUEST_DEADLINE_DAYS} วันก่อนวันเรียน`,
    `ภายใน ${REQUEST_DEADLINE_DAYS} วันก่อนวันเรียน จะไม่สามารถเปลี่ยนรอบหรือยกเลิกผ่านระบบได้ หากจำเป็นกรุณาติดต่อแอดมินทาง LINE`,
  ],
};

// LegalPage gives each section the anchor #section-<number>
export const BOOKING_CHANGE_POLICY_PATH = "/terms#section-3";

/** Booking policy shown on /terms and in the dialog customers accept at checkout. */
export const BOOKING_POLICY_SECTIONS = [
  {
    title: "1. การจองและยืนยัน",
    content: [
      "การจองจะสมบูรณ์เมื่อทีมงานได้รับการชำระเงินและยืนยันการจองแล้วเท่านั้น",
      `กรุณาชำระเงินและส่งสลิปภายใน ${PAYMENT_WINDOW_MINUTES} นาทีหลังทำการจอง มิฉะนั้นการจองจะถูกยกเลิกอัตโนมัติ`,
      "ทีมงานจะยืนยันการจองผ่าน LINE Official Account ภายใน 24 ชั่วโมงทำการ (จันทร์–เสาร์)",
    ],
  },
  {
    title: "2. การชำระเงิน",
    content: [
      "ชำระเงินผ่านการโอนเงินธนาคารหรือ PromptPay ตามบัญชีที่ระบุในระบบ",
      "ต้องอัปโหลดสลิปยืนยันการชำระเงินผ่านระบบหลังโอนเงินทุกครั้ง",
      "ราคาที่แสดงในระบบเป็นราคาสุดท้าย รวม VAT แล้ว",
    ],
  },
  BOOKING_CHANGE_POLICY,
  {
    title: "4. พฤติกรรมในคลาส",
    content: [
      "ผู้เข้าร่วมควรเคารพซึ่งกันและกันและสร้างบรรยากาศที่ดีในการเรียน",
      "ห้ามบันทึกภาพหรือวิดีโอผู้เข้าร่วมคนอื่นโดยไม่ได้รับอนุญาต",
      "ทางร้านขอสงวนสิทธิ์ในการปฏิเสธการเข้าร่วมหากพฤติกรรมไม่เหมาะสม",
    ],
  },
  {
    title: "5. ข้อจำกัดความรับผิดชอบ",
    content: [
      "ทางร้านไม่รับผิดชอบต่อความเสียหายหรือบาดเจ็บที่เกิดขึ้นระหว่างกิจกรรม ยกเว้นกรณีที่เกิดจากความประมาทของทางร้านโดยตรง",
      "ผู้เข้าร่วมควรแจ้งข้อจำกัดทางร่างกายหรือสุขภาพก่อนเข้าคลาส",
    ],
  },
];
