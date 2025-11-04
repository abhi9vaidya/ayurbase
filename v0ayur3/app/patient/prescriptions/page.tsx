"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import NavBar from "@/app/components/nav-bar"
import Sidebar from "@/app/components/sidebar"
import { Button } from "@/components/ui/button"
import apiClient from "@/lib/api-client"
import { toast } from "react-toastify"
import { formatDateTime } from "@/lib/utils"

const SIDEBAR_LINKS = [
  { label: "Dashboard", href: "/patient/dashboard", icon: "🏠" },
  { label: "Book Appointment", href: "/patient/book-appointment", icon: "📅" },
  { label: "My Appointments", href: "/patient/appointments", icon: "📋" },
  { label: "My Prescriptions", href: "/patient/prescriptions", icon: "💊" },
  { label: "Profile", href: "/patient/profile", icon: "👤" },
]

interface Medicine {
  medicineId: number
  name: string
  dose: string
  duration: string
  instructions: string
}

interface Prescription {
  prescriptionId: number
  appointmentId: number
  doctorName: string
  notes: string
  notesParsed?: any
  createdOn: string
  medicines: Medicine[]
}

export default function PatientPrescriptionsPage() {
  const router = useRouter()
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }
    fetchPrescriptions()
  }, [router])

  const fetchPrescriptions = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get("/prescription")
      setPrescriptions(response.data.prescriptions || [])

      // Fetch detailed information for each prescription
      const detailed = await Promise.all(
        (response.data.prescriptions || []).map((presc: any) =>
          apiClient.get(`/prescription/${presc.prescriptionId}`).then((res) => res.data),
        ),
      )
      setPrescriptions(detailed)
    } catch (error: any) {
      toast.error("Failed to load prescriptions")
      console.error("[v0] Fetch prescriptions error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = (prescription: Prescription) => {
    const printWindow = window.open("", "", "height=600,width=800")
    if (!printWindow) return

    const medicinesHtml = prescription.medicines
      .map(
        (med) => `
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">${med.name}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${med.dose}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${med.duration}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${med.instructions || "-"}</td>
      </tr>
    `,
      )
      .join("")

  const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Prescription #${prescription.prescriptionId}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #007bff; color: white; padding: 10px; text-align: left; }
          tr:nth-child(even) { background-color: #f2f2f2; }
          .section { margin-top: 20px; }
          .notes { background-color: #f0f0f0; padding: 10px; border-left: 4px solid #007bff; margin-top: 20px; }
        </style>
      </head>
      <body>
        <h1>Prescription Details</h1>
        <div class="section">
          <p><strong>Prescription ID:</strong> ${prescription.prescriptionId}</p>
          <p><strong>Doctor:</strong> ${prescription.doctorName}</p>
          <p><strong>Date:</strong> ${formatDateTime(prescription.createdOn)}</p>
        </div>
        <h2>Medicines</h2>
        <table>
          <tr>
            <th>Medicine Name</th>
            <th>Dose</th>
            <th>Duration</th>
            <th>Instructions</th>
          </tr>
          ${medicinesHtml}
        </table>
  ${(() => {
        const notesStr = prescription.notesParsed ? JSON.stringify(prescription.notesParsed, null, 2) : (prescription.notes || "")
        return notesStr ? `<div class="notes"><strong>Notes:</strong> ${notesStr}</div>` : ""
      })()}
        <div style="margin-top: 40px; text-align: center;">
          <p style="color: #666; font-size: 12px;">This is a digital prescription. Please consult your doctor if you have any queries.</p>
        </div>
      </body>
      </html>
    `

    printWindow.document.write(content)
    printWindow.document.close()
    printWindow.print()
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />

      <div className="flex">
        <Sidebar links={SIDEBAR_LINKS} />

        <main className="flex-1 p-8 animate-fade-in">
          <div className="max-w-6xl mx-auto">
            {selectedPrescription ? (
              <>
                <button
                  onClick={() => setSelectedPrescription(null)}
                  className="text-blue-600 hover:text-blue-700 font-medium mb-4 flex items-center gap-2"
                >
                  ← Back to Prescriptions
                </button>
                <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h1 className="text-3xl font-bold text-slate-900">
                        Prescription #{selectedPrescription.prescriptionId}
                      </h1>
                      <p className="text-slate-600 mt-2">Doctor: {selectedPrescription.doctorName}</p>
                      <p className="text-slate-600">Date: {formatDateTime(selectedPrescription.createdOn)}</p>
                    </div>
                    <Button
                      onClick={() => handlePrint(selectedPrescription)}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                    >
                      Print Prescription
                    </Button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900 mb-4">Prescribed Medicines</h2>
                      {selectedPrescription.medicines.length === 0 ? (
                        <p className="text-slate-500">No medicines added to this prescription yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {selectedPrescription.medicines.map((med, idx) => (
                            <div
                              key={`${med.medicineId}-${idx}`}
                              className="bg-slate-50 p-4 rounded-lg border border-slate-200"
                            >
                              <p className="font-semibold text-slate-900">{med.name}</p>
                              <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                                <div>
                                  <span className="text-slate-600">Dose:</span>
                                  <p className="font-medium text-slate-900">{med.dose}</p>
                                </div>
                                <div>
                                  <span className="text-slate-600">Duration:</span>
                                  <p className="font-medium text-slate-900">{med.duration}</p>
                                </div>
                                <div>
                                  <span className="text-slate-600">Instructions:</span>
                                  <p className="font-medium text-slate-900">{med.instructions || "-"}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {(selectedPrescription.notesParsed || selectedPrescription.notes) && (
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h3 className="font-semibold text-slate-900 mb-2">Doctor's Notes</h3>
                        <pre className="text-slate-700 whitespace-pre-wrap">{selectedPrescription.notesParsed ? JSON.stringify(selectedPrescription.notesParsed, null, 2) : selectedPrescription.notes}</pre>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="mb-8">
                  <h1 className="text-4xl font-bold text-slate-900">My Prescriptions</h1>
                  <p className="text-slate-600 mt-2">View prescriptions from your completed appointments</p>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <p className="text-slate-500">Loading prescriptions...</p>
                  </div>
                ) : prescriptions.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                    <p className="text-slate-500 mb-4">No prescriptions found</p>
                    <Button
                      onClick={() => router.push("/patient/appointments")}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                    >
                      View Appointments
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {prescriptions.map((presc) => (
                      <div
                        key={presc.prescriptionId}
                        className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                        onClick={() => setSelectedPrescription(presc)}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900">
                              Prescription #{presc.prescriptionId}
                            </h3>
                            <p className="text-slate-600 text-sm mt-1">{presc.doctorName}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-slate-500">{formatDateTime(presc.createdOn)}</p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="text-sm text-slate-700 font-medium mb-2">
                            Medicines ({presc.medicines.length}):
                          </p>
                          <ul className="space-y-1">
                            {presc.medicines.slice(0, 3).map((med, idx) => (
                              <li key={`${med.medicineId}-${idx}`} className="text-sm text-slate-600">
                                • {med.name} ({med.dose})
                              </li>
                            ))}
                            {presc.medicines.length > 3 && (
                              <li className="text-sm text-slate-600">• +{presc.medicines.length - 3} more</li>
                            )}
                          </ul>
                        </div>

                        <div className="flex gap-2 pt-4 border-t border-slate-200">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedPrescription(presc)
                            }}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                          >
                            View Details
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              handlePrint(presc)
                            }}
                            variant="outline"
                            className="flex-1 border-slate-300 rounded-lg text-sm"
                          >
                            Print
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
