"use client";

import Image from "next/image";
import { Card } from "@/components/ui/card";
// import { motion } from "framer-motion";

export default function HowItWorks() {
  const steps = [
    {
      id: 1,
      title: "Register as a Donor",
      description: "Fill in your details online in a quick and secure process.",
    },
    {
      id: 2,
      title: "Get a Blood Report",
      description: "Receive notification when your blood report is ready.",
    },
    {
      id: 3,
      title: "Donate Safely",
      description: "Donate blood under expert supervision with safety first.",
    },
    {
      id: 4,
      title: "Track Your Impact",
      description: "Monitor how your donation helps save lives in real-time.",
    },
  ];

  return (
    <section className="w-full py-12 px-4 sm:px-6 md:px-8 lg:px-16 bg-gray-50">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
        {/* Left Illustration */}
        <div className="flex-1 flex justify-center lg:justify-start">
          <Image
            src="/howit.png"
            alt="Blood donation illustration"
            width={400}
            height={400}
            className="object-contain w-full max-w-[300px] sm:max-w-[400px]"
            priority
          />
        </div>

        {/* Right Timeline */}
        <div className="flex-1">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-8 text-center lg:text-left text-black">
            How It <span className="text-red-600">Works</span>
          </h2>

          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-5 top-0 bottom-0 w-[2px] bg-red-200 hidden sm:block"></div>

            <div className="space-y-6">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className="relative pl-12 sm:pl-14"
                >
                  {/* Step Number */}
                  <div className="absolute left-0 top-0 w-10 h-10 flex items-center justify-center border-2 border-red-500 rounded-full bg-white font-semibold text-red-600 text-lg shadow-sm">
                    {step.id}
                  </div>

                  <Card className="p-5 sm:p-6 shadow-lg border-none bg-white rounded-lg transition-transform hover:scale-[1.02]">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                      {step.title.split(" ")[0]}{" "}
                      <span className="text-red-600">
                        {step.title.split(" ").slice(1).join(" ")}
                      </span>
                    </h3>
                    <p className="text-gray-600 text-sm sm:text-base mt-2">
                      {step.description}
                    </p>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
