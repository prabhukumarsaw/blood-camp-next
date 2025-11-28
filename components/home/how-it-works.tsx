"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"

const steps = [
  {
    number: 1,
    title: "Register as a Donor",
    description: "Fill in your details online.",
  },
  {
    number: 2,
    title: "Get a Blood report",
    description: "We'll notify you when your blood report is ready.",
  },
  {
    number: 3,
    title: "Donate Safely",
    description: "Donate blood safely under expert supervision",
  },
  {
    number: 4,
    title: "Track Your Impact",
    description: "See how your donation helps save lives.",
  },
]

export default function HowItWorks() {
  const [currentStep, setCurrentStep] = useState(0)

  const nextStep = () => {
    setCurrentStep((prev) => (prev + 1) % steps.length)
  }

  const prevStep = () => {
    setCurrentStep((prev) => (prev - 1 + steps.length) % steps.length)
  }

  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
          How It <span className="text-red-600">Works</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Illustration */}
          <div className="relative h-96 md:h-full min-h-96 order-2 md:order-1">
            <Image
              src="/assets/process-illustration.jpg"
              alt="Blood donation process"
              fill
              className="object-contain"
            />
          </div>

          {/* Right Steps */}
          <div className="order-1 md:order-2 flex flex-col gap-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex gap-4 transition-all duration-300 ${
                  index === currentStep ? "opacity-100" : "opacity-50"
                }`}
              >
                {/* Step Number */}
                <div className="flex-shrink-0">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                      index === currentStep ? "bg-red-600 text-white" : "border-2 border-red-600 text-red-600"
                    }`}
                  >
                    {step.number}
                  </div>
                </div>

                {/* Step Content */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={prevStep}
                className="w-12 h-12 rounded-full bg-gray-800 text-white flex items-center justify-center hover:bg-gray-900 transition"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={nextStep}
                className="w-12 h-12 rounded-full bg-gray-800 text-white flex items-center justify-center hover:bg-gray-900 transition"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="mt-16 flex justify-center gap-12 text-3xl opacity-20">
          <span>❤️</span>
          <span>+</span>
          <span>💧</span>
          <span>+</span>
          <span>❤️</span>
        </div>
      </div>
    </section>
  )
}
