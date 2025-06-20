export default function LocationSelector({ setPincode }) {
  const handleChange = (e) =>{
    setPincode(e.target.value)
  } ;

  return (
    <div className="mr-0 md:ml-6">
      <input
        className="w-xs md:w-xs px-4 py-2  rounded-3xl border border-gray-600 bg-[#0f1117] text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 transition-all duration-200 "
        type="text"
        onChange={handleChange}
        placeholder="eg- Amar Colony, New Delhi"
      />
    </div>
  );
}
