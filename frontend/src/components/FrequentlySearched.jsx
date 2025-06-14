const queries = ["Ice Cream", "Milk", "Maggi", "Cold Drink", "Chips"];

export default function FrequentlySearched({ onSelect }) {
  return (
    <div className="px-4 pb-4">
      <p className="mb-2 text-gray-700 font-medium">Frequently Searched:</p>
      <div className="flex flex-wrap gap-2">
        {queries.map((q, idx) => (
          <button
            key={idx}
            className="bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"
            onClick={() => onSelect(q)}
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
