"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Command } from "cmdk";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MultiSelectItem {
  id: string;
  name: string;
}

interface MultiSelectProps {
  items: MultiSelectItem[];
  values: string[];
  onValuesChange: (values: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
}

export function MultiSelect({
  items,
  values,
  onValuesChange,
  placeholder = "Select options…",
  searchPlaceholder = "Search…",
  disabled,
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const selectedItems = items.filter((i) => values.includes(i.id));

  const filtered = search.trim()
    ? items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()))
    : items;

  const toggle = (id: string) => {
    if (values.includes(id)) {
      onValuesChange(values.filter((v) => v !== id));
    } else {
      onValuesChange([...values, id]);
    }
  };

  const remove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onValuesChange(values.filter((v) => v !== id));
  };

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex min-h-9 w-full items-start justify-between rounded-md border border-stone-300",
            "bg-white px-3 py-2 text-sm text-stone-800",
            "focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-1",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
        >
          <div className="flex flex-wrap gap-1 flex-1 text-left">
            {selectedItems.length === 0 ? (
              <span className="text-stone-400 py-0.5">{placeholder}</span>
            ) : (
              selectedItems.map((item) => (
                <span
                  key={item.id}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100 border border-stone-200 text-xs font-medium text-stone-700"
                >
                  {item.name}
                  <span
                    role="button"
                    onClick={(e) => remove(item.id, e)}
                    className="hover:text-stone-900 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </span>
                </span>
              ))
            )}
          </div>
          <ChevronsUpDown className="ml-2 mt-0.5 h-4 w-4 shrink-0 text-stone-400" />
        </button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={4}
          className={cn(
            "z-50 w-(--radix-popover-trigger-width) min-w-48 overflow-hidden rounded-md border border-stone-200",
            "bg-white text-stone-900 shadow-lg",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2"
          )}
        >
          <Command shouldFilter={false}>
            {/* Search input */}
            <div className="flex items-center border-b border-stone-200 px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 text-stone-400" />
              <Command.Input
                value={search}
                onValueChange={setSearch}
                placeholder={searchPlaceholder}
                className="flex h-9 w-full bg-transparent py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none"
              />
            </div>

            {/* Select-all / clear row */}
            {items.length > 0 && (
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-stone-100 text-xs text-stone-500">
                <span>{values.length} selected</span>
                {values.length > 0 && (
                  <button
                    type="button"
                    onClick={() => onValuesChange([])}
                    className="text-stone-400 hover:text-stone-700 underline"
                  >
                    Clear all
                  </button>
                )}
              </div>
            )}

            <Command.List className="max-h-52 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <div className="py-4 text-center text-sm text-stone-400">
                  No results found.
                </div>
              ) : (
                filtered.map((item) => {
                  const isSelected = values.includes(item.id);
                  return (
                    <Command.Item
                      key={item.id}
                      value={item.id}
                      onSelect={() => toggle(item.id)}
                      className="flex cursor-pointer items-center px-3 py-1.5 text-sm hover:bg-stone-100 data-[selected=true]:bg-stone-50"
                    >
                      {/* Checkbox */}
                      <span
                        className={cn(
                          "mr-2.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                          isSelected
                            ? "border-stone-900 bg-stone-900"
                            : "border-stone-300 bg-white"
                        )}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                      </span>
                      {item.name}
                    </Command.Item>
                  );
                })
              )}
            </Command.List>
          </Command>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
