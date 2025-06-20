export default function ProductCard({ name, quantity, blinkit, zepto,swiggy }) {
  const platformLogo = (src, url) => (
    <a href={url} target="_blank" rel="noopener noreferrer">
      <img src={src} alt="platform" className="h-6 w-auto hover:opacity-80" />
    </a>
  );

  return (
    <div className="rounded-xl border border-white/10 bg-[#16181d] p-4 shadow-md hover:shadow-lg transition-shadow duration-300 w-full max-w-sm">
  <div className="flex justify-center">
  <div className="h-40 w-46 mb-4 rounded-lg overflow-hidden bg-white">
  <img
    src="/logos/butterscotch.webp"
    alt="Product Name"
    className="h-full w-full object-contain"
  />
</div>
</div>
  <h3 className="text-white font-semibold text-lg leading-tight min-h-[3.5rem]">
    {name}
  </h3>
  <p className="text-gray-400 text-sm mb-2">{quantity}</p>
  <div className="flex items-center justify-between mt-3">
    <div className="flex items-baseline space-x-1">
      <span className="text-white font-bold text-xl">₹149</span>
      <span className="text-gray-500 text-xs">11 mins</span>
    </div>
    <button className="bg-gradient-to-r from-[#b9025ebc] to-[#5a12a1] px-3 py-1 rounded-md text-sm w-20 text-center text-white shadow-md hover:scale-105 transition-transform">
      Zepto
    </button>
 </div>
 <div className="flex items-center justify-between mt-3">
    <div className="flex items-baseline space-x-1">
      <span className="text-white font-bold text-xl">₹149</span>
      <span className="text-gray-500 text-xs">11 mins</span>
    </div>
    <button className="bg-gradient-to-r from-[#ff5c21] to-[#c94612] px-3 py-1 rounded-md text-sm w-20 text-center text-white shadow-md hover:scale-105 transition-transform">
      Instamart
    </button>
 </div>
 <div className="flex items-center justify-between mt-3">
    <div className="flex items-baseline space-x-1">
      <span className="text-white font-bold text-xl">₹149</span>
      <span className="text-gray-500 text-xs">11 mins</span>
    </div>
    
      <button className="bg-gradient-to-r cursor-pointer from-[#f7e02f] to-[#b28a069b] px-3 py-1 rounded-md text-sm w-20 text-center text-white shadow-md hover:brightness-110 transition-all">
      Blinkit
    </button>
   
    
    
 </div>
</div>
  );
}
