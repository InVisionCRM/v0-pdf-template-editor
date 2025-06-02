"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DocumentForm from "./document-form"
import DocumentPreview from "./document-preview"
import type { FormField } from "@/types/form"

export default function DocumentEditor() {
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [formFields, setFormFields] = useState<FormField[]>([
    { id: "fullName", label: "Full Name", type: "text", placeholder: "Enter your full name" },
    { id: "email", label: "Email Address", type: "email", placeholder: "Enter your email" },
    { id: "phone", label: "Phone Number", type: "tel", placeholder: "Enter your phone number" },
    { id: "address", label: "Address", type: "text", placeholder: "Enter your address" },
    { id: "signature", label: "Signature", type: "signature", placeholder: "Sign here" },
    { id: "date", label: "Date", type: "date", placeholder: "Select date" },
  ])

  const handleFormChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <Tabs defaultValue="form" className="w-full">
        <div className="border-b px-6 py-3 bg-gray-50">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="form">Form</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="form" className="p-6">
          <DocumentForm fields={formFields} formData={formData} onChange={handleFormChange} />
        </TabsContent>

        <TabsContent value="preview" className="p-6">
          <DocumentPreview fields={formFields} formData={formData} onPrint={handlePrint} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
