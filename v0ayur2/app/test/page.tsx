'use client'

import { toast, ToastContainer } from "react-toastify"

export default function TestPage() {
  const mew = () => {
    console.log('Mew!')
    toast.info('Mew!')
  }
  return <div>Test Page
    <button onClick={mew} className="button ">Duck me</button>
  </div>
}