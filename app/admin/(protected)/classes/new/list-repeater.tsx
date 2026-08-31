"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";

interface ListRepeaterProps {
  name: string;
  label: string;
  placeholder?: string;
  defaultItems?: string[];
}

export default function ListRepeater({ name, label, placeholder, defaultItems = [""] }: ListRepeaterProps) {
  const [items, setItems] = useState<string[]>(defaultItems);

  const addItem = () => {
    setItems([...items, ""]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  };

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={items.filter(Boolean).join('\n')} />
      
      <label className="text-sm font-medium leading-none">{label}</label>

      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input 
              type="text" 
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              placeholder={placeholder}
              className="flex-1"
            />
            {items.length > 1 && (
              <Button 
                type="button" 
                variant="ghost" 
                size="icon"
                onClick={() => removeItem(index)}
                className="text-gray-400 hover:text-red-500 shrink-0"
              >
                <Trash2 size={16} />
              </Button>
            )}
          </div>
        ))}
      </div>

      <Button 
        type="button" 
        variant="outline" 
        size="sm" 
        onClick={addItem} 
        className="text-xs border-dashed"
      >
        <Plus size={14} className="mr-1" /> เพิ่มรายการ
      </Button>
    </div>
  );
}
