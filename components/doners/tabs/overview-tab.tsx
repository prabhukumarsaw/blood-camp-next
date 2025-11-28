import { IconHome, IconPhone, IconMail, IconFileText, IconMap, IconUser, IconBuilding, IconHistory, IconMapPin, IconChevronRight } from "@tabler/icons-react"


// {
//     "message": "OK",
//     "data": {
//         "id": "521a6dab-1e28-4ae4-9351-860a8086e45a",
//         "donorId": "BD2025808073",
//         "ulbId": 2,
//         "firstName": "alpha",
//         "lastName": "yes",
//         "fullName": "alpha yes",
//         "dateOfBirth": "2000-12-31T18:30:00.000Z",
//         "gender": "male",
//         "bloodGroup": "O_NEG",
//         "weight": 55,
//         "height": 165,
//         "mobileNumber": "9786545650",
//         "email": "admin@newscms.com",
//         "permanentAddress": "ddd gf hg  fhgfgh",
//         "cityStatePin": "122334",
//         "emergencyContactName": "fdd",
//         "emergencyContactNumber": "9786756543",
//         "takingMedication": false,
//         "chronicIllness": false,
//         "donatedBefore": false,
//         "lastDonationDate": null,
//         "surgeryInLast6Months": false,  
//         "smokeOrAlcohol": false,
//         "eligibleForDonation": false,
//         "willingToBeRegularDonor": false,
//         "notificationPreference": [],
//         "consentToUseData": true,
//         "confirmInformationAccurate": true,
//         "status": "active",
//         "registeredByUserId": 53,
//         "createdAt": "2025-11-07T16:49:44.865Z",
//         "updatedAt": "2025-11-07T16:49:44.865Z"
//     }
// }

export function OverviewTab({ donor }: any) {
 
  const sections = [
    {
      icon: IconFileText,
      title: "donor Information",
      items: [
        { label: "Donor ID", value: donor.donorId },
        { label: "Donor Name", value: donor.fullName },
        { label: "Blood Group", value: donor.bloodGroup },
        { label: "Gender", value: donor.gender },
        { label: "Mobile", value: donor.mobileNumber },
        { label: "Email", value: donor.email },
        { label: "Status", value: donor.status },
      ]
    },
    {
      icon: IconBuilding,
      title: "Construction Details",
      items: [
        { label: "Plot Area", value: donor.plot_area ? `${donor.plot_area} sq ft` : null },
        { label: "Built-up Area", value: donor.builtup_ground_floor ? `${donor.builtup_ground_floor} sq ft` : null },
        { label: "Construction Date", value: donor.construction_date ? new Date(donor.construction_date).toLocaleDateString() : null },
        { label: "Water Connection", value: donor.water_conn_type },
        { label: "Total Floors", value: donor.total_floors },
        { label: "Construction Type", value: donor.construction_type },
        { label: "Occupancy Type", value: donor.occupancy_type },
      ]
    },
    {
      icon: IconUser,
      title: "Owner Information",
      items: [
        { label: "weight", value: donor.weight },
        { label: "height", value: donor.height },
        { label: "Date of Birth", value: donor.dateOfBirth ? new Date(donor.dateOfBirth).toLocaleDateString() : null },
        { label: "Phone No", value: donor.phone_no },
        { label: "Email ID", value: donor.email_id },
        { label: "Occupation", value: donor.occupation },
      ]
    },
    {
      icon: IconMapPin,
      title: "Donor Information",
      items: [
        { label: "Medication", value: donor.takingMedication },
        { label: "Chronic Illness", value: donor.chronicIllness },
        { label: "Donated Before", value: donor.donatedBefore },
        { label: "Last Donation Date", value: donor.lastDonationDate ? new Date(donor.lastDonationDate).toLocaleDateString() : null },
        { label: "Surgery In Last 6 Months", value: donor.surgeryInLast6Months },
        { label: "Smoke Or Alcohol", value: donor.smokeOrAlcohol },
      ]
    },
    {
      icon: IconHome,
      title: "Address Details",
      items: [
        { label: "permanentAddress", value: donor.permanentAddress },
        { label: "cityStatePin", value: donor.cityStatePin },
        { label: "emergencyContactName", value: donor.emergencyContactName },
        { label: "emergencyContactNumber", value: donor.emergencyContactNumber },
       
      ]
    },
    {
      icon: IconHistory,
      title: "Historical Records",
      items: [
        { label: "Old Ward No", value: donor.old_ward_no },
        { label: "Old Holding No", value: donor.old_holding_no },
        { label: "Mutation No", value: donor.mutation_no },
        { label: "Mutation Date", value: donor.mutation_date ? new Date(donor.mutation_date).toLocaleDateString() : null },
        { label: "Registration No", value: donor.registration_no },
        { label: "Registration Date", value: donor.registration_date ? new Date(donor.registration_date).toLocaleDateString() : null },
      ]
    }
  ]



  return (
    <div className="space-y-2">
     
      <div className="rounded border  overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 divide-x divide-y ">
          {sections.flatMap(section => 
            section.items.filter(item => item.value).map((item, index) => (
              <div key={`${section.title}-${index}`} className="p-3 transition-colors">
                <p className="text-xs font-medium  uppercase tracking-wide mb-1">{item.label}</p>
                <p className="text-sm font-semibold  truncate" title={item.value || ""}>
                  {item.value}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {sections.every(section => !section.items.some(item => item.value)) && (
        <div className="rounded border py-12 text-center">
          <p className=" text-sm">No donor data available</p>
        </div>
      )}
    </div>
  )
}
