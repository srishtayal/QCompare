export default function LocationSelector({ setPincode }) {
  const handleChange = (e) => setPincode(e.target.value);

  return (
    <div className="p-4 bg-gray-100">
      <label className="block text-lg font-semibold mb-1">Enter your Pincode</label>
      <input
        className="border rounded px-3 py-2 w-60"
        type="text"
        onChange={handleChange}
        placeholder="e.g., 110078"
        maxLength={6}
      />
    </div>
  );
}
