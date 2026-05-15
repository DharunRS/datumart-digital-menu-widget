"use client";
import { useState, useEffect, useRef } from "react";

interface MenuSearchProps {
  onSearch: (query: string) => void;
  isSearching: boolean;
}

export default function MenuSearch({ onSearch, isSearching }: MenuSearchProps) {
  const [value, setValue] = useState("");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { onSearch(value); }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [value]);

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search menu..."
        // CHANGED: Increased pr-8 to pr-12 to make room for two icons
        className="w-64 pl-4 pr-12 py-2 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm bg-white text-gray-700 placeholder-gray-400 shadow-sm"
        aria-label="Search menu"
      />
      
      {/* Search/Loading Icon - Keep this on the far right */}
      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
        {isSearching ? (
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        )}
      </span>

      {/* Clear Button (X) */}
      {value && (
        <button
          onClick={() => { setValue(""); onSearch(""); }}
          // CHANGED: right-2 to right-8 to move it left of the search icon
          className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          ✕
        </button>
      )}
    </div>
  );
}