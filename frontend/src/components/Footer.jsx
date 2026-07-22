import React from "react"

function Footer() {
  return (
    <footer className="bg-gray-950 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top section */}
        <div className="py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img
                src="https://png.pngtree.com/png-clipart/20230508/original/pngtree-perfume-logo-in-elegant-golden-look-png-image_9147437.png"
                alt="Perfo Elite"
                className="w-8 h-8"
              />
              <h3 className="text-lg font-bold text-yellow-400 tracking-wider">Perfo Elite</h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Your destination for premium fragrances. Discover luxury scents crafted for every personality.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {["Home", "Products", "Cart", "Wishlist"].map(link => (
                <li key={link}>
                  <span className="text-sm text-gray-400 hover:text-yellow-400 transition-colors cursor-pointer">{link}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Support</h4>
            <ul className="space-y-2.5">
              {["FAQ", "Shipping", "Returns", "Contact Us"].map(link => (
                <li key={link}>
                  <span className="text-sm text-gray-400 hover:text-yellow-400 transition-colors cursor-pointer">{link}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Stay Updated</h4>
            <p className="text-sm text-gray-400 mb-3">Get notified about new arrivals.</p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-3 py-2.5 bg-gray-900 border border-gray-800 rounded-l-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400/50 transition-colors"
                readOnly
              />
              <button className="px-4 py-2.5 bg-yellow-400 text-gray-900 font-bold text-sm rounded-r-xl hover:bg-yellow-300 transition-colors">
                →
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-800"></div>

        {/* Bottom */}
        <div className="py-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-gray-500 tracking-wide">
            © 2026 <span className="font-semibold text-gray-400">Perfo Elite</span>. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {["Privacy", "Terms", "Cookies"].map(item => (
              <span key={item} className="text-xs text-gray-500 hover:text-gray-300 transition-colors cursor-pointer">{item}</span>
            ))}
          </div>
        </div>

      </div>
    </footer>
  )
}

export default Footer