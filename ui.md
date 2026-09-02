# Admin UI: shadcn/ui Gap Analysis

เอกสารนี้สรุปส่วนของหน้า Admin ที่ยังไม่ได้ใช้ component จาก `shadcn/ui` อย่างสม่ำเสมอ และข้อเสนอแนะสำหรับการปรับปรุง โดยอ้างอิงจากโค้ดปัจจุบันใน `app/admin` และ `components` ณ วันที่ 1 กันยายน 2026

## สรุปภาพรวม

โปรเจกต์มี component พื้นฐานของ shadcn/ui แล้วหลายตัว ได้แก่ `Button`, `Card`, `Table`, `Badge`, `Dialog`, `Drawer`, `AlertDialog`, `Select`, `Input`, `Label`, `DropdownMenu`, `Sidebar`, `Skeleton`, `Separator`, `Chart`, `Toast/Sonner` และ `Tooltip`

อย่างไรก็ตาม หน้า Admin หลายส่วนยังสร้าง UI ด้วย `<div>`, `<section>`, `<span>`, `<a>`, `<button>` และ class สี/เส้นขอบแบบกำหนดเองโดยตรง ทำให้ component ที่มีอยู่ยังถูกใช้งานไม่เต็มที่ และรูปแบบ interaction/accessibility ยังไม่สม่ำเสมอ

## จุดที่ควรปรับปรุงตามลำดับความสำคัญ

### 1. Dashboard หลัก — ความสำคัญสูง

ไฟล์: `app/admin/(protected)/page.tsx`

