"use client"
import React, { useEffect, useState } from 'react'
import apiClient from '@/lib/api-client'
import { toast } from 'react-toastify'

type Medicine = {
  medicineId: number
  name: string
  form: string
  details?: string
}

export default function AdminMedicines() {
  const [items, setItems] = useState<Medicine[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState({ name: '', form: '', details: '' })

  useEffect(() => {
    fetchList()
  }, [])

  async function fetchList() {
    setLoading(true)
    try {
      const res = await apiClient.get('/medicine')
      setItems(res.data.medicines || [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to load medicines')
    } finally {
      setLoading(false)
    }
  }

  function startCreate() {
    setEditingId(null)
    setForm({ name: '', form: '', details: '' })
    setCreating(true)
  }

  function startEdit(m: Medicine) {
    setEditingId(m.medicineId)
    setForm({ name: m.name, form: m.form, details: m.details || '' })
    setCreating(true)
  }

  async function save() {
    if (!form.name || !form.form) {
      toast.error('Name and form are required')
      return
    }
    try {
      if (editingId) {
        await apiClient.put(`/medicine/${editingId}`, form)
        toast.success('Medicine updated')
      } else {
        await apiClient.post('/medicine', form)
        toast.success('Medicine created')
      }
      setCreating(false)
      await fetchList()
    } catch (err: any) {
      console.error(err)
      const msg = err.response?.data?.error || 'Save failed'
      toast.error(msg)
    }
  }

  async function remove(id: number) {
    if (!confirm('Delete this medicine?')) return
    try {
      await apiClient.delete(`/medicine/${id}`)
      toast.success('Medicine deleted')
      await fetchList()
    } catch (err: any) {
      console.error(err)
      const msg = err.response?.data?.error || 'Delete failed'
      toast.error(msg)
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Medicines</h2>
        <div>
          <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={startCreate}>Create</button>
          <button className="ml-2 px-3 py-1 border rounded" onClick={fetchList}>Refresh</button>
        </div>
      </div>

      {creating && (
        <div className="mb-4 border p-4 rounded">
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border p-2 rounded" />
            <input placeholder="Form (e.g., tablet)" value={form.form} onChange={(e) => setForm({ ...form, form: e.target.value })} className="border p-2 rounded" />
          </div>
          <div className="mt-2">
            <textarea placeholder="Details" value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} className="w-full border p-2 rounded" />
          </div>
          <div className="mt-2">
            <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={save}>Save</button>
            <button className="ml-2 px-3 py-1 border rounded" onClick={() => setCreating(false)}>Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-2">
          {items.map((m) => (
            <div key={m.medicineId} className="border p-3 rounded flex justify-between items-center">
              <div>
                <div className="font-medium">{m.name} <span className="text-sm text-gray-600">({m.form})</span></div>
                <div className="text-sm text-gray-700">{m.details}</div>
              </div>
              <div>
                <button className="px-2 py-1 border rounded" onClick={() => startEdit(m)}>Edit</button>
                <button className="ml-2 px-2 py-1 border rounded text-red-600" onClick={() => remove(m.medicineId)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
