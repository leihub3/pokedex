"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";

interface RecentOption {
  value: string;
  label: string;
  isRecent?: boolean;
}

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (value: string) => void;
  options: string[];
  placeholder?: string;
  className?: string;
  maxSuggestions?: number;
  disabled?: boolean;
  recentOptions?: string[]; // Show these first when input is empty or focused
}

export function AutocompleteInput({
  value,
  onChange,
  onSelect,
  options,
  placeholder = "Search...",
  className,
  maxSuggestions = 5,
  disabled = false,
  recentOptions = [],
}: AutocompleteInputProps) {
  const [filteredOptions, setFilteredOptions] = useState<RecentOption[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use a stable key for recentOptions so the effect doesn't re-run on every render
  // when recentOptions is using the default [] (new array each render)
  const recentOptionsKey = Array.isArray(recentOptions)
    ? recentOptions.join("|")
    : "";

  useEffect(() => {
    if (value.trim().length > 0) {
      const filtered = options
        .filter((option) =>
          option.toLowerCase().includes(value.toLowerCase())
        )
        .slice(0, maxSuggestions)
        .map((opt) => ({ value: opt, label: opt, isRecent: false }));
      setFilteredOptions(filtered);
      setIsOpen(filtered.length > 0);
    } else {
      // Show recent options when input is empty
      if (recentOptions.length > 0) {
        const recent = recentOptions
          .slice(0, maxSuggestions)
          .map((opt) => ({ value: opt, label: opt, isRecent: true }));
        setFilteredOptions(recent);
        setIsOpen(true);
      } else {
        setFilteredOptions([]);
        setIsOpen(false);
      }
    }
    setHighlightedIndex(-1);
  }, [value, options, maxSuggestions, recentOptionsKey]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
    // Use setTimeout to ensure the value is updated before calling onSelect
    setTimeout(() => {
      if (onSelect) {
        onSelect(option);
      }
    }, 0);
  };
  
  const handleOptionSelect = (option: RecentOption) => {
    handleSelect(option.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || filteredOptions.length === 0) {
      if (e.key === "Enter" && onSelect) {
        onSelect(value);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleSelect(filteredOptions[highlightedIndex].value);
        } else if (filteredOptions.length > 0) {
          handleSelect(filteredOptions[0].value);
        } else if (onSelect) {
          onSelect(value);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (filteredOptions.length > 0 || recentOptions.length > 0) {
            setIsOpen(true);
          }
        }}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
      />
      <AnimatePresence>
        {isOpen && filteredOptions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
          >
            <ul className="max-h-60 overflow-auto py-1">
              {filteredOptions.length > 0 && filteredOptions[0]?.isRecent && (
                <li className="px-4 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Recent Pokémon
                </li>
              )}
              {filteredOptions.map((option, index) => (
                <li
                  key={option.value}
                  onClick={() => handleOptionSelect(option)}
                  className={cn(
                    "cursor-pointer px-4 py-2 capitalize transition-colors",
                    index === highlightedIndex
                      ? "bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-100"
                      : "text-gray-900 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700",
                    option.isRecent && "flex items-center gap-2"
                  )}
                >
                  {option.isRecent && (
                    <span className="text-xs text-gray-400">🕒</span>
                  )}
                  {option.label.replace(/-/g, " ")}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

