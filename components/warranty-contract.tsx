"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileIcon, CheckCircle, Edit3Icon } from "lucide-react"
import Link from "next/link"
import { Label } from "@/components/ui/label"
import LoadingAnimation from "./loading-animation"
import Image from "next/image"
import AdoptSignatureDialog from "./adopt-signature-dialog"
import { useLeadData } from "@/hooks/useLeadData"

export default function WarrantyContract() {
  const lead = useLeadData()
  
  // Format current date as MM/DD/YYYY
  const formatDate = () => {
    const now = new Date()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const day = String(now.getDate()).padStart(2, "0")
    const year = now.getFullYear()
    return `${month}/${day}/${year}`
  }

  const [formData, setFormData] = useState(() => ({
    date: formatDate(),
    agreesDate: formatDate(),
    projectAddress: lead?.address || "",
    dateOfCompletion: "",
    authorizedRepresentativeSignatureDate: formatDate(),
  }))

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const contractRef = useRef<HTMLDivElement>(null)
  const [masterSignature, setMasterSignature] = useState<string>("")
  const [hasSetupSignature, setHasSetupSignature] = useState(false)

  // State to control the AdoptSignatureDialog visibility
  const [isAdoptSignatureDialogOpen, setIsAdoptSignatureDialogOpen] = useState(false)

  // Effect to update form data when lead data is available
  useEffect(() => {
    if (lead) {
      setFormData(prev => ({
        ...prev,
        projectAddress: lead.address || "",
      }))
    }
  }, [lead])

  useEffect(() => {
    const currentDate = formatDate()
    setFormData((prev) => ({
      ...prev,
      date: currentDate,
      agreesDate: currentDate,
      authorizedRepresentativeSignatureDate: currentDate,
    }))
  }, [])

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Effect to update hasSetupSignature based on masterSignature
  useEffect(() => {
    if (masterSignature && masterSignature !== "data:,") {
      setHasSetupSignature(true)
    } else {
      setHasSetupSignature(false)
    }
  }, [masterSignature])

  const handleAdoptSignature = (signature: string) => {
    setMasterSignature(signature)
    // hasSetupSignature will be updated by the useEffect above
    setIsAdoptSignatureDialogOpen(false) // Close the dialog
  }

  const applySignature = (field: string) => {
    if (masterSignature) {
      handleInputChange(field, masterSignature)
    }
  }

  const handleGeneratePdf = async () => {
    if (!contractRef.current) {
      alert("Contract content not found")
      return
    }

    try {
      setIsGeneratingPdf(true)

      // Wait for UI updates
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Dynamic imports
      const [html2canvasModule, jsPDFModule] = await Promise.all([
        import("html2canvas").catch(() => null),
        import("jspdf").catch(() => null),
      ])

      if (!html2canvasModule || !jsPDFModule) {
        throw new Error("Failed to load PDF libraries")
      }

      const html2canvas = html2canvasModule.default
      const { jsPDF } = jsPDFModule

      // Create a fixed-width container for consistent PDF generation
      const fixedContainer = document.createElement("div")
      fixedContainer.style.position = "absolute"
      fixedContainer.style.left = "-9999px"
      fixedContainer.style.top = "0"
      fixedContainer.style.width = "794px" // Fixed width equivalent to A4 at 96 DPI
      fixedContainer.style.padding = "40px"
      fixedContainer.style.backgroundColor = "#ffffff"
      fixedContainer.style.fontFamily = "Arial, sans-serif"
      fixedContainer.style.fontSize = "14px"
      fixedContainer.style.lineHeight = "1.4"
      fixedContainer.style.color = "#000000"
      document.body.appendChild(fixedContainer)

      // Create the PDF content with fixed styling
      fixedContainer.innerHTML = `
        <div style="display: flex; margin-bottom: 30px;">
          <div style="width: 300px;">
            <img src="/in-vision-logo.png" style="width: 300px; height: auto;" />
          </div>
          <div style="flex-grow: 1; text-align: center; padding-top: 20px;">
            <h2 style="font-size: 18px; font-weight: bold; margin: 0;">ROOF REPLACEMENT WARRANTY CERTIFICATE</h2>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
          <div>
            <strong>Project Address:</strong><br>
            <span style="border-bottom: 1px solid #000; display: inline-block; min-width: 300px; padding-bottom: 2px;">
              ${formData.projectAddress || ""}
            </span>
          </div>
          <div>
            <strong>Date of Completion:</strong><br>
            <span style="border-bottom: 1px solid #000; display: inline-block; min-width: 200px; padding-bottom: 2px;">
              ${formData.dateOfCompletion || ""}
            </span>
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 16px; font-weight: bold; margin: 0 0 10px 0;">1. WARRANTY COVERAGE</h3>
          <p style="margin: 0 0 15px 0;">
            In-Vision Construction warrants that the roof replacement performed at the above project address will be
            free from defects in workmanship and materials for a period of two (2) years from the date of project
            completion, subject to the terms and conditions outlined below.
          </p>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 16px; font-weight: bold; margin: 0 0 10px 0;">2. WHAT IS COVERED</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li style="margin-bottom: 5px;">Repair or replacement of defective roofing materials.</li>
            <li style="margin-bottom: 5px;">Repair of workmanship issues that cause leaks or structural problems.</li>
          </ul>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 16px; font-weight: bold; margin: 0 0 10px 0;">3. EXCLUSIONS AND LIMITATIONS</h3>
          <p style="margin: 0 0 10px 0;">This warranty does NOT cover:</p>
          <ul style="margin: 0; padding-left: 20px;">
            <li style="margin-bottom: 5px;">Damage caused by natural disasters, severe weather, or acts of God.</li>
            <li style="margin-bottom: 5px;">Damage due to improper maintenance, neglect, or misuse.</li>
            <li style="margin-bottom: 5px;">Damage resulting from unrelated structural issues.</li>
            <li style="margin-bottom: 5px;">Normal wear and tear.</li>
            <li style="margin-bottom: 5px;">Issues caused by building structure or external factors.</li>
          </ul>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 16px; font-weight: bold; margin: 0 0 10px 0;">4. CUSTOMER RESPONSIBILITIES</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li style="margin-bottom: 5px;">Regular maintenance and inspections.</li>
            <li style="margin-bottom: 5px;">Immediate reporting of issues or suspected defects.</li>
            <li style="margin-bottom: 5px;">Providing access for inspections and repairs.</li>
          </ul>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 16px; font-weight: bold; margin: 0 0 10px 0;">5. CLAIM PROCESS</h3>
          <p style="margin: 0 0 10px 0;">To make a claim under this warranty, the customer must:</p>
          <ul style="margin: 0; padding-left: 20px;">
            <li style="margin-bottom: 5px;">Notify In-Vision Construction in writing within 30 days of discovering a defect.</li>
            <li style="margin-bottom: 5px;">Allow access for inspection and repairs.</li>
            <li style="margin-bottom: 5px;">Provide proof of the original work and warranty if requested.</li>
          </ul>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 16px; font-weight: bold; margin: 0 0 10px 0;">6. LIMITATIONS OF LIABILITY</h3>
          <p style="margin: 0 0 15px 0;">
            This warranty is limited to the repair or replacement of defective work or materials. In-Vision
            Construction is not liable for consequential or incidental damages.
          </p>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 16px; font-weight: bold; margin: 0 0 10px 0;">7. TRANSFERABILITY</h3>
          <p style="margin: 0 0 15px 0;">This warranty is non-transferable and applies only to the original property owner.</p>
        </div>

        <p style="margin: 30px 0; font-weight: bold;">
          This warranty is provided in good faith and is subject to the terms and conditions outlined above.
        </p>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 50px; border-top: 1px solid #ccc; padding-top: 30px;">
          <div>
            <strong>Authorized Representative:</strong><br>
            <div style="border: 1px solid #000; height: 80px; width: 100%; margin-top: 10px; display: flex; align-items: center; justify-content: center; background: #fff;">
              ${
                formData.authorizedRepresentativeSignature
                  ? `<img src="${formData.authorizedRepresentativeSignature}" style="max-height: 70px; max-width: 100%; object-fit: contain;" />`
                  : '<span style="color: #999;">Signature Required</span>'
              }
            </div>
          </div>
          <div>
            <strong>Date:</strong><br>
            <span style="border-bottom: 1px solid #000; display: inline-block; min-width: 150px; padding-bottom: 2px; margin-top: 10px;">
              ${formData.authorizedRepresentativeSignatureDate || ""}
            </span>
          </div>
        </div>
      `

      // Generate canvas with fixed settings
      const canvas = await html2canvas(fixedContainer, {
        scale: 0.75,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        width: 794,
        height: fixedContainer.scrollHeight,
      })

      // Clean up the temporary container
      document.body.removeChild(fixedContainer)

      // Create PDF with exact A4 dimensions
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      // A4 dimensions in mm
      const pdfWidth = 210
      const pdfHeight = 297
      const margin = 15

      // Calculate image dimensions to fit A4 with margins
      const maxWidth = pdfWidth - margin * 2
      const maxHeight = pdfHeight - margin * 2

      // Convert canvas dimensions to mm (assuming 96 DPI)
      const canvasWidthMm = (canvas.width / 2) * 0.264583
      const canvasHeightMm = (canvas.height / 2) * 0.264583

      // Scale to fit within margins
      const scale = Math.min(maxWidth / canvasWidthMm, maxHeight / canvasHeightMm)
      const finalWidth = canvasWidthMm * scale
      const finalHeight = canvasHeightMm * scale

      // Center the content
      const x = (pdfWidth - finalWidth) / 2
      const y = margin

      // Add image to PDF
      const imgData = canvas.toDataURL("image/png", 1.0)
      pdf.addImage(imgData, "PNG", x, y, finalWidth, finalHeight)

      // Save the PDF
      pdf.save("Warranty-Contract.pdf")
    } catch (error) {
      console.error("PDF generation error:", error)
      alert("Failed to generate PDF. Please try again or contact support.")
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 shadow-lg">
      {isGeneratingPdf && <LoadingAnimation message="Generating warranty PDF..." />}

      <div className="mb-6 flex justify-between items-center pdf-exclude">
        <Link href="/">
          <Button variant="outline">Back to Home</Button>
        </Link>
        <Button onClick={handleGeneratePdf} disabled={isGeneratingPdf} className="flex items-center gap-2">
          <FileIcon className="h-4 w-4" />
          {isGeneratingPdf ? "Generating PDF..." : "Generate PDF"}
        </Button>
      </div>

      {/* Button to open the AdoptSignatureDialog */}
      <div className="mb-8 p-6 border border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-center">
        {!hasSetupSignature ? (
          <React.Fragment>
            <Edit3Icon className="h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-700 mb-1">Setup Your Signature</h3>
            <p className="text-sm text-gray-500 mb-4">
              Click the button below to draw or type your signature.
            </p>
            <Button onClick={() => setIsAdoptSignatureDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
              Setup Signature
            </Button>
          </React.Fragment>
        ) : (
          <div className="flex flex-col items-center text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mb-3" />
            <h3 className="text-lg font-medium text-gray-700 mb-1">Signature Setup Complete!</h3>
            <p className="text-sm text-gray-500 mb-4">
              Your signature is ready. You can click on any signature field in the contract to apply it, or update it if needed.
            </p>
            <Button onClick={() => setIsAdoptSignatureDialogOpen(true)} variant="outline">
              Update Signature
            </Button>
          </div>
        )}
      </div>

      <AdoptSignatureDialog
        open={isAdoptSignatureDialogOpen}
        onOpenChange={setIsAdoptSignatureDialogOpen}
        onAdopt={handleAdoptSignature} // onAdopt expects (signature: string, initials?: string)
        initialSignature={masterSignature}
        // initialInitials is not needed here
        title="Adopt Your Signature"
        needsInitials={false} // Explicitly set to false
      />

      <div ref={contractRef} className="space-y-6 text-sm">
        <div className="flex mb-6">
          <div className="w-[300px]">
            <Image
              src="/in-vision-logo.png"
              alt="In-Vision Construction Logo"
              width={300}
              height={150}
              className="w-full h-auto"
            />
          </div>
          <div className="flex-grow text-center pt-5">
            <h2 className="text-xl font-semibold">ROOF REPLACEMENT WARRANTY CERTIFICATE</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <Label htmlFor="projectAddress" className="font-semibold">
              Project Address:
            </Label>
            <Input
              id="projectAddress"
              type="text"
              value={formData.projectAddress || ""}
              onChange={(e) => handleInputChange("projectAddress", e.target.value)}
              className="mt-1 border-0 border-b-2 border-gray-400 rounded-none focus:border-blue-500 focus:ring-0"
              placeholder="Enter project address"
            />
          </div>
          <div>
            <Label htmlFor="dateOfCompletion" className="font-semibold">
              Date of Completion:
            </Label>
            <Input
              id="dateOfCompletion"
              type="text"
              value={formData.dateOfCompletion || ""}
              onChange={(e) => handleInputChange("dateOfCompletion", e.target.value)}
              className="mt-1 border-0 border-b-2 border-gray-400 rounded-none focus:border-blue-500 focus:ring-0"
              placeholder="MM/DD/YYYY"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-lg">1. WARRANTY COVERAGE</h3>
            <p className="mt-2">
              In-Vision Construction warrants that the roof replacement performed at the above project address will be
              free from defects in workmanship and materials for a period of two (2) years from the date of project
              completion, subject to the terms and conditions outlined below.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-lg">2. WHAT IS COVERED</h3>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Repair or replacement of defective roofing materials.</li>
              <li>Repair of workmanship issues that cause leaks or structural problems.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg">3. EXCLUSIONS AND LIMITATIONS</h3>
            <p className="mt-2">This warranty does NOT cover:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Damage caused by natural disasters, severe weather, or acts of God.</li>
              <li>Damage due to improper maintenance, neglect, or misuse.</li>
              <li>Damage resulting from unrelated structural issues.</li>
              <li>Normal wear and tear.</li>
              <li>Issues caused by building structure or external factors.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg">4. CUSTOMER RESPONSIBILITIES</h3>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Regular maintenance and inspections.</li>
              <li>Immediate reporting of issues or suspected defects.</li>
              <li>Providing access for inspections and repairs.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg">5. CLAIM PROCESS</h3>
            <p className="mt-2">To make a claim under this warranty, the customer must:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Notify In-Vision Construction in writing within 30 days of discovering a defect.</li>
              <li>Allow access for inspection and repairs.</li>
              <li>Provide proof of the original work and warranty if requested.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg">6. LIMITATIONS OF LIABILITY</h3>
            <p className="mt-2">
              This warranty is limited to the repair or replacement of defective work or materials. In-Vision
              Construction is not liable for consequential or incidental damages.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-lg">7. TRANSFERABILITY</h3>
            <p className="mt-2">This warranty is non-transferable and applies only to the original property owner.</p>
          </div>

          <p className="mt-6 font-medium">
            This warranty is provided in good faith and is subject to the terms and conditions outlined above.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 pt-8 border-t">
          <div>
            <Label className="font-semibold">Authorized Representative:</Label>
            <div className="mt-2">
              {formData.authorizedRepresentativeSignature ? (
                <div className="border-2 border-gray-300 h-20 w-full p-2">
                  <img
                    src={formData.authorizedRepresentativeSignature || "/placeholder.svg"}
                    alt="Signature"
                    className="h-full w-full object-contain"
                  />
                </div>
              ) : (
                <div
                  onClick={() => applySignature("authorizedRepresentativeSignature")}
                  className="border-2 border-dashed border-gray-400 h-20 w-full cursor-pointer flex items-center justify-center text-gray-500 hover:border-blue-500 hover:text-blue-500"
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" || e.key === " ") applySignature("authorizedRepresentativeSignature")
                  }}
                >
                  {masterSignature ? "Click to apply signature" : "Setup signature first"}
                </div>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="signatureDate" className="font-semibold">
              Date:
            </Label>
            <Input
              id="signatureDate"
              type="text"
              value={formData.authorizedRepresentativeSignatureDate || ""}
              onChange={(e) => handleInputChange("authorizedRepresentativeSignatureDate", e.target.value)}
              className="mt-2 border-0 border-b-2 border-gray-400 rounded-none focus:border-blue-500 focus:ring-0"
              placeholder="MM/DD/YYYY"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

WarrantyContract.displayName = "WarrantyContract"
