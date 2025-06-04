"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { FormField } from "@/types/form"
import SignatureCanvas from "./signature-canvas"

interface DocumentFormProps {
  fields: FormField[]
  formData: Record<string, string>
  onChange: (id: string, value: string) => void
}

export default function DocumentForm({ fields, formData, onChange }: DocumentFormProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>{field.label}</Label>
            {field.type === "signature" ? (
              <SignatureCanvas 
                value={formData[field.id] || ""} 
                onChange={(value) => onChange(field.id, value)} 
                allowTypedSignature={true}
              />
            ) : (
              <Input
                id={field.id}
                type={field.type}
                placeholder={field.placeholder}
                value={formData[field.id] || ""}
                onChange={(e) => onChange(field.id, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button type="button" onClick={() => window.print()}>
          Print Document
        </Button>
      </div>
    </div>
  )
}
