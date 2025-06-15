import { useState } from "react";
import LocationSelector from "../components/LocationSelector";
import SearchBar from "../components/SearchBar";
import FrequentlySearched from "../components/FrequentlySearched";
import ProductCard from "../components/ProductCard";
import { fetchComparison } from "../api";

export default function Home() {
  const [pincode, setPincode] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const onSearch = async () => {
    if (!pincode || !query) return alert("Enter both query and pincode");

    setLoading(true);
    try {
        const data = await fetchComparison(query, pincode);

        if (!Array.isArray(data)) throw new Error("Invalid response format");

        setResults(data);
    } catch (err) {
        alert("Error fetching data");
        console.error(err);
        setResults([]); // avoid .map crash
    }
    setLoading(false);
    };

  return (
    <div className="max-w-4xl mx-auto py-6">
      <h1 className="text-3xl font-bold mb-4 text-center">QCompare 🍕</h1>
      <LocationSelector setPincode={setPincode} />
      <SearchBar query={query} setQuery={setQuery} onSearch={onSearch} />
      <FrequentlySearched onSelect={(q) => { setQuery(q); onSearch(); }} />
      {loading ? (
        <p className="text-center mt-10">Loading...</p>
      ) : (
        results.map((item, i) => <ProductCard key={i} {...item} />)
      )}
    </div>
  );
}
