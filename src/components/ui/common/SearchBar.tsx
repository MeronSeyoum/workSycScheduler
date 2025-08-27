'use client';

import { useState } from 'react';
import { FaSearch } from 'react-icons/fa';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
}

export function SearchBar({ placeholder = 'Search...', onSearch }: SearchBarProps) {
  const [search, setSearch] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(search);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="text"
        placeholder={placeholder}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring"
      />
      <button
        type="submit"
        className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        <FaSearch className="h-4 w-4" />
      </button>
    </form>
  );
}
