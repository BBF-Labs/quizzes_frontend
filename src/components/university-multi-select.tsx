"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { Checkbox } from "./ui/checkbox";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";

interface UniversityMultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  className?: string;
  placeholder?: string;
}

export function UniversityMultiSelect({
  options = [],
  selected = [],
  onChange,
  className,
  placeholder = "Select Universities"
}: UniversityMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleOption = (option: string) => {
    const newSelected = selected.includes(option)
      ? selected.filter((s) => s !== option)
      : [...selected, option];
    onChange(newSelected);
  };

  const clearSelection = () => {
    onChange([]);
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`justify-between h-11 rounded-xl border-border/60 bg-background hover:bg-muted/50 ${className}`}
        >
          <div className="flex items-center gap-2 truncate">
            <span className="truncate font-normal">
              {selected.length === 0
                ? placeholder
                : `${selected.length} selected`}
            </span>
            {selected.length > 0 && (
                <div className="flex -space-x-1">
                    {selected.slice(0, 2).map((opt) => (
                         <div key={opt} className="h-2 w-2 rounded-full bg-teal-500 ring-1 ring-background" />
                    ))}
                    {selected.length > 2 && <div className="h-2 w-2 rounded-full bg-muted-foreground/30 ring-1 ring-background" />}
                </div>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[300px] p-0" align="start">
        <div className="flex items-center border-b p-2">
          <Search className="mr-2 h-4 w-4 opacity-50" />
          <Input
            placeholder="Search universities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border-none bg-transparent h-8 focus-visible:ring-0 px-0"
          />
        </div>
        <ScrollArea className="h-72 p-2">
            {filteredOptions.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                    No results found.
                </div>
            ) : (
                <div className="space-y-1">
                    {filteredOptions.map((option) => (
                        <div 
                         key={option}
                         className="flex items-center space-x-2 p-2 rounded-sm hover:bg-muted/50 cursor-pointer"
                         onClick={() => toggleOption(option)}
                        >
                           <Checkbox 
                                id={`uni-${option}`}
                                checked={selected.includes(option)}
                                onCheckedChange={() => toggleOption(option)}
                                className="border-muted-foreground/50 data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
                           />
                           <label 
                                htmlFor={`uni-${option}`} 
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 cursor-pointer truncate"
                           >
                                {option}
                           </label>
                        </div>
                    ))}
                </div>
            )}
        </ScrollArea>
        {selected.length > 0 && (
          <div className="border-t p-2">
            <Button
              variant="ghost"
              className="w-full justify-center h-8 text-xs"
              onClick={clearSelection}
            >
              Clear Selection
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
