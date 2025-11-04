import React from 'react'
import dynamic from 'next/dynamic'

const DoctorProfileForm = dynamic(() => import('@/components/DoctorProfileForm'), { ssr: false })

export default function ProfilePage() {
  return (
    <div>
      <DoctorProfileForm />
    </div>
  )
}
