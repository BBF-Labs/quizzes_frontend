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

interface UserOption {
    _id: string; // Waitlist ID, not User ID
    name: string;
    email: string;
}

interface UserMultiSelectProps {
  options: UserOption[];
  selected: string[]; // Array of selected emails
  onChange: (selected: string[]) => void;
  className?: string;
  placeholder?: string;
}

export function UserMultiSelect({
  options = [],
  selected = [],
  onChange,
  className,
  placeholder = "Select Users"
}: UserMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOptions = options.filter((opt) =>
    opt.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    opt.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleOption = (email: string) => {
    const newSelected = selected.includes(email)
      ? selected.filter((s) => s !== email)
      : [...selected, email];
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
          className={`justify-between h-auto min-h-[44px] py-2 rounded-xl border-border/60 bg-background hover:bg-muted/50 ${className}`}
        >
          <div className="flex flex-col items-start gap-1 w-full overflow-hidden">
             {selected.length === 0 ? (
                <span className="font-normal text-muted-foreground">{placeholder}</span>
             ) : (
                <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary" className="bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100">
                        {selected.length} Selected
                    </Badge>
                    {selected.length <= 3 && selected.map(email => {
                        const user = options.find(o => o.email === email);
                        return (
                            <span key={email} className="text-xs truncate max-w-[150px] inline-block bg-muted px-2 py-0.5 rounded-md">
                                {user?.name || email}
                            </span>
                        )
                    })}
                     {selected.length > 3 && <span className="text-xs text-muted-foreground self-center">...</span>}
                </div>
             )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[350px] p-0" align="start">
        <div className="flex items-center border-b p-2">
          <Search className="mr-2 h-4 w-4 opacity-50" />
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border-none bg-transparent h-8 focus-visible:ring-0 px-0"
          />
        </div>
        <ScrollArea className="h-72 p-2">
            {filteredOptions.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                    No users found matching "{searchTerm}".
                </div>
            ) : (
                <div className="space-y-1">
                    {filteredOptions.map((user) => (
                        <div 
                         key={user._id}
                         className="flex items-start space-x-3 p-2 rounded-sm hover:bg-muted/50 cursor-pointer"
                         onClick={() => toggleOption(user.email)}
                        >
                           <Checkbox 
                                id={`user-${user._id}`}
                                checked={selected.includes(user.email)}
                                onCheckedChange={() => toggleOption(user.email)}
                                className="mt-1 border-muted-foreground/50 data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
                           />
                           <div className="flex flex-col gap-0.5 overflow-hidden">
                               <label 
                                    htmlFor={`user-${user._id}`} 
                                    className="text-sm font-medium leading-none cursor-pointer truncate"
                               >
                                    {user.name}
                               </label>
                               <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                           </div>
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
