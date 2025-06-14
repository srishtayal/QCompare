export default function SearchBar({ query, setQuery, onSearch }) {
  return (
    <div className="p-4">
      <input
        type="text"
        placeholder="Search for products like 'ice cream'"
        className="border rounded px-4 py-2 w-96"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSearch()}
      />
      <button
        className="ml-2 bg-green-600 text-white px-4 py-2 rounded"
        onClick={onSearch}
      >
        Compare
      </button>
    </div>
  );
}