- กล่อง “สิ่งที่ต้องดำเนินการด่วน” ควรใช้ `Alert` แทน `<section>` ที่ทำสีเอง
- กล่องตัวเลขสถิติและส่วน `Booking Overview`, `Payment Overview`, กราฟ และรายการคอร์ส ควรใช้ `Card` พร้อม `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
- ปุ่มลิงก์ใน `Quick Actions` ควรใช้ `Button` ร่วมกับ `Link` ผ่าน `asChild`/`render` ตาม base ของโปรเจกต์ แทนการเขียน class ปุ่มซ้ำเอง
- ตาราง “รายการจองล่าสุด” ยังใช้ `<table>` ดิบ ควรเปลี่ยนเป็น `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` เหมือนหน้ารายการอื่น
- สถานะที่แสดงเป็น `<span>` ควรใช้ `Badge` โดยเฉพาะสถานะเตือน/รอตรวจสอบ
- กรณีไม่มีข้อมูลควรใช้ `Empty` หากเพิ่ม component นี้เข้ามาในระบบ
- เส้นคั่นที่เขียนเป็น `border-t`/`border-b` ควรพิจารณาใช้ `Separator` เมื่อทำหน้าที่เป็นตัวแบ่งเนื้อหา

### 2. Attendance — ความสำคัญสูง

ไฟล์: `app/admin/(protected)/attendance/page.tsx`

- `<details>`/`<summary>` ที่ใช้เปิดปิดแต่ละคอร์ส ควรเปลี่ยนเป็น `Accordion` หรือ `Collapsible`
- สถานะ `COMPLETED` และสถานะที่ยังเปิดอยู่ใช้ `<span>` กับสีดิบ ควรใช้ `Badge`
- การ์ดคอร์สและรายการผู้เรียนควรใช้ `Card` เพื่อให้โครงสร้างและ spacing สอดคล้องกับหน้าอื่น
- จำนวนที่นั่งที่จอง/มาเรียนควรใช้ `Progress` ร่วมกับข้อความกำกับ เพื่อสื่อ capacity ได้ชัดเจนขึ้น
- ถ้าไม่มีคอร์ส ควรใช้ `Empty` แทนกล่องข้อความที่สร้างเอง

### 3. Requests — ความสำคัญสูง

ไฟล์: `app/admin/(protected)/requests/page.tsx`

- การ์ดคำขอแต่ละรายการควรใช้ `Card`
- สถานะ “รอตรวจสอบ” ควรใช้ `Badge` หรือ `Alert` แทน `<span>` ที่กำหนดสีเอง
- ปุ่มอนุมัติ/ปฏิเสธเป็น `<button>` ดิบ ควรใช้ `Button`
- การปฏิเสธหรือ action ที่เปลี่ยนข้อมูลควรมี `AlertDialog` เพื่อยืนยันก่อนดำเนินการ
- เนื้อหารายละเอียดคำขอที่แยกด้วย border ควรใช้ `Separator` ในจุดที่เหมาะสม

### 4. Settings และฟอร์มสร้าง/แก้ไข — ความสำคัญสูง

ไฟล์หลัก: `app/admin/(protected)/settings/page.tsx`, `classes/new/page.tsx`, `classes/[id]/edit/page.tsx`, `classes/group-edit/[name]/page.tsx`, `notifications/templates/template-editor.tsx`, `users/users-table.tsx`

- ฟอร์มจำนวนมากยังใช้ `div` + `Label` + input แบบกำหนด layout เอง ควรจัดโครงสร้างด้วย `FieldGroup` และ `Field`
- เพิ่ม `FieldDescription` สำหรับคำอธิบาย เช่น ค่า LINE credentials และรูปแบบข้อความแจ้งเตือน
- เพิ่ม `FieldError`, `data-invalid` และ `aria-invalid` สำหรับ validation
- ช่องข้อความยาว/ข้อความ template ควรใช้ `Textarea` หากยังไม่ได้เพิ่ม component นี้
- การเลือกตัวเลือกหลายแบบควรใช้ `RadioGroup`, `Checkbox`, `Switch` หรือ `ToggleGroup` ตามลักษณะข้อมูล แทนปุ่มหรือ select ที่ไม่สื่อความหมาย
- ฟอร์มที่มีหลาย section ควรห่อแต่ละกลุ่มด้วย `Card` และใช้ `CardHeader`/`CardContent`
- ปุ่มบันทึกควรใช้ `Spinner` และ disabled state ระหว่าง submit แทนการสร้าง loading style เอง

### 5. Classes และ Bookings — ความสำคัญกลาง

ไฟล์: `app/admin/(protected)/classes/page.tsx`, `bookings/page.tsx`, `components/admin-booking-filters.tsx`

- หน้าจอ desktop ใช้ `Table` แล้ว แต่หน้าจอ mobile ยังใช้การ์ด `<div>` แบบกำหนดเอง ควรสร้าง reusable `Card` composition เพื่อให้สถานะ/ปุ่ม/spacing เท่ากัน
- filter ที่มีตัวเลือกจำนวนจำกัดควรพิจารณา `ToggleGroup` หรือ `Tabs` ถ้าต้องการสลับสถานะเร็ว ๆ
- empty state ของตารางควรใช้ `Empty`
- สถานะที่ยังใช้ `<span>` กับ class สีตรง ๆ ควรเปลี่ยนเป็น `Badge` และกำหนด variant ที่มีความหมาย
- action ที่ลบ/ยกเลิก/ปิดคลาสควรใช้ `AlertDialog` ให้เป็นมาตรฐานเดียวกัน

### 6. Notifications และ Payments — ความสำคัญกลาง

ไฟล์: `app/admin/(protected)/notifications/page.tsx`, `payments/page.tsx`

- ใช้ `Table` และ `Badge` บางส่วนแล้ว ควรเพิ่ม `Card` สำหรับส่วนหัว/สรุป และ `Empty` สำหรับไม่มีรายการ
- การแจ้งผลสำเร็จ/ผิดพลาดควรใช้ `Sonner` หรือ toast ที่โปรเจกต์กำหนดไว้ให้เป็นระบบเดียว ไม่ควรแสดงข้อความด้วย markup เฉพาะหน้า
- การอัปโหลด/ตรวจสอบสลิปควรใช้ `Dialog` หรือ `Drawer` พร้อม `DialogTitle`/`DialogDescription` ที่ครบถ้วน และใช้ `Skeleton` ระหว่างโหลด
- สถานะการชำระเงินควรรวมไว้ใน `Badge` variant ที่กำหนดจาก design token แทน raw color

### 7. Layout, loading และ error state — ความสำคัญกลาง

ไฟล์: `app/admin/(protected)/layout.tsx`, `loading.tsx`, `error.tsx`

- ลิงก์ “ดูเว็บไซต์” ควรใช้ `Button variant="ghost"` หรือ `Button variant="outline"` ผ่าน `Link` แทน anchor ที่เขียน style เอง
- เส้นคั่นใน header ควรใช้ `Separator orientation="vertical"`
- `loading.tsx` ควรใช้ `Spinner` ที่มีอยู่แล้ว แทนการ import `Loader2` และกำหนด animation เอง
- `error.tsx` ควรใช้ `Alert` สำหรับข้อความผิดพลาด และใช้ semantic token เช่น `bg-destructive/10`, `text-destructive` แทน `bg-red-100`, `text-red-600`
- ปุ่ม retry ใช้ `Button` ได้แล้ว แต่ควรย้ายสีไปไว้ใน variant/theme ไม่ควร hardcode สีในหน้า

## Component ที่มีอยู่แต่ควรเพิ่มการใช้งานใน Admin

| Component | จุดที่ควรใช้ |
|---|---|
| `Card` | Dashboard, attendance, requests, settings, form sections, mobile list items |
| `Alert` | urgent actions, error state, warning/info ใน payments และ notifications |
| `Empty` | ตาราง/รายการที่ไม่มีข้อมูลทุกหน้า |
| `Accordion` / `Collapsible` | attendance แทน `<details>` |
| `Progress` | attendance capacity และ progress ของงาน/การตรวจสอบ |
| `Separator` | header และส่วนแบ่งภายใน card/section |
| `Badge` | booking, payment, class, attendance และ request status |
| `AlertDialog` | delete, cancel, reject, close class และ action ที่ย้อนกลับยาก |
| `FieldGroup` / `Field` | settings, users, class forms, template editor |
| `Textarea` | notification template และรายละเอียดที่เป็นข้อความหลายบรรทัด |
| `Tabs` / `ToggleGroup` | filter/switch status หรือ view ที่มีตัวเลือกจำกัด |
| `Tooltip` | icon-only actions เช่นเมนูเพิ่มเติมและปุ่มที่มีความหมายจาก icon |
| `Skeleton` / `Spinner` | loading ของ dialog, table, card และ action submit |
| `Sonner` / `Toast` | feedback หลัง save, approve, reject, upload และ delete |

## กติกาที่ควรเพิ่มเป็นมาตรฐานในงานถัดไป

1. ตรวจ `components/ui` ก่อนสร้าง markup ใหม่ทุกครั้ง
2. ใช้ component composition เต็มรูปแบบ เช่น `CardHeader` + `CardContent` ไม่ใส่ทุกอย่างไว้ใน `CardContent`
3. ใช้ semantic token และ variant ของ component แทนสีดิบ เช่น `text-red-600`, `bg-gray-50`, `border-[#ddd4c8]`
4. ห้ามใช้ `<button>` หรือ `<a>` ที่ทำหน้าที่เป็นปุ่มโดยไม่ใช้ `Button` เว้นแต่มีเหตุผลด้าน primitive หรือ server action ที่จำเป็น
5. Form ใช้ `FieldGroup` + `Field`, มี label, description และ validation state ที่เข้าถึงได้
6. Overlay ทุกชนิดต้องมี title และ description ที่เหมาะสม แม้จะ visually hidden
7. สถานะ loading, empty, error และ success ต้องใช้ pattern เดียวกันทั้ง Admin
8. ทำ reusable component สำหรับ card สรุป, status badge, table empty state และ action confirmation เพื่อลด class ซ้ำ

## ลำดับการลงมือแนะนำ

1. ปรับ Dashboard ให้ใช้ `Card`, `Alert`, `Button`, `Table`, `Badge`, `Empty`
2. ปรับ Attendance ให้ใช้ `Accordion`, `Card`, `Badge`, `Progress`
3. ปรับ Requests และ destructive actions ให้ใช้ `Button` + `AlertDialog`
4. ปรับฟอร์มทั้งหมดเป็น `FieldGroup`/`Field` และเพิ่ม `Textarea`/validation
5. รวม loading, empty, error และ toast ให้เป็น shared patterns
6. ค่อยปรับสี hardcode ใน Admin ไปใช้ design tokens ของ shadcn/ui ให้ครบ

## ขอบเขตที่ไม่จำเป็นต้องเปลี่ยนทันที

การใช้ `<div>` สำหรับ layout อย่างเดียวไม่ถือว่าเป็นปัญหา เพราะ shadcn/ui ไม่ได้มี component แทนทุก layout primitive จุดที่ควรเปลี่ยนคือ markup ที่ทำหน้าที่เป็น card, alert, badge, button, dialog, form field, empty state หรือ accordion แต่สร้างขึ้นเองจนทำให้ behavior และ accessibility ไม่สม่ำเสมอ
