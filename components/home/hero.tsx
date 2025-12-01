"use client";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";

const HeroSection = () => {
  const router = useRouter();
  return (
    // Full-height hero so no black strip shows below on large screens
    <section className="relative bg-white min-h-screen flex items-center overflow-hidden">
      {/* Background Shape */}
      <img
        src="/top-bg.png"
        alt="Background shape"
        className="absolute top-0 right-0 z-0 max-w-none w-[140%] md:w-auto"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-10 md:py-12 lg:py-16 w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-10 md:mb-20">
          <img src="/logo.png" alt="Logo" className="w-[169px]" />
          <Button
          onClick={() => {
            router.push("/auth/sign-in");
          }}
          className="bg-white rounded-full hover:bg-red-200 cursor-pointer text-[#E72C3B]">
            Login <LogIn />
          </Button>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* Text Content */}
          <div>
            <h1 className="text-4xl md:text-5xl font-semibold leading-tight mb-6 text-black ">
              Give the Gift of Life <br />
              <span className="font-bold">DONATE</span>
              <span className="text-red-600 font-bold ml-2">BLOOD</span>
            </h1>
            <p className="text-gray-700 mb-6">
              Every drop of blood has the power to give someone a second chance
              at life. By donating blood, no matter who you are, there's hope
              for those in need. Blood donation is safe, simple, and
              life-changing - for both the donor and the recipient. Join us in
              creating a community of hope and compassion. Together, we can
              ensure that no life is lost due to lack of blood.
            </p>
            <p className="text-gray-700 font-medium mb-6">
              Be the reason someone smiles today — donate blood and share life.
            </p>
            <Button
            onClick={() => {
              router.push("/auth/sign-in");
            }}
              className="text-white rounded-full cursor-pointer"
              style={{
                background: "linear-gradient(90deg, #E94031 0%, #F07E33 100%)",
              }}
            >
              DONATE BLOOD{" "}
              <svg
                stroke="currentColor"
                fill="none"
                strokeWidth="2"
                viewBox="0 0 24 24"
                strokeLinecap="round"
                strokeLinejoin="round"
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M18.602 12.004a6.66 6.66 0 0 0 -.538 -1.127l-4.89 -7.26c-.42 -.625 -1.287 -.803 -1.936 -.397a1.376 1.376 0 0 0 -.41 .397l-4.893 7.26c-1.695 2.838 -1.035 6.441 1.567 8.546a7.16 7.16 0 0 0 5.033 1.56"></path>
                <path d="M16 19h6"></path>
                <path d="M19 16v6"></path>
              </svg>
            </Button>
          </div>

          {/* Image Content */}
          <div className="flex justify-center mt-8 md:-mt-20 lg:-mt-32">
            <img
              src="/bloodbank.png"
              alt="Donate blood illustration"
              className="w-full max-w-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
