
import HeroSection from "@/components/home/hero";
import DonarImpact from "@/components/home/DonarImpact"
import HowItWorks from "@/components/home/HowItWorks"
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Next.js Template for Startup and SaaS",
  description: "This is Home for Startup Nextjs Template",
  // other metadata
};

export default function HomePage() {
  return (
    <>
     <HeroSection />
      <DonarImpact />
      <HowItWorks />
    </>
  );
}
