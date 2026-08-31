"use client";

import React, { useState, useRef } from "react";
import { LoadedTemplate, renderTemplate } from "@/lib/message-templates-types";
import {
  saveTemplateAction,
  resetTemplateAction,
  sendCustomTestBroadcastAction,
} from "./actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MessageSquare,
  Sparkles,
  RotateCcw,
  Send,
  Save,
  CheckCircle2,
  AlertCircle,
  Search,
  Check,
  Smartphone,
  ChevronDown,
  ChevronUp,
  Edit3,
  RefreshCw,
  Sliders,
  Users,
  Shield,
  SendHorizontal,
  Layers,
  CheckCheck,
} from "lucide-react";
import { toast } from "sonner";

interface Props {
  initialTemplates: LoadedTemplate[];
}

export function TemplateEditor({ initialTemplates }: Props) {
  const [templates, setTemplates] = useState<LoadedTemplate[]>(initialTemplates);
  const [selectedCategory, setSelectedCategory] = useState<"CUSTOMER" | "ADMIN" | "ALL">("CUSTOMER");
  const [searchQuery, setSearchQuery] = useState("");

  // Sandbox Test Box State
  const [testTargetType, setTestTargetType] = useState<"USER" | "ADMIN" | "ALL">("ADMIN");
  const [testCustomMessage, setTestCustomMessage] = useState(
    "สวัสดีค่ะ นี่คือข้อความทดสอบจากระบบ Date with Soul Love ✨"
  );
  const [testTargetLineId, setTestTargetLineId] = useState("");
  const [isSendingSandboxTest, setIsSendingSandboxTest] = useState(false);
  const [selectedTemplateForTest, setSelectedTemplateForTest] = useState("");

  // Expanded card keys
  const [expandedKeys, setExpandedKeys] = useState<Record<string, boolean>>(() => {
    const first = initialTemplates.find((t) => t.category === "CUSTOMER") || initialTemplates[0];
    return first ? { [first.key]: true } : {};
  });

  // Per-template editing state
  const [editedContents, setEditedContents] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const t of initialTemplates) {
      initial[t.key] = t.content;
    }
    return initial;
  });

  const [enabledStates, setEnabledStates] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const t of initialTemplates) {
      initial[t.key] = t.enabled;
    }
    return initial;
  });

  const [savingKeys, setSavingKeys] = useState<Record<string, boolean>>({});
  const [resettingKeys, setResettingKeys] = useState<Record<string, boolean>>({});

  const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});

  const toggleExpand = (key: string) => {
    setExpandedKeys((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const customerCount = templates.filter((t) => t.category === "CUSTOMER").length;
  const adminCount = templates.filter((t) => t.category === "ADMIN").length;
  const totalCount = templates.length;

  // Filter templates
  const filteredTemplates = templates.filter((t) => {
    const matchesCat = selectedCategory === "ALL" || t.category === selectedCategory;
    const matchesQuery =
      searchQuery === "" ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.key.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  // Insert variable tag into textarea at cursor position
  const handleInsertVariable = (templateKey: string, varName: string) => {
    const textarea = textareaRefs.current[templateKey];
    const currentVal = editedContents[templateKey] ?? "";
    const tag = `{{${varName}}}`;

    if (textarea) {
      const start = textarea.selectionStart || currentVal.length;
      const end = textarea.selectionEnd || currentVal.length;
      const updated = currentVal.substring(0, start) + tag + currentVal.substring(end);
      setEditedContents((prev) => ({ ...prev, [templateKey]: updated }));

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + tag.length, start + tag.length);
      }, 50);
    } else {
      setEditedContents((prev) => ({ ...prev, [templateKey]: currentVal + tag }));
    }
  };

  // Save handler for a specific template
  const handleSave = async (item: LoadedTemplate) => {
    setSavingKeys((prev) => ({ ...prev, [item.key]: true }));

    const contentToSave = editedContents[item.key] ?? item.content;
    const enabledToSave = enabledStates[item.key] ?? item.enabled;

    try {
      const formData = new FormData();
      formData.set("key", item.key);
      formData.set("content", contentToSave);
      formData.set("enabled", enabledToSave ? "true" : "false");

      const res = await saveTemplateAction(formData);
      if (res.success) {
        toast.success(`บันทึกเทมเพลต "${item.title}" เรียบร้อยแล้ว`);
        setTemplates((prev) =>
          prev.map((t) =>
            t.key === item.key
              ? { ...t, content: contentToSave, enabled: enabledToSave }
              : t
          )
        );
      } else {
        toast.error(res.error || "เกิดข้อผิดพลาดในการบันทึก");
      }
    } catch (err: any) {
      toast.error(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setSavingKeys((prev) => ({ ...prev, [item.key]: false }));
    }
  };

  // Reset handler
  const handleReset = async (item: LoadedTemplate) => {
    if (!confirm(`คุณต้องการรีเซ็ตเทมเพลต "${item.title}" กลับเป็นค่าเริ่มต้นใช่หรือไม่?`)) {
      return;
    }

    setResettingKeys((prev) => ({ ...prev, [item.key]: true }));
    try {
      const res = await resetTemplateAction(item.key);
      if (res.success) {
        toast.success(`รีเซ็ต "${item.title}" เป็นค่าเริ่มต้นแล้ว`);
        setEditedContents((prev) => ({
          ...prev,
          [item.key]: item.defaultContent,
        }));
        setEnabledStates((prev) => ({
          ...prev,
          [item.key]: true,
        }));
        setTemplates((prev) =>
          prev.map((t) =>
            t.key === item.key
              ? { ...t, content: item.defaultContent, enabled: true }
              : t
          )
        );
      } else {
        toast.error(res.error || "เกิดข้อผิดพลาดในการรีเซ็ต");
      }
    } catch (err: any) {
      toast.error(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setResettingKeys((prev) => ({ ...prev, [item.key]: false }));
    }
  };

  // Sandbox Test Send Action
  const handleSendSandboxTest = async () => {
    if (!testCustomMessage.trim()) {
      toast.error("กรุณาระบุข้อความที่ต้องการทดสอบส่ง");
      return;
    }
    if (testTargetType === "USER" && !testTargetLineId.trim()) {
      toast.error("กรุณาระบุ LINE User ID ของผู้ใช้");
      return;
    }

    setIsSendingSandboxTest(true);
    try {
      const res = await sendCustomTestBroadcastAction({
        targetType: testTargetType,
        message: testCustomMessage,
        targetLineId: testTargetLineId,
      });

      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.error || "ส่งข้อความทดสอบไม่สำเร็จ");
      }
    } catch (err: any) {
      toast.error(err.message || "เกิดข้อผิดพลาดในการส่งทดสอบ");
    } finally {
      setIsSendingSandboxTest(false);
    }
  };

  // Select template to load into test box
  const handleSelectTemplateForTest = (key: string) => {
    setSelectedTemplateForTest(key);
    if (!key) return;
    const found = templates.find((t) => t.key === key);
    if (found) {
      const content = editedContents[found.key] ?? found.content;
      const mockVars: Record<string, string> = {};
      for (const v of found.variables) {
        mockVars[v.name] = v.example;
      }
      setTestCustomMessage(renderTemplate(content, mockVars));
    }
  };

  return (
    <div className="flex flex-col gap-7">
      {/* 1. DEDICATED TEST SENDING SANDBOX BOX */}
      <div className="border-4 border-[#3d3229] bg-[#fbe7a1] rounded-2xl p-5 sm:p-6 shadow-[4px_4px_0_0_#3d3229]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-4 border-[#3d3229]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-[#e51d53] rounded-xl flex items-center justify-center shadow-[2px_2px_0_0_#3d3229] text-white shrink-0 border-2 border-[#3d3229]">
              <SendHorizontal className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-[#3d3229]">
                  กล่องทดสอบส่งข้อความ LINE OA (Test Messenger Box)
                </h2>
                <span className="bg-[#fbbf24] text-[#3d3229] text-[11px] font-black px-2 py-0.5 rounded-full shadow-[2px_2px_0_0_#3d3229] border-2 border-[#3d3229] inline-flex items-center gap-1">
                  <CheckCheck className="h-3 w-3" /> LIVE TEST
                </span>
              </div>
              <p className="text-xs text-[#6a5d50] font-bold mt-1">
                เลือกส่งหาเฉพาะผู้ใช้ (User), เฉพาะแอดมิน (Admin), หรือทั้งหมด เพื่อทดสอบระบบก่อนใช้งานจริง
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-5">
          {/* Left Column: Test Controls */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Target Selector */}
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-black text-[#3d3229]">
                1. เลือกกลุ่มเป้าหมายผู้รับข้อความ:
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setTestTargetType("ADMIN")}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all font-black text-xs shadow-[2px_2px_0_0_#3d3229] ${
                    testTargetType === "ADMIN"
                      ? "border-[#3d3229] bg-[#fbbf24] text-[#3d3229] translate-y-0.5 shadow-[0_0_0_0_#3d3229]"
                      : "border-[#3d3229] bg-white text-[#3d3229] hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#3d3229]"
                  }`}
                >
                  <Shield className="h-4 w-4" />
                  <span>เฉพาะแอดมิน (Admin)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTestTargetType("USER")}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all font-black text-xs shadow-[2px_2px_0_0_#3d3229] ${
                    testTargetType === "USER"
                      ? "border-[#3d3229] bg-[#fbbf24] text-[#3d3229] translate-y-0.5 shadow-[0_0_0_0_#3d3229]"
                      : "border-[#3d3229] bg-white text-[#3d3229] hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#3d3229]"
                  }`}
                >
                  <Users className="h-4 w-4" />
                  <span>เฉพาะผู้ใช้ (User)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTestTargetType("ALL")}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all font-black text-xs shadow-[2px_2px_0_0_#3d3229] ${
                    testTargetType === "ALL"
                      ? "border-[#3d3229] bg-[#fbbf24] text-[#3d3229] translate-y-0.5 shadow-[0_0_0_0_#3d3229]"
                      : "border-[#3d3229] bg-white text-[#3d3229] hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#3d3229]"
                  }`}
                >
                  <Layers className="h-4 w-4" />
                  <span>ทั้งหมด (All / Broadcast)</span>
                </button>
              </div>
            </div>

            {/* Target LINE ID input when USER or ALL is selected */}
            {(testTargetType === "USER" || testTargetType === "ALL") && (
              <div className="flex flex-col gap-1.5 bg-white p-4 rounded-xl border-2 border-[#3d3229] shadow-[2px_2px_0_0_#3d3229]">
                <Label htmlFor="targetLineId" className="text-xs font-black text-[#3d3229]">
                  ระบุ LINE User ID ของผู้ใช้/ลูกค้า (ตัวอย่าง: U1234567890abcdef...):
                </Label>
                <Input
                  id="targetLineId"
                  placeholder="ใส่ LINE User ID ของผู้ใช้ที่ต้องการรับข้อความ"
                  value={testTargetLineId}
                  onChange={(e) => setTestTargetLineId(e.target.value)}
                  className="bg-[#faf8f5] border-2 border-[#3d3229] text-xs h-10 font-mono font-bold text-[#3d3229] focus-visible:ring-0 focus-visible:border-[#e51d53]"
                />
                <span className="text-[11px] font-bold text-[#6a5d50]">
                  * บัญชีนี้จะต้องเคย Add Friend หรือส่งข้อความหา LINE Official Account ของร้านแล้ว
                </span>
              </div>
            )}

            {/* Load from Template Selector */}
            <div className="flex flex-col gap-1.5 mt-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-black text-[#3d3229]">
                  2. ข้อความที่ต้องการส่ง (หรือเลือกดึงจากเทมเพลตที่มี):
                </Label>
                <span className="text-xs font-bold text-[#6a5d50]">
                  {testCustomMessage.length} ตัวอักษร
                </span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <select
                  value={selectedTemplateForTest}
                  onChange={(e) => handleSelectTemplateForTest(e.target.value)}
                  className="w-full text-xs font-bold rounded-lg border-2 border-[#3d3229] bg-white p-2.5 text-[#3d3229] focus:outline-none focus:ring-0 shadow-[2px_2px_0_0_#3d3229] cursor-pointer"
                >
                  <option value="">-- เลือกโหลดข้อความจากเทมเพลต --</option>
                  <optgroup label="ข้อความส่งหาลูกค้า (Customer)">
                    {templates
                      .filter((t) => t.category === "CUSTOMER")
                      .map((t) => (
                        <option key={t.key} value={t.key}>
                          👤 {t.title}
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="ข้อความแจ้งเตือนแอดมิน (Admin)">
                    {templates
                      .filter((t) => t.category === "ADMIN")
                      .map((t) => (
                        <option key={t.key} value={t.key}>
                          🛡️ {t.title}
                        </option>
                      ))}
                  </optgroup>
                </select>
              </div>

              <textarea
                value={testCustomMessage}
                onChange={(e) => setTestCustomMessage(e.target.value)}
                rows={4}
                className="w-full rounded-xl border-2 border-[#3d3229] p-3 text-xs font-bold focus:outline-none focus:border-[#e51d53] bg-white text-[#3d3229] leading-relaxed resize-y shadow-[2px_2px_0_0_#3d3229]"
                placeholder="พิมพ์ข้อความทดสอบที่ต้องการส่ง..."
              />
            </div>

            {/* Solid High-Contrast Green Action Button */}
            <button
              type="button"
              onClick={handleSendSandboxTest}
              disabled={isSendingSandboxTest || !testCustomMessage.trim()}
              className={`w-full font-black text-xs sm:text-sm py-3 px-4 rounded-xl shadow-[4px_4px_0_0_#3d3229] flex items-center justify-center gap-2 transition-all border-2 border-[#3d3229] ${
                isSendingSandboxTest || !testCustomMessage.trim()
                  ? "bg-stone-300 text-stone-500 cursor-not-allowed shadow-[0_0_0_0_#3d3229] translate-y-1"
                  : "bg-[#10b981] text-[#3d3229] hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_#3d3229] active:translate-y-1 active:shadow-[0_0_0_0_#3d3229] cursor-pointer"
              }`}
            >
              <Send className="h-4 w-4" />
              <span>
                {isSendingSandboxTest
                  ? "กำลังส่งข้อความทดสอบ..."
                  : `ส่งข้อความทดสอบไปยัง (${
                      testTargetType === "ADMIN"
                        ? "แอดมินทุกคน"
                        : testTargetType === "USER"
                        ? "ผู้ใช้ที่ระบุ"
                        : "ทั้งหมด: แอดมิน + ผู้ใช้"
                    })`}
              </span>
            </button>
          </div>

          {/* Right Column: Live Chat Simulation */}
          <div className="lg:col-span-5 flex flex-col gap-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-[#1c1917] flex items-center gap-1.5">
                <Smartphone className="h-4 w-4 text-[#059669]" />
                ตัวอย่างจำลองบนหน้าจอ LINE
              </span>
              <span className="text-[11px] text-[#44403c] font-bold font-mono">Live Preview</span>
            </div>

            {/* Solid High-Contrast LINE Screen */}
            <div
              style={{ backgroundColor: "#627b9b" }}
              className="p-4 sm:p-5 rounded-2xl shadow-md flex flex-col justify-between min-h-[240px] border border-slate-500"
            >
              {/* Header Bar */}
              <div
                style={{ backgroundColor: "#0f172a" }}
                className="flex items-center gap-2.5 p-2.5 rounded-xl text-white text-xs font-bold mb-3 shadow-md border border-slate-700"
              >
                <div
                  style={{ backgroundColor: "#d97706" }}
                  className="h-7 w-7 rounded-full text-white flex items-center justify-center text-[10px] shrink-0 font-bold border border-white/40"
                >
                  DS
                </div>
                <div className="min-w-0">
                  <p className="truncate text-white font-bold text-xs tracking-wide">
                    Date with Soul Love
                  </p>
                  <p className="text-[10px] text-amber-300 font-medium">
                    {testTargetType === "ADMIN"
                      ? "🛡️ ส่งหา: แอดมินทุกคน"
                      : testTargetType === "USER"
                      ? "👤 ส่งหา: ลูกค้า/ผู้ใช้"
                      : "🌐 ส่งหา: ทั้งหมด (แอดมิน + ลูกค้า)"}
                  </p>
                </div>
              </div>

              {/* Chat Bubble */}
              <div className="flex items-start gap-2 max-w-[95%] my-auto">
                <div
                  style={{ backgroundColor: "#ffffff", color: "#0f172a" }}
                  className="p-3.5 rounded-2xl rounded-tl-xs text-xs leading-relaxed shadow-lg whitespace-pre-wrap font-sans break-words w-full border border-slate-300"
                >
                  <span
                    style={{ backgroundColor: "#fef3c7", color: "#92400e" }}
                    className="font-bold text-[11px] block mb-1.5 px-2 py-0.5 rounded border border-amber-300 w-fit"
                  >
                    🧪 [ข้อความทดสอบ]
                  </span>
                  <span className="text-slate-950 font-medium text-xs leading-relaxed">
                    {testCustomMessage || (
                      <span className="text-slate-400 italic">ไม่มีข้อความ</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Time Stamp */}
              <div className="text-[11px] text-white font-bold mt-3 text-right drop-shadow-sm">
                วันนี้ 10:00 น.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CATEGORY TABS & SEARCH BAR (แยกข้อความ USER vs ADMIN) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-4 border-[#3d3229] pb-4">
        {/* Distinct Category Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategory("CUSTOMER")}
            className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-black rounded-lg transition-all border-2 border-[#3d3229] shadow-[2px_2px_0_0_#3d3229] ${
              selectedCategory === "CUSTOMER"
                ? "bg-[#fbbf24] text-[#3d3229] translate-y-0.5 shadow-[0_0_0_0_#3d3229]"
                : "bg-white text-[#3d3229] hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#3d3229]"
            }`}
          >
            <Users className="h-4 w-4" />
            <span>ลูกค้า (User)</span>
            <span
              className={`text-[11px] py-0 px-2 rounded-full font-mono font-black border-2 border-[#3d3229] ${
                selectedCategory === "CUSTOMER" ? "bg-white" : "bg-[#fbe7a1]"
              }`}
            >
              {customerCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory("ADMIN")}
            className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-black rounded-lg transition-all border-2 border-[#3d3229] shadow-[2px_2px_0_0_#3d3229] ${
              selectedCategory === "ADMIN"
                ? "bg-[#fbbf24] text-[#3d3229] translate-y-0.5 shadow-[0_0_0_0_#3d3229]"
                : "bg-white text-[#3d3229] hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#3d3229]"
            }`}
          >
            <Shield className="h-4 w-4" />
            <span>แอดมิน (Admin)</span>
            <span
              className={`text-[11px] py-0 px-2 rounded-full font-mono font-black border-2 border-[#3d3229] ${
                selectedCategory === "ADMIN" ? "bg-white" : "bg-[#fbe7a1]"
              }`}
            >
              {adminCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory("ALL")}
            className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-black rounded-lg transition-all border-2 border-[#3d3229] shadow-[2px_2px_0_0_#3d3229] ${
              selectedCategory === "ALL"
                ? "bg-[#fbbf24] text-[#3d3229] translate-y-0.5 shadow-[0_0_0_0_#3d3229]"
                : "bg-white text-[#3d3229] hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#3d3229]"
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>ทั้งหมด ({totalCount})</span>
          </button>
        </div>

        {/* Search Field */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#3d3229]" />
          <Input
            placeholder="ค้นหาชื่อ หรือ Key เทมเพลต..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white border-2 border-[#3d3229] text-xs h-10 rounded-xl text-[#3d3229] font-bold shadow-[2px_2px_0_0_#3d3229] focus-visible:ring-0 focus-visible:border-[#e51d53]"
          />
        </div>
      </div>

      {/* 3. TEMPLATE ACCORDION LIST */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-1">
          <div className="text-xs font-black text-[#3d3229] uppercase tracking-wider flex items-center gap-2">
            <span>
              {selectedCategory === "CUSTOMER"
                ? "👤 รายการข้อความสำหรับลูกค้า (Customer Templates)"
                : selectedCategory === "ADMIN"
                ? "🛡️ รายการข้อความแจ้งเตือนแอดมิน (Admin Alerts Templates)"
                : "📋 รายการเทมเพลตทั้งหมด (All Templates)"}
            </span>
            <span className="text-xs text-[#6a5d50] font-bold">
              ({filteredTemplates.length} รายการ)
            </span>
          </div>
          <div className="text-xs text-[#6a5d50] font-bold">
            💡 คลิกที่การ์ดเพื่อเปิดกล่องแก้ไขข้อความ
          </div>
        </div>

        {filteredTemplates.length === 0 ? (
          <div className="p-12 text-center text-sm font-black text-[#6a5d50] bg-white border-4 border-[#3d3229] rounded-2xl shadow-[4px_4px_0_0_#3d3229]">
            ไม่พบเทมเพลตที่ตรงกับคำค้นหา
          </div>
        ) : (
          filteredTemplates.map((item) => {
            const isExpanded = !!expandedKeys[item.key];
            const currentContent = editedContents[item.key] ?? item.content;
            const currentEnabled = enabledStates[item.key] ?? item.enabled;
            const isSaving = !!savingKeys[item.key];
            const isResetting = !!resettingKeys[item.key];
            const isModifiedFromSaved = currentContent !== item.content || currentEnabled !== item.enabled;
            const isCustomizedFromDefault = currentContent !== item.defaultContent;

            // Generate mock preview
            const mockVars: Record<string, string> = {};
            for (const v of item.variables) {
              mockVars[v.name] = v.example;
            }
            const renderedPreview = renderTemplate(currentContent, mockVars);

            return (
              <div
                key={item.key}
                className={`border-4 rounded-2xl bg-white transition-all overflow-hidden ${
                  isExpanded
                    ? "border-[#3d3229] shadow-[6px_6px_0_0_#3d3229]"
                    : "border-[#3d3229] shadow-[4px_4px_0_0_#3d3229] hover:shadow-[6px_6px_0_0_#3d3229] hover:-translate-y-0.5 cursor-pointer"
                }`}
              >
                {/* Accordion Header */}
                <div
                  onClick={() => toggleExpand(item.key)}
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#fbe7a1] transition-colors ${
                    isExpanded ? "border-b-4 border-[#3d3229]" : ""
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      {/* Category Tag */}
                      {item.category === "CUSTOMER" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-black border-2 border-[#3d3229] bg-[#d1fae5] text-emerald-800 shadow-[2px_2px_0_0_#3d3229]">
                          <Users className="h-3 w-3" /> ฝั่งลูกค้า
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-black border-2 border-[#3d3229] bg-[#fef3c7] text-[#92400e] shadow-[2px_2px_0_0_#3d3229]">
                          <Shield className="h-3 w-3" /> ฝั่งแอดมิน
                        </span>
                      )}

                      <h3 className="text-base font-black text-[#3d3229]">
                        {item.title}
                      </h3>

                      <span className="text-[10px] font-mono px-2 py-0.5 rounded border-2 border-[#3d3229] bg-white text-[#3d3229] font-black shadow-[2px_2px_0_0_#3d3229]">
                        {item.key}
                      </span>

                      {isCustomizedFromDefault ? (
                        <span className="text-[11px] px-2 py-0.5 rounded-full font-black border-2 border-[#3d3229] bg-[#dbeafe] text-[#1e40af] shadow-[2px_2px_0_0_#3d3229]">
                          ปรับแต่งแล้ว
                        </span>
                      ) : (
                        <span className="text-[11px] px-2 py-0.5 rounded-full font-black border-2 border-[#3d3229] bg-white text-[#3d3229] shadow-[2px_2px_0_0_#3d3229]">
                          ค่าเริ่มต้น
                        </span>
                      )}

                      {isModifiedFromSaved && (
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full font-black border-2 border-[#3d3229] bg-[#ffedd5] text-[#9a3412] animate-bounce shadow-[2px_2px_0_0_#3d3229]">
                          มีการแก้ไขที่ยังไม่บันทึก
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#6a5d50] font-bold line-clamp-1">
                      {item.description}
                    </p>
                  </div>

                  {/* Right side status and toggle */}
                  <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {currentEnabled ? (
                      <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-xl font-black border-2 border-[#3d3229] bg-[#d1fae5] text-emerald-800 shadow-[2px_2px_0_0_#3d3229]">
                        <CheckCircle2 className="h-3.5 w-3.5" /> เปิดส่งข้อความ
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-xl font-black border-2 border-[#3d3229] bg-stone-200 text-stone-600 shadow-[2px_2px_0_0_#3d3229]">
                        ปิดส่งข้อความ
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => toggleExpand(item.key)}
                      className={`border-2 px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 shadow-[2px_2px_0_0_#3d3229] transition-all cursor-pointer ${
                        isExpanded
                          ? "border-[#3d3229] bg-[#3d3229] text-white hover:bg-[#2b231d]"
                          : "border-[#3d3229] bg-white text-[#3d3229] hover:bg-stone-100"
                      }`}
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>{isExpanded ? "ย่อหน้าต่าง" : "แก้ไขข้อความ"}</span>
                      {isExpanded ? (
                        <ChevronUp className="h-3.5 w-3.5 ml-0.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5 ml-0.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Collapsed Snippet */}
                {!isExpanded && (
                  <div
                    onClick={() => toggleExpand(item.key)}
                    className="px-5 py-3.5 text-xs text-[#6a5d50] bg-white hover:bg-stone-50 flex items-center justify-between gap-4 font-mono truncate cursor-pointer"
                  >
                    <span className="truncate">
                      💬 <span className="font-sans font-bold text-[#3d3229]">{currentContent}</span>
                    </span>
                    <span className="text-xs text-[#e51d53] font-sans shrink-0 font-black">
                      คลิกเพื่อแก้ไข ✏️
                    </span>
                  </div>
                )}

                {/* Expanded Editor */}
                {isExpanded && (
                  <div className="p-5 sm:p-6 bg-white flex flex-col gap-6">
                    {/* Top Switch Row */}
                    <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-[#fbe7a1] rounded-xl border-2 border-[#3d3229] shadow-[2px_2px_0_0_#3d3229]">
                      <div className="flex items-center gap-2">
                        <Sliders className="h-4 w-4 text-[#e51d53]" />
                        <span className="text-xs font-black text-[#3d3229]">
                          การตั้งค่าเปิด/ปิดการส่งข้อความนี้:
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label
                          htmlFor={`toggle-${item.key}`}
                          className="text-xs font-black text-[#3d3229] cursor-pointer"
                        >
                          {currentEnabled ? "สถานะ: เปิดส่งข้อความอัตโนมัติ" : "สถานะ: ปิดส่งข้อความอัตโนมัติ"}
                        </Label>
                        <input
                          type="checkbox"
                          id={`toggle-${item.key}`}
                          checked={currentEnabled}
                          onChange={(e) =>
                            setEnabledStates((prev) => ({
                              ...prev,
                              [item.key]: e.target.checked,
                            }))
                          }
                          className="h-5 w-5 accent-[#e51d53] rounded cursor-pointer border-2 border-[#3d3229]"
                        />
                      </div>
                    </div>

                    {/* Editor & Preview Split Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Left: Input Textarea & Variables (7 cols) */}
                      <div className="lg:col-span-7 flex flex-col gap-4">
                        {/* Variables Helper */}
                        <div className="p-3.5 bg-[#fbe7a1] rounded-xl border-2 border-[#3d3229] shadow-[2px_2px_0_0_#3d3229]">
                          <div className="flex items-center gap-1.5 text-xs font-black text-[#3d3229] mb-2">
                            <Sparkles className="h-3.5 w-3.5 text-[#e51d53]" />
                            <span>ตัวแปรที่สามารถแทรกลงในข้อความได้ (คลิกเพื่อแทรก):</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {item.variables.map((v) => (
                              <button
                                key={v.name}
                                type="button"
                                onClick={() => handleInsertVariable(item.key, v.name)}
                                className="inline-flex items-center gap-1 text-xs bg-white border-2 border-[#3d3229] hover:bg-[#faf8f5] text-[#3d3229] px-2.5 py-1 rounded-lg transition-all font-mono shadow-[2px_2px_0_0_#3d3229] hover:translate-y-0.5 hover:shadow-[0_0_0_0_#3d3229] cursor-pointer font-black"
                                title={`ตัวอย่างค่าจริง: ${v.example}`}
                              >
                                <span className="text-[#e51d53] font-black">+</span>
                                <span>{`{{${v.name}}}`}</span>
                                <span className="text-[10px] text-[#6a5d50] font-sans font-bold ml-0.5">
                                  ({v.label})
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Textarea */}
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <Label
                              htmlFor={`content-${item.key}`}
                              className="text-xs font-black text-[#3d3229]"
                            >
                              เนื้อหาข้อความ LINE (แก้ไขข้อความได้ตามต้องการ):
                            </Label>
                            <span className="text-xs font-bold text-[#6a5d50]">
                              {currentContent.length} ตัวอักษร
                            </span>
                          </div>
                          <textarea
                            id={`content-${item.key}`}
                            ref={(el) => {
                              textareaRefs.current[item.key] = el;
                            }}
                            value={currentContent}
                            onChange={(e) =>
                              setEditedContents((prev) => ({
                                ...prev,
                                [item.key]: e.target.value,
                              }))
                            }
                            rows={6}
                            className="w-full rounded-xl border-2 border-[#3d3229] p-3 text-sm font-sans focus:outline-none focus:border-[#e51d53] bg-white text-[#3d3229] leading-relaxed resize-y shadow-[2px_2px_0_0_#3d3229] font-bold"
                            placeholder="พิมพ์ข้อความที่ต้องการส่ง..."
                          />
                        </div>
                      </div>

                      {/* Right: Live LINE Chat Bubble Preview (5 cols) */}
                      <div className="lg:col-span-5 flex flex-col gap-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-black text-[#3d3229] flex items-center gap-1.5">
                            <Smartphone className="h-4 w-4 text-[#10b981]" />
                            ตัวอย่างจำลองบนหน้าจอ LINE
                          </span>
                          <span className="text-[11px] text-[#6a5d50] font-black font-mono">Live Preview</span>
                        </div>

                        {/* Solid High-Contrast LINE Screen */}
                        <div
                          className="p-4 sm:p-5 rounded-2xl shadow-[4px_4px_0_0_#3d3229] flex flex-col justify-between min-h-[220px] border-4 border-[#3d3229] bg-[#7dd3fc]"
                        >
                          {/* Header Bar */}
                          <div
                            className="flex items-center gap-2.5 p-2.5 rounded-xl text-white text-xs font-black mb-3 shadow-[2px_2px_0_0_#3d3229] border-2 border-[#3d3229] bg-[#3d3229]"
                          >
                            <div
                              className="h-7 w-7 rounded-full text-[#3d3229] flex items-center justify-center text-[10px] shrink-0 font-black border-2 border-[#3d3229] bg-[#fbbf24]"
                            >
                              DS
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-white font-black text-xs tracking-wide">
                                Date with Soul Love
                              </p>
                              <p className="text-[10px] text-[#fbe7a1] font-bold">
                                {item.category === "CUSTOMER"
                                  ? "👤 ข้อความส่งหาลูกค้า"
                                  : "🛡️ ข้อความแจ้งเตือนแอดมิน"}
                              </p>
                            </div>
                          </div>

                          {/* Chat Bubble */}
                          <div className="flex items-start gap-2 max-w-[95%] my-auto">
                            <div
                              className="p-3.5 rounded-2xl rounded-tl-sm text-xs leading-relaxed shadow-[2px_2px_0_0_#3d3229] whitespace-pre-wrap font-sans break-words w-full border-2 border-[#3d3229] bg-white text-[#3d3229]"
                            >
                              <span className="font-bold text-xs leading-relaxed">
                                {renderedPreview || (
                                  <span className="text-stone-400 italic">ไม่มีข้อความ</span>
                                )}
                              </span>
                            </div>
                          </div>

                          {/* Time Stamp */}
                          <div className="text-[11px] text-[#3d3229] font-black mt-3 text-right">
                            วันนี้ 10:00 น.
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-5 mt-2 border-t-2 border-[#3d3229]">
                      <button
                        type="button"
                        onClick={() => handleReset(item)}
                        disabled={isResetting || !isCustomizedFromDefault}
                        className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all border-2 ${
                          !isCustomizedFromDefault
                            ? "bg-stone-200 text-stone-500 border-stone-300 cursor-not-allowed"
                            : "bg-white text-[#3d3229] border-[#3d3229] shadow-[2px_2px_0_0_#3d3229] hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#3d3229] cursor-pointer"
                        }`}
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>รีเซ็ตเป็นค่าเริ่มต้น</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSave(item)}
                          disabled={isSaving}
                          className={`font-black text-xs px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all border-2 border-[#3d3229] ${
                            isSaving
                              ? "bg-stone-500 text-white shadow-[0_0_0_0_#3d3229] translate-y-1"
                              : "bg-[#e51d53] text-white shadow-[4px_4px_0_0_#3d3229] hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_#3d3229] active:translate-y-1 active:shadow-[0_0_0_0_#3d3229]"
                          }`}
                        >
                          <Save className="h-4 w-4" />
                          <span>{isSaving ? "กำลังบันทึก..." : "บันทึกเทมเพลตนี้"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
