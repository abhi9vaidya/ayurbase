"use client"
import React, { useEffect, useState } from 'react'
import apiClient from '@/lib/api-client'
import { toast } from 'react-toastify'

type DoctorProfile = {
  doctorId: number
  userId: number
  name: string
  email: string
  contactNo: string
  specialization: string
  experienceYrs: number
  qualification: string
}

export default function DoctorProfileForm() {
  const [profile, setProfile] = useState<DoctorProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let mounted = true
    apiClient
      .get('/doctor/me')
      .then((res) => {
        if (!mounted) return
        setProfile(res.data)
      })
      .catch((e) => {
        console.error(e)
        toast.error('Failed to load profile')
      })
      .finally(() => mounted && setLoading(false))

    return () => {
      mounted = false
    }
  }, [])

  async function save() {
    if (!profile) return
    setSaving(true)
    try {
      await apiClient.put('/doctor/me', {
        name: profile.name,
        contactNo: profile.contactNo,
        specialization: profile.specialization,
        experienceYrs: profile.experienceYrs,
        qualification: profile.qualification,
      })
      toast.success('Profile saved')
    } catch (err) {
      console.error(err)
      toast.error('Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-6">Loading...</div>
  if (!profile) return <div className="p-6">No profile found</div>

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Doctor Profile</h1>
      <div className="space-y-4">
        <div>
          <label className="block text-sm">Name</label>
          <input className="w-full border p-2 rounded" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm">Contact</label>
          <input className="w-full border p-2 rounded" value={profile.contactNo || ''} onChange={(e) => setProfile({ ...profile, contactNo: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm">Specialization</label>
          <input className="w-full border p-2 rounded" value={profile.specialization || ''} onChange={(e) => setProfile({ ...profile, specialization: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm">Experience (years)</label>
          <input type="number" className="w-full border p-2 rounded" value={profile.experienceYrs || 0} onChange={(e) => setProfile({ ...profile, experienceYrs: Number(e.target.value) })} />
        </div>
        <div>
          <label className="block text-sm">Qualification</label>
          <input className="w-full border p-2 rounded" value={profile.qualification || ''} onChange={(e) => setProfile({ ...profile, qualification: e.target.value })} />
        </div>
        <div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    </div>
  )
}
