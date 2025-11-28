"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IconUser, IconPhone, IconFileText, IconHome, IconExternalLink } from "@tabler/icons-react"
import Image from "next/image"
import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { ImageFallback } from "@/utils/imageFallback"

export function LogsTab({ donor, buildMediaUrl }: any) {
  const handleViewImage = (owner: any) => {
    const fullPath = buildMediaUrl(owner.owner_image)
    if (fullPath) window.open(fullPath, "_blank")
  }

  return (
    <div className="space-y-4">


      {/* Owners List */}
      <div className="border border-border rounded-lg overflow-hidden">
        {/* Desktop header */}
        <div className="hidden md:grid grid-cols-[80px_1.2fr_1fr_1fr_1fr] items-center bg-muted/70 px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
          <span>Photo</span>
          <span>Owner Name</span>
          <span>Contact</span>
          <span>PAN No</span>
          <span>Guardian</span>
        </div>

          <div
            className="border-t border-border md:border-none hover:bg-muted/40 transition-colors duration-150"
          >
            {/* Desktop Row */}
            <div className="hidden md:grid md:grid-cols-[80px_1.2fr_1fr_1fr_1fr] items-center px-4 py-3">
              {/* Avatar */}
              <div className="flex justify-center md:justify-start">
                <div className="relative w-12 h-12 rounded-md overflow-hidden bg-muted border border-border">
                  {buildMediaUrl(donor.profileImage) ? (
                    <ImageFallback
                      src={buildMediaUrl(donor.profileImage) || "/placeholder.svg"}
                      alt={donor.fullName || "Owner"}
                      fill
                      onClick={() => handleViewImage(donor)}
                      className="object-cover cursor-pointer"
                      sizes="48px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10">
                      <IconUser className="h-6 w-6 text-primary/60" />
                    </div>
                  )}
                </div>
              </div>

              {/* Owner */}
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm truncate">
                    {donor.fullName || "N/A"}
                  </span>
                  {/* {idx === 0 && (
                    <Badge className="text-[10px] py-0.5 px-1.5">Primary</Badge>
                  )} */}
                </div>
                <span className="text-xs text-muted-foreground">
                  {donor.gender || "Not Specified"}
                </span>
              </div>

              {/* Contact */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <IconPhone className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="truncate">{donor.mobileNumber || "N/A"}</span>
              </div>

              {/* PAN */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
                <IconFileText className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="truncate">{donor.email || "N/A"}</span>
              </div>

              {/* Guardian */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <IconUser className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="truncate">{donor.guardian_name || "N/A"}</span>
              </div>


            </div>

            {/* Mobile Card */}
            <div className="block md:hidden p-4">
              <Card className="border shadow-sm rounded-xl overflow-hidden">
                <CardContent className="p-4 space-y-3">
                  {/* Top Section */}
                  <div className="flex items-center gap-3">
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-muted border border-border">
                      {buildMediaUrl(donor.profileImage) ? (
                        <ImageFallback
                          src={buildMediaUrl(donor.profileImage) || "/placeholder.svg"}
                          alt={donor.fullName || "Owner"}
                          fill
                          onClick={() => handleViewImage(donor)}
                          className="object-cover cursor-pointer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10">
                          <IconUser className="h-6 w-6 text-primary/60" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-foreground truncate">
                        {donor.fullName || "N/A"}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {donor.gender || "Not Specified"}
                      </p>
                    </div>
                  </div>

                  {/* Info List */}
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {donor.mobileNumber && (
                      <div className="flex items-center gap-2">
                        <IconPhone className="h-4 w-4 text-primary" />
                        <span>{donor.mobileNumber}</span>
                      </div>
                    )}
                    {donor.email && (
                      <div className="flex items-center gap-2">
                        <IconFileText className="h-4 w-4 text-primary" />
                        <span className="font-mono">{donor.email}</span>
                      </div>
                    )}
                    {donor.guardian_name && (
                      <div className="flex items-center gap-2">
                        <IconUser className="h-4 w-4 text-primary" />
                        <span>{donor.guardian_name}</span>
                      </div>
                    )}
                    {donor.permanentAddress && (
                      <div className="flex items-start gap-2">
                        <IconHome className="h-4 w-4 text-primary mt-0.5" />
                        <span className="line-clamp-2">{donor.permanentAddress}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
   
      </div>
    </div>
  )
}