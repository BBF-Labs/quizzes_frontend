import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}: PaginationProps) => {
  return (
    <div
      className={`mt-8 flex justify-center items-center space-x-2 ${className}`}
    >
      <Button
        variant="outline"
        className="bg-zinc-800/50 border-zinc-700/50 text-white flex items-center"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        aria-label="Previous Page"
      >
        <ChevronLeft className="h-4 w-4" /> {/* Left arrow icon */}
      </Button>

      <span className="text-white">
        Page {currentPage} of {totalPages}
      </span>

      <Button
        variant="outline"
        className="bg-zinc-800/50 border-zinc-700/50 text-white flex items-center"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        aria-label="Next Page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default Pagination;
