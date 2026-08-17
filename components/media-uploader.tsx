"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { GripVertical, X, Loader2, Image as ImageIcon, Video as VideoIcon } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "./ui/button";

export type MediaItem = {
  id: string;
  url: string;
  type: "IMAGE" | "VIDEO";
  order: number;
};

interface SortableItemProps {
  item: MediaItem;
  onRemove: (id: string) => void;
}

function SortableItem({ item, onRemove }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative rounded-xl overflow-hidden border-2 border-[#5D4037] shadow-sm bg-white h-32 w-32 flex-shrink-0 group ${isDragging ? "opacity-50" : ""}`}
    >
      {/* Drag Handle */}
      <div 
        {...attributes} 
        {...listeners}
        className="absolute top-1 left-1 bg-white/80 p-1 rounded cursor-grab active:cursor-grabbing text-[#5D4037] z-10 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical size={16} />
      </div>

      {/* Delete Button */}
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded hover:bg-red-600 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X size={16} />
      </button>

      {/* Content */}
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        {item.type === "IMAGE" ? (
          <img src={item.url} alt="media" className="w-full h-full object-cover" />
        ) : (
          <video src={item.url} className="w-full h-full object-cover" />
        )}
      </div>

      <div className="absolute bottom-0 left-0 w-full bg-black/50 text-white text-[10px] text-center p-0.5 font-bold flex items-center justify-center gap-1">
        {item.type === "IMAGE" ? <ImageIcon size={10} /> : <VideoIcon size={10} />}
        {item.type}
      </div>
    </div>
  );
}

interface MediaUploaderProps {
  initialMedia?: MediaItem[];
}

export default function MediaUploader({ initialMedia = [] }: MediaUploaderProps) {
  const [items, setItems] = useState<MediaItem[]>(initialMedia.sort((a, b) => a.order - b.order));
  const [isUploading, setIsUploading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsUploading(true);
    try {
      const newItems: MediaItem[] = [];
      const timestamp = Date.now();

      // We need to import the action dynamically or pass it as a prop if we were in a pure client component, 
      // but Server Actions can be imported directly into Client Components in Next.js 14+
      const { uploadMediaAction } = await import("@/app/admin/classes/actions");

      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i];
        const isVideo = file.type.startsWith("video/");
        const type = isVideo ? "VIDEO" : "IMAGE";
        const path = `classes/${isVideo ? 'videos' : 'images'}/${timestamp}-${file.name}`;
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('path', path);

        const url = await uploadMediaAction(formData);

        if (!url) {
          console.error("Upload failed for", file.name);
          continue;
        }

        newItems.push({
          id: Math.random().toString(36).substring(7),
          url: url,
          type,
          order: 0,
        });
      }

      setItems((prev) => {
        const updated = [...prev, ...newItems];
        return updated.map((item, index) => ({ ...item, order: index }));
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'image/*': [],
      'video/*': []
    }
  });

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const reordered = arrayMove(items, oldIndex, newIndex);
        return reordered.map((item, index) => ({ ...item, order: index }));
      });
    }
  };

  const handleRemove = (id: string) => {
    setItems((prev) => {
      const updated = prev.filter(item => item.id !== id);
      return updated.map((item, index) => ({ ...item, order: index }));
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Hidden input to pass data to server action */}
      <input type="hidden" name="mediaJson" value={JSON.stringify(items)} />

      {/* Drag & Drop Area */}
      <div 
        {...getRootProps()} 
        className={`border-4 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-[#F44336] bg-red-50' : 'border-gray-300 hover:border-[#5D4037] hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <div className="flex flex-col items-center gap-2 text-gray-500">
            <Loader2 className="animate-spin" size={32} />
            <p className="font-bold">กำลังอัปโหลดไฟล์...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-500">
            <div className="flex gap-2">
              <ImageIcon size={32} />
              <VideoIcon size={32} />
            </div>
            <p className="font-bold text-lg text-[#5D4037]">ลากและวางรูปภาพ/วิดีโอที่นี่</p>
            <p className="text-sm">หรือคลิกเพื่อเลือกไฟล์ (สามารถเลือกได้หลายไฟล์)</p>
          </div>
        )}
      </div>

      {/* Sortable Grid */}
      {items.length > 0 && (
        <div>
          <p className="text-sm font-bold text-gray-500 mb-2">เรียงลำดับการแสดงผล (ลากเพื่อสลับที่)</p>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div className="flex flex-wrap gap-4 bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
              <SortableContext
                items={items.map(i => i.id)}
                strategy={horizontalListSortingStrategy}
              >
                {items.map((item) => (
                  <SortableItem key={item.id} item={item} onRemove={handleRemove} />
                ))}
              </SortableContext>
            </div>
          </DndContext>
        </div>
      )}
    </div>
  );
}
