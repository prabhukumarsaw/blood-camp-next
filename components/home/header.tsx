"use client"

export default function Header() {
  return (
    <header className="fixed top-0 right-0 z-50 p-4 md:p-8">
      <button className="px-6 md:px-8 py-2 md:py-3 bg-white text-red-600 rounded-full font-semibold hover:bg-gray-50 transition text-sm md:text-base border-2 border-white shadow-lg">
        Login →
      </button>
    </header>
  )
}
