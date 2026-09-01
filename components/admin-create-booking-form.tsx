"use client";

import * as React from "react";
import { adminCreateBooking } from "@/app/admin/(protected)/bookings/actions";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button 
      type="submit" 
      disabled={pending} 
      className="mt-4 pop-btn-red text-white font-bold py-3.5 rounded-xl text-lg transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? "กำลังบันทึก..." : "ยืนยันการสร้างการจอง"}
    </button>
  );
}

export function AdminCreateBookingForm({ 
  users, 
  classEvents 
}: { 
  users: { id: string, name: string, email?: string | null, phone?: string | null }[],
  classEvents: { id: string, name: string, date: Date, startTime: string, endTime: string, totalSeats: number }[]
}) {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [isNewCustomer, setIsNewCustomer] = React.useState(false);
  const [selectedClassName, setSelectedClassName] = React.useState<string>("");

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    const res = await adminCreateBooking(formData);
    if (!res.success) {
      setError(res.error || "เกิดข้อผิดพลาด");
    } else {
      router.push("/admin/bookings");
    }
  };

  return (
    <form action={handleSubmit} className="flex flex-col gap-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg font-semibold flex items-center gap-2">
          {error}
        </div>
      )}
      
      {/* Customer Info */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center mb-1">
          <label htmlFor="userId" className="font-semibold text-base text-gray-800">ข้อมูลลูกค้า</label>
          <button 
            type="button" 
            onClick={() => setIsNewCustomer(!isNewCustomer)} 
            className="text-sm text-blue-600 underline font-medium cursor-pointer hover:text-blue-800 transition-colors"
          >
            {isNewCustomer ? "เลือกลูกค้าที่มีในระบบ" : "เพิ่มลูกค้าใหม่ (กรอกข้อมูลเอง)"}
          </button>
        </div>
        
        {!isNewCustomer ? (
          <select 
            name="userId" 
            id="userId" 
            required
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all bg-white text-base"
          >
            <option value="">-- เลือกลูกค้า --</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name} {u.phone ? `(${u.phone})` : ""}</option>
            ))}
          </select>
        ) : (
          <div className="flex flex-col gap-3 p-5 bg-gray-50 border border-gray-200 rounded-xl">
            <input 
              type="text"
              name="customerName" 
              placeholder="ชื่อ-นามสกุล *" 
              required 
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all w-full bg-white"
            />
            <input 
              type="tel"
              name="customerPhone" 
              placeholder="เบอร์โทรศัพท์ *" 
              required
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all w-full bg-white"
            />
            <p className="text-xs text-gray-500 font-medium">หากเบอร์โทรศัพท์ตรงกับที่มีในระบบ จะทำการรวมข้อมูลให้โดยอัตโนมัติ</p>
          </div>
        )}
      </div>

      <hr className="border-gray-200" />

      {/* Class Selection */}
      <div className="flex flex-col gap-2">
        <label className="font-semibold text-base text-gray-800 mb-1">ชื่อคอร์สเรียน</label>
        <select 
          value={selectedClassName}
          onChange={(e) => {
            setSelectedClassName(e.target.value);
            const eventSelect = document.getElementById("classEventId") as HTMLSelectElement;
            if (eventSelect) eventSelect.value = "";
          }}
          className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all bg-white text-base"
        >
          <option value="">-- เลือกชื่อคอร์สเรียน --</option>
          {Array.from(new Set(classEvents.map(c => c.name))).map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="classEventId" className="font-semibold text-base text-gray-800 mb-1">รอบเรียน (วันและเวลา)</label>
        <select 
          name="classEventId" 
          id="classEventId" 
          required
          disabled={!selectedClassName}
          className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all bg-white text-base disabled:bg-gray-100 disabled:text-gray-400"
        >
          <option value="">-- เลือกรอบเรียน --</option>
          {classEvents.filter(c => c.name === selectedClassName).map(c => (
            <option key={c.id} value={c.id} disabled={c.totalSeats === 0}>
              {new Date(c.date).toLocaleDateString("th-TH")} {c.startTime}-{c.endTime} - ว่าง {c.totalSeats} ที่
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="seats" className="font-semibold text-base text-gray-800 mb-1">จำนวนที่นั่ง</label>
        <input 
          type="number" 
          id="seats" 
          name="seats" 
          min="1" 
          defaultValue="1" 
          required 
          className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all bg-white text-base"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="note" className="font-semibold text-base text-gray-800 mb-1">หมายเหตุ</label>
        <textarea 
          id="note" 
          name="note" 
          placeholder="เช่น สร้างโดยแอดมินแทนลูกค้า..."
          className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all min-h-[100px] resize-y bg-white text-base"
        />
      </div>

      <div className="flex items-center gap-3 mt-2 bg-gray-50 p-4 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
        <input 
          type="checkbox" 
          id="markAsPaid" 
          name="markAsPaid" 
          className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black cursor-pointer" 
        />
        <label htmlFor="markAsPaid" className="font-semibold text-base text-gray-800 cursor-pointer flex-1">
          ยืนยันการชำระเงินทันที (ข้ามขั้นตอนรอสลิป)
        </label>
      </div>

      <SubmitButton />
    </form>
  );
}
