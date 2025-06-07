"use client"

import { useSession } from "next-auth/react"
import { useState } from "react"
import { LeadSearch } from "./LeadSearch"
import type { Lead } from "@/types/lead"

interface ContractFormProps {
  initialData: Lead
}

export function ContractForm({ initialData }: ContractFormProps) {
  const { data: session } = useSession()
  const [formData, setFormData] = useState({
    firstName: initialData.firstName || "",
    lastName: initialData.lastName || "",
    email: initialData.email || "",
    phone: initialData.phone || "",
    address: initialData.address || "",
    insuranceCompany: initialData.insuranceCompany || "",
    insurancePolicyNumber: initialData.insurancePolicyNumber || "",
    insuranceAdjusterName: initialData.insuranceAdjusterName || "",
    insuranceAdjusterPhone: initialData.insuranceAdjusterPhone || "",
    insuranceAdjusterEmail: initialData.insuranceAdjusterEmail || "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLeadSelect = (lead: Lead) => {
    setFormData({
      firstName: lead.firstName || "",
      lastName: lead.lastName || "",
      email: lead.email || "",
      phone: lead.phone || "",
      address: lead.address || "",
      insuranceCompany: lead.insuranceCompany || "",
      insurancePolicyNumber: lead.insurancePolicyNumber || "",
      insuranceAdjusterName: lead.insuranceAdjusterName || "",
      insuranceAdjusterPhone: lead.insuranceAdjusterPhone || "",
      insuranceAdjusterEmail: lead.insuranceAdjusterEmail || "",
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/contracts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to create contract')
      }

      // Reset form after successful submission
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        insuranceCompany: "",
        insurancePolicyNumber: "",
        insuranceAdjusterName: "",
        insuranceAdjusterPhone: "",
        insuranceAdjusterEmail: "",
      })
      // You might want to show a success message or redirect
    } catch (error) {
      console.error('Contract creation error:', error)
      setError('Failed to create contract. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!session) {
    return (
      <div className="p-4 text-center text-gray-600 bg-gray-50 rounded-lg">
        Please sign in to create contracts
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Lead Search Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-medium mb-4">Search Lead</h2>
        <LeadSearch onLeadSelect={handleLeadSelect} />
      </div>

      {/* Contract Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="Enter first name"
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Enter last name"
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter email address"
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              id="phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter phone number"
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <input
              id="address"
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Enter full address"
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="insuranceCompany" className="block text-sm font-medium text-gray-700">
              Insurance Company
            </label>
            <input
              id="insuranceCompany"
              type="text"
              name="insuranceCompany"
              value={formData.insuranceCompany}
              onChange={handleInputChange}
              placeholder="Enter insurance company name"
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="insurancePolicyNumber" className="block text-sm font-medium text-gray-700">
              Policy Number
            </label>
            <input
              id="insurancePolicyNumber"
              type="text"
              name="insurancePolicyNumber"
              value={formData.insurancePolicyNumber}
              onChange={handleInputChange}
              placeholder="Enter policy number"
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="insuranceAdjusterName" className="block text-sm font-medium text-gray-700">
              Adjuster Name
            </label>
            <input
              id="insuranceAdjusterName"
              type="text"
              name="insuranceAdjusterName"
              value={formData.insuranceAdjusterName}
              onChange={handleInputChange}
              placeholder="Enter adjuster name"
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="insuranceAdjusterPhone" className="block text-sm font-medium text-gray-700">
              Adjuster Phone
            </label>
            <input
              id="insuranceAdjusterPhone"
              type="tel"
              name="insuranceAdjusterPhone"
              value={formData.insuranceAdjusterPhone}
              onChange={handleInputChange}
              placeholder="Enter adjuster phone number"
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label htmlFor="insuranceAdjusterEmail" className="block text-sm font-medium text-gray-700">
              Adjuster Email
            </label>
            <input
              id="insuranceAdjusterEmail"
              type="email"
              name="insuranceAdjusterEmail"
              value={formData.insuranceAdjusterEmail}
              onChange={handleInputChange}
              placeholder="Enter adjuster email address"
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 p-2 text-sm text-red-600 bg-red-50 rounded" role="alert">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`mt-6 px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isSubmitting ? 'Creating Contract...' : 'Create Contract'}
        </button>
      </form>
    </div>
  )
} 