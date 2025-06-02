"use client"

import { Button } from "@/components/ui/button"
import type { FormField } from "@/types/form"
import { PrinterIcon } from "lucide-react"

interface DocumentPreviewProps {
  fields: FormField[]
  formData: Record<string, string>
  onPrint: () => void
}

export default function DocumentPreview({ fields, formData, onPrint }: DocumentPreviewProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        <Button onClick={onPrint} className="print:hidden">
          <PrinterIcon className="mr-2 h-4 w-4" />
          Print Document
        </Button>
      </div>

      <div className="border rounded-lg p-8 bg-white min-h-[842px] shadow-sm">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold">Document Title</h2>
          <p className="text-gray-500">Please review the information below before printing</p>
        </div>

        <div className="space-y-6">
          {fields.map((field) => (
            <div key={field.id} className="space-y-1">
              <p className="text-sm font-medium text-gray-500">{field.label}</p>
              {field.type === "signature" ? (
                formData[field.id] ? (
                  <div className="border-b border-gray-300 py-1">
                    <img src={formData[field.id] || "/placeholder.svg"} alt="Signature" className="max-h-16" />
                  </div>
                ) : (
                  <div className="border-b border-gray-300 py-3">
                    <span className="text-gray-400 italic">No signature provided</span>
                  </div>
                )
              ) : (
                <div className="border-b border-gray-300 py-1">
                  <p className="font-medium">
                    {formData[field.id] || <span className="text-gray-400 italic">Not provided</span>}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
