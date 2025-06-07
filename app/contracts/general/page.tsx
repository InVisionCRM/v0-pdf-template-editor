"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useLeadData } from "@/hooks/useLeadData"
import { ContractForm } from "@/components/ContractForm"

export default function GeneralContractPage() {
  const router = useRouter()
  const leadData = useLeadData()

  useEffect(() => {
    // If no lead data is found, redirect back to the main page
    if (!leadData) {
      router.push("/")
    }
  }, [leadData, router])

  if (!leadData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">General Contract</h1>
      <ContractForm initialData={leadData} />
    </div>
  )
} 