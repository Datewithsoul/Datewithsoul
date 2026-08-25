"use client";

import React, { useState, useRef } from "react";
import { LoadedTemplate, renderTemplate } from "@/lib/message-templates-types";
import { saveTemplateAction, resetTemplateAction, sendTestMessageAction } from "./actions";
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
  Eye,
  Info,
} from "lucide-react";
import { toast } from "sonner";

interface Props {
  initialTemplates: LoadedTemplate[];
}

export function TemplateEditor({ initialTemplates }: Props) {
  const [templates, setTemplates] = useState<LoadedTemplate[]>(initialTemplates);
  const [selectedCategory, setSelectedCategory] = useState<"CUSTOMER" | "ADMIN">("CUSTOMER");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeKey, setActiveKey] = useState<string>(
    initialTemplates.find((t) => t.category === "CUSTOMER")?.key || initialTemplates[0]?.key || ""
  );

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

  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testLineId, setTestLineId] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Filter templates
  const filteredTemplates = templates.filter((t) => {
    const matchesCat = t.category === selectedCategory;
    const matchesQuery =
      searchQuery === "" ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.key.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const activeTemplate = templates.find((t) => t.key === activeKey) || filteredTemplates[0];

  // Insert variable tag into textarea at cursor position
  const handleInsertVariable = (varName: string) => {
    if (!activeTemplate) return;
    const textarea = textareaRef.current;
    const currentVal = editedContents[activeTemplate.key] ?? activeTemplate.content;
    const tag = `{{${varName}}}`;

    if (textarea) {
      const start = textarea.selectionStart || currentVal.length;
      const end = textarea.selectionEnd || currentVal.length;
      const updated = currentVal.substring(0, start) + tag + currentVal.substring(end);
      setEditedContents((prev) => ({ ...prev, [activeTemplate.key]: updated }));

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + tag.length, start + tag.length);
      }, 50);
    } else {
      setEditedContents((prev) => ({ ...prev, [activeTemplate.key]: currentVal + tag }));
    }
  };

  // Generate mock preview text
  const currentContent = activeTemplate
    ? editedContents[activeTemplate.key] ?? activeTemplate.content
    : "";
  const currentEnabled = activeTemplate
    ? enabledStates[activeTemplate.key] ?? activeTemplate.enabled
    : true;

  const mockVariables: Record<string, string> = {};
  if (activeTemplate) {
    for (const v of activeTemplate.variables) {
      mockVariables[v.name] = v.example;
    }
  }
  const renderedPreview = renderTemplate(currentContent, mockVariables);

  // Save handler
  const handleSave = async () => {
    if (!activeTemplate) return;
    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.set("key", activeTemplate.key);
      formData.set("content", currentContent);
      formData.set("enabled", currentEnabled ? "true" : "false");

      const res = await saveTemplateAction(formData);
      if (res.success) {
        toast.success("บันทึกเทมเพลตเรียบร้อยแล้ว");
        // Update local template state
        setTemplates((prev) =>
          prev.map((t) =>
            t.key === activeTemplate.key
              ? { ...t, content: currentContent, enabled: currentEnabled }
              : t
          )
        );
      } else {
        toast.error(res.error || "เกิดข้อผิดพลาดในการบันทึก");
      }
    } catch (err: any) {
      toast.error(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setIsSaving(false);
    }
  };

  // Reset handler
  const handleReset = async () => {
    if (!activeTemplate) return;
    if (!confirm(`คุณต้องการรีเซ็ตเทมเพลต "${activeTemplate.title}" กลับเป็นค่าเริ่มต้นใช่หรือไม่?`)) {
      return;
    }

    setIsResetting(true);
    try {
      const res = await resetTemplateAction(activeTemplate.key);
      if (res.success) {
        toast.success("รีเซ็ตเป็นค่าเริ่มต้นแล้ว");
        setEditedContents((prev) => ({
          ...prev,
          [activeTemplate.key]: activeTemplate.defaultContent,
        }));
        setEnabledStates((prev) => ({
          ...prev,
          [activeTemplate.key]: true,
        }));
        setTemplates((prev) =>
          prev.map((t) =>
            t.key === activeTemplate.key
              ? { ...t, content: activeTemplate.defaultContent, enabled: true }
              : t
          )
        );
      } else {
        toast.error(res.error || "เกิดข้อผิดพลาดในการรีเซ็ต");
      }
    } catch (err: any) {
      toast.error(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setIsResetting(false);
    }
  };

  // Send Test handler
  const handleSendTest = async () => {
    if (!activeTemplate) return;
    setIsTesting(true);

    try {
      const res = await sendTestMessageAction(
        activeTemplate.key,
        currentContent,
        testLineId
      );
      if (res.success) {
        toast.success(res.message || "ส่งข้อความทดสอบสำเร็จ");
      } else {
        toast.error(res.error || "ส่งข้อความทดสอบไม่สำเร็จ");
      }
    } catch (err: any) {
      toast.error(err.message || "เกิดข้อผิดพลาดในการส่งทดสอบ");
    } finally {
      setIsTesting(false);
    }
  };

  const isModified =
    activeTemplate &&
    (currentContent !== activeTemplate.content || currentEnabled !== activeTemplate.enabled);
  const isDefault = activeTemplate && currentContent === activeTemplate.defaultContent;

  return (
    <div className="flex flex-col gap-6">
      {/* Category Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#ddd4c8] pb-4">
        <div className="flex items-center gap-2 bg-[#ece7e1] p-1 rounded-lg">
          <button
            onClick={() => {
              setSelectedCategory("CUSTOMER");
              const firstCustomer = templates.find((t) => t.category === "CUSTOMER");
              if (firstCustomer) setActiveKey(firstCustomer.key);
            }}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              selectedCategory === "CUSTOMER"
                ? "bg-[#3d3229] text-white shadow-sm"
                : "text-[#6a5d50] hover:text-[#3d3229]"
            }`}
          >
            ข้อความแจ้งเตือนลูกค้า (Customer)
          </button>
          <button
            onClick={() => {
              setSelectedCategory("ADMIN");
              const firstAdmin = templates.find((t) => t.category === "ADMIN");
              if (firstAdmin) setActiveKey(firstAdmin.key);
            }}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              selectedCategory === "ADMIN"
                ? "bg-[#3d3229] text-white shadow-sm"
                : "text-[#6a5d50] hover:text-[#3d3229]"
            }`}
          >
            ข้อความแจ้งเตือนแอดมิน (Admin)
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6a5d50]" />
          <Input
            placeholder="ค้นหาเทมเพลต..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white border-[#ddd4c8] text-sm"
          />
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Template List */}
        <div className="lg:col-span-4 flex flex-col gap-2">
          <div className="text-xs font-semibold text-[#6a5d50] uppercase tracking-wider mb-1 px-1">
            รายการเทมเพลต ({filteredTemplates.length})
          </div>

          <div className="flex flex-col gap-2 max-h-[750px] overflow-y-auto pr-1">
            {filteredTemplates.length === 0 ? (
              <div className="p-8 text-center text-sm text-[#6a5d50] bg-white border border-[#ddd4c8] rounded-md">
                ไม่พบเทมเพลตที่ตรงกับการค้นหา
              </div>
            ) : (
              filteredTemplates.map((item) => {
                const isActive = item.key === activeKey;
                const isItemModified =
                  editedContents[item.key] !== undefined &&
                  editedContents[item.key] !== item.content;
                const itemEnabled = enabledStates[item.key] ?? item.enabled;

                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveKey(item.key)}
                    className={`flex flex-col text-left p-3.5 rounded-lg border transition-all ${
                      isActive
                        ? "bg-white border-[#3d3229] shadow-sm ring-1 ring-[#3d3229]"
                        : "bg-[#faf8f5] border-[#ddd4c8] hover:bg-white hover:border-[#b8aaa0]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-sm text-[#3d3229] line-clamp-1">
                        {item.title}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        {isItemModified && (
                          <span className="h-2 w-2 rounded-full bg-amber-500" title="มีการแก้ไขที่ยังไม่บันทึก" />
                        )}
                        {itemEnabled ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-50 text-green-700 font-medium border border-green-200">
                            เปิดใช้งาน
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-medium border border-gray-200">
                            ปิดใช้งาน
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-[#6a5d50] line-clamp-2 mt-1">
                      {item.description}
                    </p>
                    <span className="text-[10px] font-mono text-gray-400 mt-2">
                      {item.key}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Template Editor & Live Preview */}
        {activeTemplate ? (
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Editor Card */}
            <div className="border border-[#ddd4c8] bg-white rounded-lg p-5 sm:p-6 shadow-sm">
              {/* Header with Title & Enabled Toggle */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#ddd4c8]">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-[#3d3229]">
                      {activeTemplate.title}
                    </h2>
                    <Badge variant="outline" className="text-xs font-mono bg-gray-50 text-[#6a5d50]">
                      {activeTemplate.key}
                    </Badge>
                  </div>
                  <p className="text-xs text-[#6a5d50] mt-1">
                    {activeTemplate.description}
                  </p>
                </div>

                {/* Enable/Disable Toggle */}
                <div className="flex items-center gap-2 bg-[#f4f1ec] px-3 py-1.5 rounded-md border border-[#ddd4c8]">
                  <Label htmlFor="toggle-enabled" className="text-xs font-medium text-[#3d3229] cursor-pointer">
                    {currentEnabled ? "สถานะ: เปิดส่งข้อความ" : "สถานะ: ปิดส่งข้อความ"}
                  </Label>
                  <input
                    type="checkbox"
                    id="toggle-enabled"
                    checked={currentEnabled}
                    onChange={(e) =>
                      setEnabledStates((prev) => ({
                        ...prev,
                        [activeTemplate.key]: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 accent-[#3d3229] rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Variable Helper Buttons */}
              <div className="my-4 p-3 bg-[#faf8f5] rounded-lg border border-[#eee8e0]">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#3d3229] mb-2">
                  <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                  <span>ตัวแปรที่สามารถแทรกลงในข้อความได้ (คลิกเพื่อแทรก):</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {activeTemplate.variables.map((v) => (
                    <button
                      key={v.name}
                      type="button"
                      onClick={() => handleInsertVariable(v.name)}
                      className="inline-flex items-center gap-1 text-xs bg-white border border-[#ddd4c8] hover:border-[#3d3229] hover:bg-[#ece7e1] text-[#3d3229] px-2.5 py-1 rounded-md transition-all font-mono shadow-2xs"
                      title={`ตัวอย่าง: ${v.example}`}
                    >
                      <span className="text-amber-700 font-bold">+</span>
                      <span>{`{{${v.name}}}`}</span>
                      <span className="text-[10px] text-[#6a5d50] font-sans font-normal ml-0.5">
                        ({v.label})
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Textarea Field */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="templateContent" className="text-xs font-semibold text-[#3d3229]">
                    เนื้อหาข้อความ LINE (รองรับการขึ้นบรรทัดใหม่และ Emoji)
                  </Label>
                  <span className="text-[11px] text-[#6a5d50]">
                    {currentContent.length} ตัวอักษร
                  </span>
                </div>
                <textarea
                  id="templateContent"
                  ref={textareaRef}
                  value={currentContent}
                  onChange={(e) =>
                    setEditedContents((prev) => ({
                      ...prev,
                      [activeTemplate.key]: e.target.value,
                    }))
                  }
                  rows={7}
                  className="w-full rounded-md border border-[#ddd4c8] p-3 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#8a6d1f] focus:border-transparent bg-white leading-relaxed resize-y"
                  placeholder="พิมพ์เนื้อหาข้อความที่ต้องการ..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 mt-5 pt-4 border-t border-[#eee8e0]">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  disabled={isResetting || isDefault}
                  className="border-[#ddd4c8] text-[#6a5d50] hover:text-[#3d3229] hover:bg-[#ece7e1]"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                  รีเซ็ตเป็นค่าเริ่มต้น
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    size="sm"
                    className="bg-[#3d3229] text-white hover:bg-[#3d3229]/90 px-4"
                  >
                    <Save className="h-3.5 w-3.5 mr-1.5" />
                    {isSaving ? "กำลังบันทึก..." : "บันทึกเทมเพลต"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Live LINE Chat Bubble Preview & Test Send */}
            <div className="border border-[#ddd4c8] bg-white rounded-lg p-5 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-[#ddd4c8] mb-4">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-[#06C755]" />
                  <h3 className="text-sm font-bold text-[#3d3229]">
                    ตัวอย่างข้อความจำลองใน LINE (Live Preview)
                  </h3>
                </div>
                <Badge variant="outline" className="text-[11px] bg-green-50 text-green-700 border-green-200">
                  LINE OA
                </Badge>
              </div>

              {/* LINE Phone Simulation Screen */}
              <div className="bg-[#72889f] p-4 sm:p-6 rounded-xl max-w-md mx-auto shadow-inner">
                {/* Chat header */}
                <div className="flex items-center gap-2 text-white text-xs mb-3 font-semibold pb-2 border-b border-white/20">
                  <div className="h-6 w-6 rounded-full bg-[#3d3229] text-white flex items-center justify-center text-[10px]">
                    DS
                  </div>
                  <span>Date with Soul Love (Official Account)</span>
                </div>

                {/* LINE Chat Bubble */}
                <div className="flex items-start gap-2 max-w-[90%]">
                  <div className="bg-white text-black p-3.5 rounded-2xl rounded-tl-sm text-xs leading-relaxed shadow-sm whitespace-pre-wrap font-sans break-words">
                    {renderedPreview || <span className="text-gray-400 italic">ไม่มีข้อความ</span>}
                  </div>
                </div>

                <div className="text-[10px] text-white/70 mt-2 text-right">
                  วันนี้ 10:00 น.
                </div>
              </div>

              {/* Test Send Section */}
              <div className="mt-5 pt-4 border-t border-[#eee8e0] bg-[#faf8f5] p-4 rounded-lg">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#3d3229] mb-2">
                  <Send className="h-3.5 w-3.5 text-[#06C755]" />
                  <span>ทดสอบส่งข้อความจริงเข้า LINE (Test Send)</span>
                </div>
                <p className="text-xs text-[#6a5d50] mb-3">
                  ระบบจะแทนค่าตัวแปรจำลองและส่งข้อความทดสอบไปยัง LINE User ID ที่ระบุ
                </p>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <Input
                    placeholder="LINE User ID ปลายทาง (เว้นว่างเพื่อส่งหาแอดมินที่ล็อกอิน)"
                    value={testLineId}
                    onChange={(e) => setTestLineId(e.target.value)}
                    className="bg-white border-[#ddd4c8] text-xs"
                  />
                  <Button
                    onClick={handleSendTest}
                    disabled={isTesting || !currentContent.trim()}
                    size="sm"
                    className="bg-[#06C755] text-white hover:bg-[#06C755]/90 whitespace-nowrap"
                  >
                    <Send className="h-3.5 w-3.5 mr-1" />
                    {isTesting ? "กำลังส่ง..." : "ส่งข้อความทดสอบ"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
