"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { IconMapPin, IconHome, IconUser, IconFileText, IconPhone, IconMail } from "@tabler/icons-react"
import Image from "next/image"
import { ImageFallback } from "@/utils/imageFallback"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState } from "react"
import { Droplet, Edit, IdCardIcon } from "lucide-react"
import { Button } from "../ui/button"
import DonorForm from "@/components/doners/donor-form"

export function BloodHeader({ donor, buildMediaUrl }: any) {
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedDonor, setSelectedDonor] = useState<any | null>(null)

  const profileImage = donor?.profileImage?.[0]?.path_name
    ? buildMediaUrl(donor.profileImage[0].path_name)
    : null

  const handleEditDonor = (donor: any) => {
    setSelectedDonor(donor)
    setShowEditModal(true)
  }

  return (
    <>
      <Card className="border shadow-sm overflow-hidden ">
        <CardContent className="px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-0">
            {/* Image Section - Enhanced */}
            <div className="relative h-48 md:h-72 md:col-span-1 bg-muted overflow-hidden group rounded-lg">
              {profileImage ? (
                <ImageFallback
                  src={profileImage || "/placeholder.svg"}
                  alt="Property"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300 "
                  sizes="(max-width: 768px) 100vw, 25vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/10">
                  <Droplet className="h-12 w-12 text-muted-foreground/30" />
                </div>
              )}
            </div>

            {/* Content Section - Enhanced */}
            <div className="md:col-span-3 p-4 sm:p-6 flex flex-col justify-between">
              <div className="space-y-4">
                {/* Header with Badge */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                      {donor.fullName || "N/A"}
                    </h1>
                   
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditDonor(donor)}
                    className="text-green-600 hover:text-green-700"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>

                {/* Key Info Grid - Enhanced with Icons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <IdCardIcon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Donor ID</p>
                      <p className="text-sm font-semibold text-foreground truncate">
                        {donor.donorId || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <IconUser className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Mobile No.</p>
                      <p className="text-sm font-semibold text-foreground truncate">
                        {donor.mobileNumber || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <IconMapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</p>
                      <p className="text-sm font-semibold text-foreground">{donor.email || "N/A"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <Droplet className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Blood Group</p>
                      <p className="text-sm font-semibold text-foreground truncate">
                        {donor.bloodGroup || "N/A"}
                      </p>
                    </div>
                  </div>

                  {donor.emergencyContactNumber && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <IconPhone className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Emergency Contact</p>
                        <p className="text-sm font-semibold text-foreground">{donor.emergencyContactNumber}</p>
                      </div>
                    </div>
                  )}

                  {donor.email && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <IconMail className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Gender</p>
                        <p className="text-sm font-semibold text-foreground truncate">{donor.gender}</p>
                      </div>
                    </div>  
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Edit Donor Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="md:max-w-7xl max-h-[90vh] overflow-y-auto bg-secondary">
          <DialogHeader>
            <DialogTitle>Edit Donor</DialogTitle>
          </DialogHeader>

          {selectedDonor && (
            <DonorForm
              initialData={selectedDonor}
              pageTitle="Edit Donor Information"
              onSuccess={() => {
                setShowEditModal(false)
                donor()
              }}
            />
          )}
        </DialogContent>
      </Dialog>

    </>
  )
}