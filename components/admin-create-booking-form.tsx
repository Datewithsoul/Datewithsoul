"use client";

import * as React from "react";
import { adminCreateBooking } from "@/app/admin/(protected)/bookings/actions";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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
  const [selectedEventId, setSelectedEventId] = React.useState<string>("");
  const [selectedUserId, setSelectedUserId] = React.useState<string>("");
  const [openUser, setOpenUser] = React.useState(false);
  const [openClass, setOpenClass] = React.useState(false);
  const [openEvent, setOpenEvent] = React.useState(false);

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
          <>
            <input type="hidden" name="userId" value={selectedUserId} required={!isNewCustomer} />
            <Popover open={openUser} onOpenChange={setOpenUser}>
              <PopoverTrigger render={<Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openUser}
                  className="w-full justify-between bg-white text-base font-normal h-12 px-3 border-gray-300"
                >
                  {selectedUserId
                    ? (() => {
                        const u = users.find((user) => user.id === selectedUserId);
                        return u ? `${u.name} ${u.phone ? `(${u.phone})` : ""}` : "-- เลือกลูกค้า --";
                      })()
                    : "-- เลือกลูกค้า --"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>} />
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder="ค้นหาลูกค้า (ชื่อ, เบอร์โทร)..." className="h-9" />
                  <CommandList>
                    <CommandEmpty>ไม่พบลูกค้าที่ค้นหา</CommandEmpty>
                    <CommandGroup>
                      {users.map((u) => (
                        <CommandItem
                          key={u.id}
                          value={`${u.name} ${u.phone || ""} ${u.id}`}
                          onSelect={() => {
                            setSelectedUserId(u.id);
                            setOpenUser(false);
                          }}
                        >
                          {u.name} {u.phone ? `(${u.phone})` : ""}
                          <Check
                            className={cn(
                              "ml-auto h-4 w-4",
                              selectedUserId === u.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </>
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
        <Popover open={openClass} onOpenChange={setOpenClass}>
          <PopoverTrigger render={<Button
              variant="outline"
              role="combobox"
              aria-expanded={openClass}
              className="w-full justify-between bg-white text-base font-normal h-12 px-3 border-gray-300"
            >
              {selectedClassName || "-- เลือกชื่อคอร์สเรียน --"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>} />
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput placeholder="ค้นหาชื่อคอร์ส..." className="h-9" />
              <CommandList>
                <CommandEmpty>ไม่พบคอร์สเรียนที่ค้นหา</CommandEmpty>
                <CommandGroup>
                  {Array.from(new Set(classEvents.map(c => c.name))).map((name) => (
                    <CommandItem
                      key={name}
                      value={name}
                      onSelect={(currentValue) => {
                        setSelectedClassName(name);
                        setSelectedEventId("");
                        setOpenClass(false);
                      }}
                    >
                      {name}
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          selectedClassName === name ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="classEventId" className="font-semibold text-base text-gray-800 mb-1">รอบเรียน (วันและเวลา)</label>
        <>
          <input type="hidden" name="classEventId" value={selectedEventId} required />
          <Popover open={openEvent} onOpenChange={setOpenEvent}>
            <PopoverTrigger render={<Button
                variant="outline"
                role="combobox"
                aria-expanded={openEvent}
                disabled={!selectedClassName}
                className="w-full justify-between bg-white text-base font-normal h-12 px-3 border-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {selectedEventId && classEvents.find(c => c.id === selectedEventId)
                  ? (() => {
                      const c = classEvents.find(c => c.id === selectedEventId)!;
                      return `${new Date(c.date).toLocaleDateString("th-TH")} ${c.startTime}-${c.endTime} - ว่าง ${c.totalSeats} ที่`;
                    })()
                  : "-- เลือกรอบเรียน --"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>} />
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput placeholder="ค้นหารอบเรียน..." className="h-9" />
                <CommandList>
                  <CommandEmpty>ไม่พบรอบเรียนที่ค้นหา</CommandEmpty>
                  <CommandGroup>
                    {classEvents.filter(c => c.name === selectedClassName).map((c) => (
                      <CommandItem
                        key={c.id}
                        value={`${new Date(c.date).toLocaleDateString("th-TH")} ${c.startTime}-${c.endTime} ${c.id}`}
                        disabled={c.totalSeats === 0}
                        onSelect={() => {
                          if (c.totalSeats > 0) {
                            setSelectedEventId(c.id);
                            setOpenEvent(false);
                          }
                        }}
                      >
                        {new Date(c.date).toLocaleDateString("th-TH")} {c.startTime}-{c.endTime} - ว่าง {c.totalSeats} ที่
                        <Check
                          className={cn(
                            "ml-auto h-4 w-4",
                            selectedEventId === c.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </>
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
