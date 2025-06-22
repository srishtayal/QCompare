export default function ProductCard({ name, quantity,photo,zeptoQuantity,swiggyQuantity,blinkitQuantity, blinkit, zepto,swiggy }) {
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
    src = {photo}
    alt={name}
    className="h-full w-full object-contain"
  />
</div>
</div>
  <h3 className="text-white font-semibold text-lg leading-tight min-h-[3.5rem]">
    {name}
  </h3>
  <p className="text-gray-400 text-sm mb-2">{quantity}</p>
{zepto && (
  <div className="flex items-center justify-between mt-3">
    <div className="flex items-baseline space-x-1">
      <span className="text-white font-bold text-xl">{zepto.price}</span>
      <span className="text-gray-500 text-xs">{zeptoQuantity} |</span>
      <span className="text-gray-500 text-xs">{zepto.deliveryTime} MINS</span>
      
    </div>
    {zepto.outOfStock ? (
      <div className="bg-[#5a12a1] px-3 py-1 rounded-md text-sm w-xxxs text-center text-white opacity-50 cursor-not-allowed">
        Out of Stock
      </div>
    ) : (
      <a
        href={zepto.link}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-gradient-to-r from-[#b9025ebc] to-[#5a12a1] px-3 py-1 rounded-md text-sm w-20 text-center text-white shadow-md hover:scale-110 transition-transform cursor-pointer z-50 relative"
      >
        Zepto
      </a>
    )}
  </div>
)}

{swiggy && (
  <div className="flex items-center justify-between mt-3">
    <div className="flex items-baseline space-x-1">
      <span className="text-white font-bold text-xl">₹{swiggy.price}</span>
      <span className="text-gray-500 text-xs">{swiggyQuantity} |</span>
      <span className="text-gray-500 relative z-60 text-xs">{swiggy.deliveryTime} MINS</span>
    </div>
    {swiggy.outOfStock ? (
      <div className="bg-[#c94612] px-3 py-1 rounded-md text-sm w-xxxs text-center text-white opacity-50 cursor-not-allowed">
        Out of Stock
      </div>
    ) : (
      <a
        href={swiggy.link}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-gradient-to-r from-[#ff5c21] to-[#c94612] px-2 py-1 rounded-md text-sm w-20 text-center text-white shadow-md hover:scale-110 transition-transform cursor-pointer z-50 relative"
      >
        Instamart
      </a>
    )}
  </div>
)}

{blinkit && (
  <div className="flex items-center justify-between mt-3">
    <div className="flex items-baseline space-x-1">
      <span className="text-white font-bold text-xl">{blinkit.price}</span>
      <span className="text-gray-500 text-xs">{blinkitQuantity} |</span>
      <span className="text-gray-500 text-xs">{blinkit.deliveryTime}</span>
    </div>
    {blinkit.outOfStock ? (
      <div className="bg-[#e3bf4a9b] px-3 py-1 rounded-md text-sm w-xxxs text-center text-white opacity-50 cursor-not-allowed">
        Out of Stock
      </div>
    ) : (
      <a
        href={blinkit.link}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-gradient-to-r from-[#f7e02f] to-[#b28a069b] px-3 py-1 rounded-md text-sm w-20 text-center text-white shadow-md hover:scale-110 hover:brightness-110 transition-all cursor-pointer z-50 relative"
      >
        Blinkit
      </a>
    )}
  </div>
)}
 
</div>
  );
}
