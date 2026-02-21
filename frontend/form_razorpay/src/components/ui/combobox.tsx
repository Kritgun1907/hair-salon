/**
 * @file combobox.tsx
 * @description Single-value searchable combobox using cmdk + Radix Popover.
 *              Provides keyboard-navigable selection with a search input.
 */

"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Command } from "cmdk";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComboboxItem {
  id: string;
  name: string;
}

interface ComboboxProps {
  items: ComboboxItem[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
}

export function Combobox({
  items,
  value,
  onValueChange,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  disabled,
  className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const selected = items.find((i) => i.id === value);

  const filtered = search.trim()
    ? items.filter((i) =>
        i.name.toLowerCase().includes(search.toLowerCase())
      )
    : items;

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-9 w-full items-center justify-between rounded-md border border-stone-300",
            "bg-white px-3 py-2 text-sm text-stone-800",
            "placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-1",
            "disabled:cursor-not-allowed disabled:opacity-50",
            !selected && "text-stone-400",
            className
          )}
        >
          <span className="truncate">{selected ? selected.name : placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-stone-400" />
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

            <Command.List className="max-h-48 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <div className="py-4 text-center text-sm text-stone-400">
                  No results found.
                </div>
              ) : (
                filtered.map((item) => (
                  <Command.Item
                    key={item.id}
                    value={item.id}
                    onSelect={() => {
                      onValueChange(item.id === value ? "" : item.id);
                      setSearch("");
                      setOpen(false);
                    }}
                    className="flex cursor-pointer items-center px-3 py-1.5 text-sm hover:bg-stone-100 data-[selected=true]:bg-stone-100"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 text-stone-700",
                        value === item.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {item.name}
                  </Command.Item>
                ))
              )}
            </Command.List>
          </Command>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
