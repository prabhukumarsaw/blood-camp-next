"use client"

import { useEffect, useState } from "react"
import { getDonorApi, Donor } from "@/apicalls/blood"
import { authStorage } from "@/lib/auth"

export default function DonorDetails({ id }: { id: string }) {
  const [donor, setDonor] = useState<Donor | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const user = authStorage.getUser()

  useEffect(() => {
    const user = authStorage.getUser()

    if (!user) {
      setError("User not found")
      return
    }

    // Collect all ULB IDs the user has access to
    const ulbList = user?.ulb || []
    if (ulbList.length === 0) {
      setError("No ULBs assigned to this user")
      return
    }

    // Function to try fetching donor details from all allowed ULBs
    const fetchDonor = async () => {
      setLoading(true)
      setError(null)

      for (const ulb of ulbList) {
        try {
          const donorData = await getDonorApi(ulb.id, id)
          if (donorData) {
            setDonor(donorData)
            setLoading(false)
            return
          }
        } catch (err: any) {
          console.warn(`Failed for ULB ${ulb.name}:`, err.message)
          // Continue trying next ULB
        }
      }

      setLoading(false)
      setError("Donor not found in any accessible ULBs")
    }

    fetchDonor()
  }, [id])

  console.log("Donor details:", donor)
  console.log("Donor ID param:", id)
  console.log("User data:", user)

  if (error)
    return <div className="text-sm text-red-600">{error}</div>

  if (loading || !donor)
    return <div className="text-sm text-muted-foreground">Loading donor details...</div>

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">{donor.fullName}</h2>
        <p className="text-sm text-muted-foreground">Donor ID: {donor.donorId}</p>
        <p className="text-sm">Blood Group: {donor.bloodGroup}</p>
        <p className="text-sm">Gender: {donor.gender}</p>
        <p className="text-sm">
          DOB: {new Date(donor.dateOfBirth).toLocaleDateString()}
        </p>
      </div>
      <div className="space-y-2">
        <p className="text-sm">Mobile: {donor.mobileNumber}</p>
        {donor.email && <p className="text-sm">Email: {donor.email}</p>}
        {donor.permanentAddress && (
          <p className="text-sm">Address: {donor.permanentAddress}</p>
        )}
        {donor.cityStatePin && (
          <p className="text-sm">PIN: {donor.cityStatePin}</p>
        )}
        <p className="text-sm">Status: {donor.status}</p>
      </div>
    </div>
  )
}
