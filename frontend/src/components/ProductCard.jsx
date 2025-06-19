export default function ProductCard({ name, quantity, blinkit, zepto }) {
  const platformLogo = (src, url) => (
    <a href={url} target="_blank" rel="noopener noreferrer">
      <img src={src} alt="platform" className="h-6 w-auto hover:opacity-80" />
    </a>
  );

  return (
    <div className="relative z-10 border rounded p-4 mb-4 flex flex-col md:flex-row justify-between gap-4 bg-white shadow">
      <div>
        <p className="font-semibold text-lg">{name}</p>
        <p className="text-sm text-gray-600">{quantity}</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">

        {blinkit && (
          <div className="flex items-center gap-2">
            {platformLogo('/blinkit.png', blinkit.link)}

            {blinkit.outOfStock ? (
              <span className="text-xs font-semibold text-red-500">
                Out&nbsp;of&nbsp;Stock
              </span>
            ) : (
              <>
                <p className="text-sm">₹{blinkit.price}</p>
                <span className="text-xs text-gray-500">
                  {blinkit.deliveryTime}
                </span>
              </>
            )}
          </div>
        )}

        {zepto && (
          <div className="flex items-center gap-2">
            {platformLogo('/zepto.png', zepto.link)}
            {zepto.outOfStock ? (
              <span className="text-xs font-semibold text-red-500">
                Out&nbsp;of&nbsp;Stock
              </span>
            ) : (
              <>
                <p className="text-sm">₹{zepto.price}</p>
                <span className="text-xs text-gray-500">
                  {zepto.deliveryTime}
                </span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
