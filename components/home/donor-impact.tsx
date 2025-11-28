"use client"

import Image from "next/image"

const stats = [
  {
    number: "12,450+",
    label: "Registered Donors",
    icon: "/assets/donors-icon.jpg",
  },
  {
    number: "38,700+",
    label: "Lives Saved",
    icon: "/assets/lives-icon.jpg",
  },
  {
    number: "15,200+",
    label: "Units of Blood Donated",
    icon: "/images/blood-icon.jpg",
  },
]

export default function DonorImpact() {
  return (
    <section id="impact" className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-16">Donor Impact</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center text-center gap-4">
              {/* Icon */}
              <div className="w-24 h-24 relative">
                <Image src={stat.icon || "/placeholder.svg"} alt={stat.label} fill className="object-contain" />
              </div>

              {/* Number */}
              <h3 className="text-4xl md:text-5xl font-bold text-red-600">{stat.number}</h3>

              {/* Label */}
              <p className="text-lg md:text-xl font-semibold text-gray-900">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Decorative Elements */}
        <div className="mt-16 flex justify-center gap-8 text-4xl opacity-20">
          <span>❤️</span>
          <span>+</span>
          <span>❤️</span>
          <span>+</span>
          <span>❤️</span>
        </div>
      </div>
    </section>
  )
}
