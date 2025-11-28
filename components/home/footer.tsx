"use client"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">❤️</span>
              </div>
              <div>
                <p className="font-bold">Blood Donation</p>
                <p className="text-xs text-red-400">Charity</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm">Saving lives through blood donation.</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-red-400 transition">
                  Home
                </a>
              </li>
              <li>
                <a href="#impact" className="hover:text-red-400 transition">
                  Impact
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-red-400 transition">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-400 transition">
                  About
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-red-400 transition">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-400 transition">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-400 transition">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-400 transition">
                  Terms
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4">Contact</h4>
            <p className="text-sm text-gray-400 mb-2">Email: info@blooddonation.org</p>
            <p className="text-sm text-gray-400 mb-4">Phone: +1 (555) 123-4567</p>
            <div className="flex gap-4">
              <a href="#" className="text-red-400 hover:text-red-300 transition">
                Facebook
              </a>
              <a href="#" className="text-red-400 hover:text-red-300 transition">
                Twitter
              </a>
              <a href="#" className="text-red-400 hover:text-red-300 transition">
                Instagram
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <p className="text-center text-gray-400 text-sm">© 2025 Blood Donation Charity. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
