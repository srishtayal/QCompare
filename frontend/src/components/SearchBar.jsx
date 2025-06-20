export default function SearchBar({ query, setQuery, onSearch }) {
  return (
    <div className="flex flex-col sm:flex-row items-center sm:space-x-4 space-y-3 sm:space-y-0 w-full justify-evenly">
      <input
        type="text"
        placeholder="Search for products like 'ice cream'"
        className="w-xs md:w-full sm:max-w-lg px-4 py-2 rounded-3xl border border-gray-600 bg-[#0f1117] text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 transition-all duration-200"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSearch()}
      />
      <button
        className="w-auto lg:w-auto md:w-auto sm:w-auto px-6 py-2 rounded-full border border-white/20 text-white font-semibold hover:bg-white/10 backdrop-blur-md transition-all duration-200 cursor-pointer"
        onClick={onSearch}
      >
        Compare
      </button>
    </div>
  );
}