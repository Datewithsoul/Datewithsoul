export interface TemplateDefinition {
  key: string;
  title: string;
  description: string;
  category: "CUSTOMER" | "ADMIN";
  defaultContent: string;
  variables: { name: string; label: string; example: string }[];
}

export const TEMPLATE_DEFINITIONS: TemplateDefinition[] = [
  // ==========================================
  // 1. CUSTOMER NOTIFICATIONS
  // ==========================================
  {
    key: "BOOKING_CREATED_USER",
    title: "รับคำสั่งจองคลาสใหม่ (ส่งให้ลูกค้า)",
    description: "ส่งหาลูกค้าทันทีเมื่อทำการกดจองคลาสเดี่ยวสำเร็จ และรอชำระเงิน",
    category: "CUSTOMER",
    defaultContent: `ระบบได้รับคำสั่งจองคลาส "{{className}}" ของคุณแล้ว (สถานะ: กำลังจอง) กรุณาชำระเงินเพื่อยืนยันที่นั่งค่ะ`,
    variables: [
      { name: "userName", label: "ชื่อลูกค้า", example: "คุณสมชาย" },
      { name: "className", label: "ชื่อคลาส", example: "Ceramic Workshop" },
      { name: "seats", label: "จำนวนที่นั่ง", example: "1" },
      { name: "totalPrice", label: "ยอดเงินรวม (บาท)", example: "1,500" },
    ],
  },
  {
    key: "BOOKING_GROUP_CREATED_USER",
    title: "รับคำสั่งจองคลาสแบบกลุ่ม (ส่งให้ลูกค้า)",
    description: "ส่งหาลูกค้าเมื่อทำการกดจองหลายคลาสพร้อมกันผ่านตะกร้า",
    category: "CUSTOMER",
    defaultContent: `ระบบได้รับคำสั่งจองคลาสแบบกลุ่มของคุณแล้ว:
{{classNames}}

ยอดรวม: ฿{{totalPrice}}
(สถานะ: กำลังจอง) กรุณาชำระเงินเพื่อยืนยันที่นั่งค่ะ`,
    variables: [
      { name: "userName", label: "ชื่อลูกค้า", example: "คุณสมชาย" },
      { name: "classNames", label: "รายการคลาสทั้งหมด", example: "1. Ceramic Workshop\n2. Painting Workshop" },
      { name: "totalPrice", label: "ยอดเงินรวม (บาท)", example: "3,000" },
    ],
  },
  {
    key: "PAYMENT_SLIP_UPLOADED_USER",
    title: "ได้รับสลิปการชำระเงิน (ส่งให้ลูกค้า)",
    description: "ส่งหาลูกค้าเมื่ออัปโหลดสลิปคลาสเดี่ยวแล้ว และรอแอดมินตรวจ",
    category: "CUSTOMER",
    defaultContent: `เราได้รับสลิปการชำระเงินสำหรับคลาส "{{className}}" แล้ว กำลังรอแอดมินตรวจสอบ (สถานะ: การตรวจสอบชำระเงิน)`,
    variables: [
      { name: "userName", label: "ชื่อลูกค้า", example: "คุณสมชาย" },
      { name: "className", label: "ชื่อคลาส", example: "Ceramic Workshop" },
      { name: "totalPrice", label: "ยอดเงิน (บาท)", example: "1,500" },
    ],
  },
  {
    key: "PAYMENT_GROUP_SLIP_UPLOADED_USER",
    title: "ได้รับสลิปการชำระเงินแบบกลุ่ม (ส่งให้ลูกค้า)",
    description: "ส่งหาลูกค้าเมื่ออัปโหลดสลิปการจองแบบกลุ่มแล้ว และรอแอดมินตรวจ",
    category: "CUSTOMER",
    defaultContent: `เราได้รับสลิปการชำระเงินสำหรับการจองแบบกลุ่มแล้ว:
{{classNames}}

กำลังรอแอดมินตรวจสอบ (สถานะ: การตรวจสอบชำระเงิน)`,
    variables: [
      { name: "userName", label: "ชื่อลูกค้า", example: "คุณสมชาย" },
      { name: "classNames", label: "รายการคลาสทั้งหมด", example: "1. Ceramic Workshop\n2. Painting Workshop" },
      { name: "totalPrice", label: "ยอดเงินรวม (บาท)", example: "3,000" },
    ],
  },
  {
    key: "PAYMENT_VERIFIED_USER",
    title: "ยืนยันการชำระเงินสำเร็จ (ส่งให้ลูกค้า)",
    description: "ส่งหาลูกค้าเมื่อแอดมินอนุมัติสลิปและยืนยันการจองเรียบร้อย",
    category: "CUSTOMER",
    defaultContent: `การชำระเงินสำหรับคลาส "{{className}}" ได้รับการตรวจสอบและยืนยันแล้ว!
วันที่: {{date}} เวลา: {{time}}
สถานที่: {{location}}
{{mapUrl}}

แล้วพบกันนะคะ ✨`,
    variables: [
      { name: "userName", label: "ชื่อลูกค้า", example: "คุณสมชาย" },
      { name: "className", label: "ชื่อคลาส", example: "Ceramic Workshop" },
      { name: "date", label: "วันที่จัดคลาส", example: "20 สิงหาคม 2026" },
      { name: "time", label: "เวลาเรียน", example: "10:00 - 12:00" },
      { name: "location", label: "สถานที่เรียน", example: "Date with Soul Love" },
      { name: "mapUrl", label: "ลิงก์แผนที่", example: "แผนที่: https://maps.google.com/..." },
      { name: "seats", label: "จำนวนที่นั่ง", example: "1" },
    ],
  },
  {
    key: "PAYMENT_REJECTED_USER",
    title: "แจ้งเตือนสลิปไม่ผ่าน/ถูกปฏิเสธ (ส่งให้ลูกค้า)",
    description: "ส่งหาลูกค้าเมื่อแอดมินตรวจสอบสลิปแล้วไม่อนุมัติ",
    category: "CUSTOMER",
    defaultContent: `การตรวจสอบการชำระเงินสำหรับคลาส "{{className}}" ไม่ผ่าน
เหตุผล: {{reason}}
กรุณาอัปโหลดสลิปใหม่อีกครั้ง`,
    variables: [
      { name: "userName", label: "ชื่อลูกค้า", example: "คุณสมชาย" },
      { name: "className", label: "ชื่อคลาส", example: "Ceramic Workshop" },
      { name: "reason", label: "เหตุผลที่ปฏิเสธ", example: "ยอดเงินในสลิปไม่ตรงกับยอดที่ต้องชำระ" },
    ],
  },
  {
    key: "BOOKING_CANCELLED_USER",
    title: "แจ้งเตือนการจองถูกยกเลิก (ส่งให้ลูกค้า)",
    description: "ส่งหาลูกค้าเมื่อการจองถูกยกเลิก",
    category: "CUSTOMER",
    defaultContent: `การจองคลาส "{{className}}" ของคุณถูกยกเลิกแล้ว (สถานะ: ยกเลิก)`,
    variables: [
      { name: "userName", label: "ชื่อลูกค้า", example: "คุณสมชาย" },
      { name: "className", label: "ชื่อคลาส", example: "Ceramic Workshop" },
    ],
  },
  {
    key: "BOOKING_EXPIRED_USER",
    title: "แจ้งเตือนการจองหมดเวลาทำการ (ส่งให้ลูกค้า)",
    description: "ส่งหาลูกค้าเมื่อไม่ชำระเงินภายในเวลาที่กำหนด",
    category: "CUSTOMER",
    defaultContent: `คำสั่งจองคลาส "{{className}}" ของคุณหมดเวลาทำการแล้ว (สถานะ: ยกเลิก) กรุณาทำรายการใหม่อีกครั้งค่ะ`,
    variables: [
      { name: "userName", label: "ชื่อลูกค้า", example: "คุณสมชาย" },
      { name: "className", label: "ชื่อคลาส", example: "Ceramic Workshop" },
    ],
  },
  {
    key: "REQUEST_CHANGE_SUBMITTED_USER",
    title: "ได้รับคำขอเปลี่ยนรอบเรียน (ส่งให้ลูกค้า)",
    description: "ส่งหาลูกค้าเมื่อส่งคำขอเปลี่ยนรอบเรียนผ่านระบบ",
    category: "CUSTOMER",
    defaultContent: `ระบบได้รับคำขอเปลี่ยนรอบเรียนสำหรับคลาส "{{className}}" เป็น "{{newClassName}}" เรียบร้อยแล้ว ขณะนี้อยู่ระหว่างรอแอดมินตรวจสอบค่ะ`,
    variables: [
      { name: "userName", label: "ชื่อลูกค้า", example: "คุณสมชาย" },
      { name: "className", label: "ชื่อคลาสเดิม", example: "Ceramic Workshop (รอบเช้า)" },
      { name: "newClassName", label: "ชื่อคลาสใหม่ที่ขอเปลี่ยน", example: "Ceramic Workshop (รอบบ่าย)" },
    ],
  },
  {
    key: "REQUEST_CHANGE_APPROVED_USER",
    title: "อนุมัติคำขอเปลี่ยนรอบเรียน (ส่งให้ลูกค้า)",
    description: "ส่งหาลูกค้าเมื่อแอดมินกดอนุมัติการเปลี่ยนรอบเรียน",
    category: "CUSTOMER",
    defaultContent: `คำขอเปลี่ยนรอบเรียนเป็น "{{newClassName}}" ได้รับการอนุมัติเรียบร้อยแล้ว`,
    variables: [
      { name: "userName", label: "ชื่อลูกค้า", example: "คุณสมชาย" },
      { name: "className", label: "ชื่อคลาสเดิม", example: "Ceramic Workshop (รอบเช้า)" },
      { name: "newClassName", label: "ชื่อคลาสใหม่", example: "Ceramic Workshop (รอบบ่าย)" },
    ],
  },
  {
    key: "REQUEST_REJECTED_USER",
    title: "ปฏิเสธคำขอเปลี่ยนรอบ (ส่งให้ลูกค้า)",
    description: "ส่งหาลูกค้าเมื่อแอดมินปฏิเสธคำขอเปลี่ยนรอบเรียน",
    category: "CUSTOMER",
    defaultContent: `คำขอ{{requestType}}ของคุณถูกปฏิเสธ
เหตุผล: {{reason}}`,
    variables: [
      { name: "userName", label: "ชื่อลูกค้า", example: "คุณสมชาย" },
      { name: "className", label: "ชื่อคลาส", example: "Ceramic Workshop" },
      { name: "requestType", label: "ประเภทคำขอ", example: "เปลี่ยนรอบเรียน" },
      { name: "reason", label: "เหตุผลจากแอดมิน", example: "คลาสใหม่เต็มแล้ว" },
    ],
  },
  {
    key: "REMINDER_3_DAYS",
    title: "เตือนความจำก่อนเรียน 3 วัน (ส่งให้ลูกค้า)",
    description: "ส่งอัตโนมัติล่วงหน้า 3 วันก่อนวันเรียน",
    category: "CUSTOMER",
    defaultContent: `แจ้งเตือนคลาสเรียนล่วงหน้า 3 วัน ✨
คลาส: {{className}}
วันที่: {{date}}
เวลา: {{time}}
สถานที่: {{location}}
{{mapUrl}}

เตรียมตัวให้พร้อม แล้วพบกันนะคะ!`,
    variables: [
      { name: "userName", label: "ชื่อลูกค้า", example: "คุณสมชาย" },
      { name: "className", label: "ชื่อคลาส", example: "Ceramic Workshop" },
      { name: "date", label: "วันที่เรียน", example: "20 สิงหาคม 2026" },
      { name: "time", label: "เวลาเรียน", example: "10:00 - 12:00" },
      { name: "location", label: "สถานที่เรียน", example: "Date with Soul Love" },
      { name: "mapUrl", label: "ลิงก์แผนที่", example: "แผนที่: https://maps.google.com/..." },
    ],
  },
  {
    key: "REMINDER_1_DAY",
    title: "เตือนความจำก่อนเรียน 1 วัน (ส่งให้ลูกค้า)",
    description: "ส่งอัตโนมัติล่วงหน้า 1 วันก่อนเวลาเริ่มเรียน",
    category: "CUSTOMER",
    defaultContent: `แจ้งเตือนคลาสเรียนพรุ่งนี้ ✨
คลาส: {{className}}
วันที่: {{date}}
เวลา: {{time}}
สถานที่: {{location}}
{{mapUrl}}

เตรียมตัวให้พร้อม แล้วพบกันนะคะ!`,
    variables: [
      { name: "userName", label: "ชื่อลูกค้า", example: "คุณสมชาย" },
      { name: "className", label: "ชื่อคลาส", example: "Ceramic Workshop" },
      { name: "date", label: "วันที่เรียน", example: "20 สิงหาคม 2026" },
      { name: "time", label: "เวลาเรียน", example: "10:00 - 12:00" },
      { name: "location", label: "สถานที่เรียน", example: "Date with Soul Love" },
      { name: "mapUrl", label: "ลิงก์แผนที่", example: "แผนที่: https://maps.google.com/..." },
    ],
  },
  {
    key: "REMINDER_SAME_DAY",
    title: "เตือนความจำในวันเรียน (ส่งให้ลูกค้า)",
    description: "ส่งอัตโนมัติตอนเช้าในวันที่มีคลาสเรียน",
    category: "CUSTOMER",
    defaultContent: `แจ้งเตือนคลาสเรียนวันนี้ ✨
คลาส: {{className}}
เวลา: {{time}}
สถานที่: {{location}}
{{mapUrl}}

แล้วพบกันในคลาสนะคะ!`,
    variables: [
      { name: "userName", label: "ชื่อลูกค้า", example: "คุณสมชาย" },
      { name: "className", label: "ชื่อคลาส", example: "Ceramic Workshop" },
      { name: "time", label: "เวลาเรียน", example: "10:00 - 12:00" },
      { name: "location", label: "สถานที่เรียน", example: "Date with Soul Love" },
      { name: "mapUrl", label: "ลิงก์แผนที่", example: "แผนที่: https://maps.google.com/..." },
    ],
  },
  {
    key: "REMINDER_AFTER_CLASS",
    title: "ข้อความขอบคุณหลังจบคลาส (ส่งให้ลูกค้า)",
    description: "ส่งอัตโนมัติหลังจากคลาสเรียนสิ้นสุดลง",
    category: "CUSTOMER",
    defaultContent: `ขอบคุณที่มาร่วมคลาส "{{className}}" ในวันนี้นะคะ ✨
หวังว่าคุณจะได้รับความสุขและประสบการณ์ที่ดี
แล้วพบกันใหม่ในโอกาสหน้านะคะ 💛`,
    variables: [
      { name: "userName", label: "ชื่อลูกค้า", example: "คุณสมชาย" },
      { name: "className", label: "ชื่อคลาส", example: "Ceramic Workshop" },
    ],
  },
  {
    key: "LINE_LOGIN_WELCOME",
    title: "ต้อนรับการเข้าสู่ระบบด้วย LINE (ส่งให้ลูกค้า)",
    description: "ส่งหาลูกค้าเมื่อเชื่อมต่อหรือเข้าสู่ระบบด้วย LINE เป็นครั้งแรก",
    category: "CUSTOMER",
    defaultContent: `สวัสดีคุณ {{userName}} เข้าสู่ระบบ Date with Soul เรียบร้อยแล้วค่ะ`,
    variables: [
      { name: "userName", label: "ชื่อ LINE ลูกค้า", example: "Somchai" },
    ],
  },

  // ==========================================
  // 2. ADMIN NOTIFICATIONS
  // ==========================================
  {
    key: "ADMIN_BOOKING_CREATED",
    title: "แจ้งเตือนแอดมิน: มีการจองคลาสใหม่",
    description: "ส่งหาแอดมินเมื่อมีลูกค้าทำการจองคลาสเดี่ยว",
    category: "ADMIN",
    defaultContent: `มีการจองใหม่: {{userName}} จองคลาส "{{className}}" {{seats}} ที่นั่ง ยอด ฿{{totalPrice}}`,
    variables: [
      { name: "userName", label: "ชื่อลูกค้า", example: "คุณสมชาย" },
      { name: "className", label: "ชื่อคลาส", example: "Ceramic Workshop" },
      { name: "seats", label: "จำนวนที่นั่ง", example: "1" },
      { name: "totalPrice", label: "ยอดเงิน (บาท)", example: "1,500" },
    ],
  },
  {
    key: "ADMIN_BOOKING_GROUP_CREATED",
    title: "แจ้งเตือนแอดมิน: มีการจองคลาสแบบกลุ่ม",
    description: "ส่งหาแอดมินเมื่อมีลูกค้าทำการจองหลายคลาสพร้อมกัน",
    category: "ADMIN",
    defaultContent: `มีการจองใหม่ (กลุ่ม): {{userName}}
{{classNames}}
ยอดรวม ฿{{totalPrice}}`,
    variables: [
      { name: "userName", label: "ชื่อลูกค้า", example: "คุณสมชาย" },
      { name: "classNames", label: "รายการคลาส", example: "1. Ceramic Workshop\n2. Painting Workshop" },
      { name: "totalPrice", label: "ยอดเงินรวม (บาท)", example: "3,000" },
    ],
  },
  {
    key: "ADMIN_PAYMENT_UPLOADED",
    title: "แจ้งเตือนแอดมิน: มีการอัปโหลดสลิปชำระเงิน",
    description: "ส่งหาแอดมินเมื่อลูกค้าอัปโหลดสลิปเพื่อรอตรวจสอบ",
    category: "ADMIN",
    defaultContent: `มีการแจ้งชำระเงินใหม่: {{userName}} สำหรับคลาส "{{className}}" ยอด ฿{{totalPrice}}
ตรวจสอบสลิปได้ที่ระบบหลังบ้าน`,
    variables: [
      { name: "userName", label: "ชื่อลูกค้า", example: "คุณสมชาย" },
      { name: "className", label: "ชื่อคลาส", example: "Ceramic Workshop" },
      { name: "totalPrice", label: "ยอดเงิน (บาท)", example: "1,500" },
    ],
  },
  {
    key: "ADMIN_PAYMENT_GROUP_UPLOADED",
    title: "แจ้งเตือนแอดมิน: มีการอัปโหลดสลิปแบบกลุ่ม",
    description: "ส่งหาแอดมินเมื่อลูกค้าอัปโหลดสลิปสำหรับการจองกลุ่ม",
    category: "ADMIN",
    defaultContent: `มีการแจ้งชำระเงินใหม่ (กลุ่ม): {{userName}}
{{classNames}}
ยอด: ฿{{totalPrice}}
ตรวจสอบสลิปได้ที่ระบบหลังบ้าน`,
    variables: [
      { name: "userName", label: "ชื่อลูกค้า", example: "คุณสมชาย" },
      { name: "classNames", label: "รายการคลาส", example: "1. Ceramic Workshop\n2. Painting Workshop" },
      { name: "totalPrice", label: "ยอดเงินรวม (บาท)", example: "3,000" },
    ],
  },
  {
    key: "ADMIN_BOOKING_CANCELLED",
    title: "แจ้งเตือนแอดมิน: การจองถูกยกเลิก",
    description: "ส่งหาแอดมินเมื่อลูกค้ายกเลิกการจอง",
    category: "ADMIN",
    defaultContent: `การจองถูกยกเลิก: {{userName}} คลาส "{{className}}"`,
    variables: [
      { name: "userName", label: "ชื่อลูกค้า", example: "คุณสมชาย" },
      { name: "className", label: "ชื่อคลาส", example: "Ceramic Workshop" },
    ],
  },
  {
    key: "ADMIN_BOOKING_EXPIRED",
    title: "แจ้งเตือนแอดมิน: การจองหมดเวลาทำการ",
    description: "ส่งหาแอดมินเมื่อระบบยกเลิกการจองที่หมดเวลาชำระเงิน",
    category: "ADMIN",
    defaultContent: `คำสั่งจองคลาส "{{className}}" ของคุณ {{userName}} หมดเวลาทำการและถูกยกเลิกแล้ว`,
    variables: [
      { name: "userName", label: "ชื่อลูกค้า", example: "คุณสมชาย" },
      { name: "className", label: "ชื่อคลาส", example: "Ceramic Workshop" },
    ],
  },
  {
    key: "ADMIN_REQUEST_CHANGE",
    title: "แจ้งเตือนแอดมิน: มีคำขอเปลี่ยนรอบเรียน",
    description: "ส่งหาแอดมินเมื่อลูกค้ายื่นคำขอเปลี่ยนรอบเรียน",
    category: "ADMIN",
    defaultContent: `มีคำขอเปลี่ยนรอบเรียนจากคุณ {{userName}} เป็นคลาส "{{newClassName}}"`,
    variables: [
      { name: "userName", label: "ชื่อลูกค้า", example: "คุณสมชาย" },
      { name: "className", label: "ชื่อคลาสเดิม", example: "Ceramic Workshop (รอบเช้า)" },
      { name: "newClassName", label: "ชื่อคลาสใหม่", example: "Ceramic Workshop (รอบบ่าย)" },
    ],
  },
];

export interface LoadedTemplate {
  key: string;
  title: string;
  description: string;
  category: "CUSTOMER" | "ADMIN";
  content: string;
  defaultContent: string;
  variables: { name: string; label: string; example: string }[];
  enabled: boolean;
  updatedAt?: Date;
}

/**
 * Replace placeholders like {{userName}} with provided variable values.
 * Client-safe pure function.
 */
export function renderTemplate(
  template: string,
  variables: Record<string, string | number | undefined | null>
): string {
  let result = template;
  for (const [key, val] of Object.entries(variables)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
    result = result.replace(regex, val !== undefined && val !== null ? String(val) : "");
  }
  return result;
}
