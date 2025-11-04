import type React from "react"
import type { Metadata } from "next"
import { ToastContainer } from "react-toastify"

import "./globals.css"
import AuthPatientGuard from "@/components/AuthPatientGuard"

import { DM_Sans, Space_Mono, DM_Sans as V0_Font_DM_Sans, Space_Mono as V0_Font_Space_Mono, Source_Serif_4 as V0_Font_Source_Serif_4 } from 'next/font/google'

// Initialize fonts
const _dmSans = V0_Font_DM_Sans({ subsets: ['latin'], weight: ["100","200","300","400","500","600","700","800","900","1000"] })
const _spaceMono = V0_Font_Space_Mono({ subsets: ['latin'], weight: ["400","700"] })
const _sourceSerif_4 = V0_Font_Source_Serif_4({ subsets: ['latin'], weight: ["200","300","400","500","600","700","800","900"] })

const dmSans = DM_Sans({ subsets: ["latin"] })
const spaceMono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"] })

export const metadata: Metadata = {
  title: "Hospital Appointment System",
  description: "Modern healthcare appointment management platform",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${dmSans.className} bg-background text-foreground`}>
        {/* client-side guard: redirect patients without patientId to /register/patient */}
        {/* <AuthPatientGuard /> */}
        {children}
        <ToastContainer />
      </body>
    </html>
  )
}
