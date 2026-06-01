import { HiOutlineSearch, HiOutlineX } from 'react-icons/hi';

export default function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="relative">
      <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-surface-200 bg-white
                   text-sm text-surface-800 placeholder-surface-400
                   focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
                   transition-all duration-200"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-md hover:bg-surface-100 transition-colors"
        >
          <HiOutlineX className="w-4 h-4 text-surface-400" />
        </button>
      )}
    </div>
  );
}
