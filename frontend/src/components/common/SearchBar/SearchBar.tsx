import React from 'react'

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({ value, onChange, onSubmit, placeholder, className }: SearchBarProps) {
  const isEmpty = value.trim() === '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEmpty) return;
    onSubmit();
  };

  // 한글 IME 조합 중 Enter는 무시 (조합 확정용 Enter가 폼 submit을 트리거하지 않도록)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.nativeEvent.isComposing) {
      e.preventDefault();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        maxLength={100}
        placeholder={placeholder}
        className={className}
      />
      <button
        type="submit"
        disabled={isEmpty}
        className="ml-2 px-3 py-2 my-5 bg-white text-sm rounded-sm border border-gray-400 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        검색
      </button>
      {/* 추후 확장: 여기에 자동완성 드롭다운 삽입 예정 */}
    </form>
  );
}
