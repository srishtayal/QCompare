import { useState } from "react";
import LocationSelector from "../components/LocationSelector";
import SearchBar from "../components/SearchBar";
import FrequentlySearched from "../components/FrequentlySearched";
import ProductCard from "../components/ProductCard";
import { fetchComparison } from "../api";
import { ShootingStars } from "../components/ui/shooting-stars";
import { ContainerImageFlip } from "../components/ui/container-text-flip";
import LoadingScreen from "../components/ui/loadingScreen";

export default function Home() {
  const [pincode, setPincode] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [compare,setCompare]=useState(false)

  const storeLogos = [
    {
      src: "../icons/instamart.png",
      alt: "Instamart"
    },
    {
      src: "../icons/zepto.png",
      alt: "Zepto"
    },
    {
      src: "../icons/blinkit.png",
      alt: "Blinkit"
    }
  ];

  const onSearch = async () => {
    if (!pincode || !query) return alert("Enter both query and pincode");
    setCompare(true);

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
    <div className="relative w-full min-h-screen overflow-hidden bg-[#0f1117]">
      <ShootingStars className="absolute inset-0 z-0" />
      <div className="flex flex-col min-h-screen mt-8">
      <div className="w-full p-4 z-20 relative flex flex-col sm:flex-row justify-center items-center sm:items-end sm:space-x-6 space-y-3 sm:space-y-0">
        <LocationSelector setPincode={setPincode} />
        <SearchBar query={query} setQuery={setQuery} onSearch={onSearch} />
      </div>
      {!compare?<div className="relative z-10 max-w-4xl mx-auto py-6 flex-1 flex justify-center items-center min-w-full  ">
        <div className="mt-[-100px] md:mt-[-100px]">
          <h1 className="text-6xl md:text-8xl font-extrabold  text-[#ffdd00] text-center ">QCompare</h1>
          <div className=" md:flex md:justify-between mt-4  ">
            <h4 className="text-2xl font-bold text-white mt-3 ml-2 mb-6 text-center">We find you the best prices across</h4>
            <ContainerImageFlip
              images={[
                "/logos/instamart.png",
                "/logos/zepto.jpeg",
                "/logos/Blinkit.svg"
              ]}
              interval={2500}
              imgClassName="h-20 w-20 md:h-16 md:w-16 object-contain rounded-xl"
            />
          </div>
          
        </div>
      
      
      </div> : loading ?
        <LoadingScreen/>
      
        :
        <div className="w-full flex justify-center p-4 mt-10">
        <div className="grid gap-y-10 gap-x-14 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {results.map((item, i) => (
            <ProductCard key={i} {...item} />
          ))}
        </div>
        </div>
      }
      
      </div>
    </div>
  );
}


