"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { BookingStatusBadge } from "@/components/admin-status-badge";
import { AdminBookingControls } from "@/components/admin-booking-controls";
import { AdminBookingDialog } from "@/components/admin-booking-dialog";
import { AdminChangeClassDialog } from "@/components/admin-change-class-dialog";
import { TableCell, TableRow } from "@/components/ui/table";

export function AdminGroupedBookingRow({ 
  group, 
  classEvents 
}: { 
  group: any;
  classEvents: any[];
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!group.isGroup) {
    const b = group.items[0];
    return (
      <TableRow className="border-[#eee8e0] align-top group-row hover:bg-[#f7f4ef]/50">
        <TableCell className="px-5 py-4">
          <div className="font-medium text-[#3d3229]">{b.user.name}</div>
          {b.user.phone && <div className="text-xs text-[#6a5d50] mt-0.5">{b.user.phone}</div>}
          <div className="text-[10px] text-[#a09486] font-mono mt-1" title={b.id}>
            {b.id.substring(0, 8)}
          </div>
        </TableCell>
        <TableCell className="py-4">
          <div className="font-medium text-[#3d3229]">{b.classEvent.name}</div>
          <div className="text-xs text-[#6a5d50] mt-0.5">
            {new Date(b.classEvent.date).toLocaleDateString("th-TH")}
          </div>
          <div className="text-xs text-[#6a5d50]">
            {b.classEvent.startTime}–{b.classEvent.endTime} น.
          </div>
        </TableCell>
        <TableCell className="py-4 text-sm text-[#6a5d50] whitespace-nowrap">
          {new Date(b.createdAt).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" })}
        </TableCell>
        <TableCell className="text-center tabular-nums py-4">{b.seats}</TableCell>
        <TableCell className="text-right tabular-nums font-medium py-4">{b.totalPrice.toLocaleString("th-TH")}</TableCell>
        <TableCell className="py-4">
          <BookingStatusBadge status={b.status} />
        </TableCell>
        <TableCell className="py-4">
          <AdminBookingControls
            bookingId={b.id}
            status={b.status}
            slipUrl={group.slipUrl}
            reviewLogs={group.reviewLogs}
          />
        </TableCell>
        <TableCell className="px-5 py-4 flex flex-col items-start gap-2">
          <AdminBookingDialog booking={b} />
          {b.status !== "CANCELLED" ? (
            <AdminChangeClassDialog
              bookingId={b.id}
              currentClassEventId={b.classEventId}
              seats={b.seats}
              classEvents={classEvents}
            />
          ) : null}
        </TableCell>
      </TableRow>
    );
  }

  // It's a Group!
  return (
    <>
      <TableRow 
        className={`border-[#eee8e0] align-top bg-[#faf8f5] hover:bg-[#f7f4ef] cursor-pointer transition-colors ${isExpanded ? 'border-b-0' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <TableCell className="px-5 py-4">
          <div className="flex items-center gap-2">
            <button className="text-[#8f3b2c] p-1 rounded hover:bg-black/5">
              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            <div>
              <div className="font-medium text-[#3d3229]">{group.user.name}</div>
              {group.user.phone && <div className="text-xs text-[#6a5d50] mt-0.5">{group.user.phone}</div>}
              <div className="text-[10px] text-[#a09486] font-mono mt-1 font-semibold text-[#8f3b2c]">
                GROUP: {group.id.substring(0, 8)}
              </div>
            </div>
          </div>
        </TableCell>
        <TableCell className="py-4">
          <div className="font-semibold text-[#8f3b2c]">จองแบบกลุ่ม ({group.items.length} คอร์ส)</div>
          <div className="text-xs text-[#6a5d50] mt-1 line-clamp-2">
            {group.items.map((i: any) => i.classEvent.name).join(", ")}
          </div>
        </TableCell>
        <TableCell className="py-4 text-sm text-[#6a5d50] whitespace-nowrap">
          {new Date(group.createdAt).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" })}
        </TableCell>
        <TableCell className="text-center tabular-nums py-4 font-semibold text-[#3d3229]">
          {group.totalSeats}
        </TableCell>
        <TableCell className="text-right tabular-nums font-bold py-4 text-[#8f3b2c]">
          {group.totalPrice.toLocaleString("th-TH")}
        </TableCell>
        <TableCell className="py-4">
          <BookingStatusBadge status={group.status} />
        </TableCell>
        <TableCell className="py-4" onClick={(e) => e.stopPropagation()}>
          <AdminBookingControls
            bookingId={group.id}
            isGroup={true}
            status={group.status}
            slipUrl={group.slipUrl}
            reviewLogs={group.reviewLogs}
          />
        </TableCell>
        <TableCell className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
        </TableCell>
      </TableRow>

      {isExpanded && group.items.map((b: any, idx: number) => (
        <TableRow key={b.id} className={`bg-white align-top border-[#eee8e0] ${idx === group.items.length - 1 ? 'border-b-2' : 'border-b-0 border-dashed'}`}>
          <TableCell className="px-5 py-3 border-l-4 border-[#d4c7b8]">
            <div className="flex items-center gap-2 pl-6">
              <div className="text-[10px] text-[#a09486] font-mono mt-1" title={b.id}>
                {b.id.substring(0, 8)}
              </div>
            </div>
          </TableCell>
          <TableCell className="py-3">
            <div className="font-medium text-[#3d3229]">{b.classEvent.name}</div>
            <div className="text-xs text-[#6a5d50] mt-0.5">
              {new Date(b.classEvent.date).toLocaleDateString("th-TH")} ({b.classEvent.startTime}–{b.classEvent.endTime} น.)
            </div>
          </TableCell>
          <TableCell className="py-3 text-sm text-[#6a5d50]"></TableCell>
          <TableCell className="text-center tabular-nums py-3">{b.seats}</TableCell>
          <TableCell className="text-right tabular-nums font-medium py-3 text-[#a09486]">{b.totalPrice.toLocaleString("th-TH")}</TableCell>
          <TableCell className="py-3">
            <BookingStatusBadge status={b.status} />
          </TableCell>
          <TableCell className="py-3">
          </TableCell>
          <TableCell className="px-5 py-3 flex flex-col items-start gap-2">
            <AdminBookingDialog booking={b} />
            {b.status !== "CANCELLED" ? (
              <AdminChangeClassDialog
                bookingId={b.id}
                currentClassEventId={b.classEventId}
                seats={b.seats}
                classEvents={classEvents}
              />
            ) : null}
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
