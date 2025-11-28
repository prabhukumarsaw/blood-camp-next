import { Card, CardContent } from "@/components/ui/card";
import { Users, HeartPulse, Droplet } from "lucide-react";
const DonarImpact = () => {
  const design = (
    <>
      <section className="bg-gray-100 py-10 px-4 ">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-8 text-black">Donor Impact</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {/* Registered Donors */}
            <Card className="border-none shadow-none  bg-transparent">
              <CardContent className="flex  items-center justify-center p-6 gap-4">
                <img
                  src="/donar1.png"
                  alt="Donors"
                  className="w-[80px] h-[80px]"
                />
                <div>
                  <p className="text-3xl font-bold text-red-600">12,450 +</p>
                  <p className="text-sm font-medium text-gray-800">
                    Registered Donors
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Lives Saved */}
            <Card className="border-none shadow-none  bg-transparent">
              <CardContent className="flex  items-center justify-center p-6 gap-4">
                <img
                  src="/donar2.png"
                  alt="Lives Saved"
                  className="w-[80px] h-[80px]"
                />
                <div>
                  <p className="text-3xl font-bold text-red-600">38,700 +</p>
                  <p className="text-sm font-medium text-gray-800">
                    Lives Saved
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Units of Blood Donated */}
            <Card className="border-none shadow-none  bg-transparent">
              <CardContent className="flex items-center justify-center p-6 gap-4">
                <img
                  src="/donar3.png"
                  alt="Blood Units"
                  className="w-[80px] h-[80px]"
                />
                <div>
                  <p className="text-3xl font-bold text-red-600">15,200 +</p>
                  <p className="text-sm font-medium text-gray-800">
                    Units of Blood Donated
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
  return design;
};

export default DonarImpact;
