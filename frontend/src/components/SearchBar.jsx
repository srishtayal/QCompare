export default function SearchBar({ query, setQuery, onSearch }) {
  return (
    <div className="flex items-center space-x-3">
      <input
        type="text"
        placeholder="Search for products like 'ice cream'"
        className="w-96 px-4 py-2 ml-8 mr-16 rounded-3xl border border-gray-600 bg-[#0f1117] text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 transition-all duration-200 "
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSearch()}
      />
      <button
        className="px-6 py-2 rounded-full border border-white/20 text-white font-semibold hover:bg-white/10 backdrop-blur-md transition-all duration-200 cursor-pointer"
        onClick={onSearch}
      >
        Compare
      </button>
    </div>
  );
}
