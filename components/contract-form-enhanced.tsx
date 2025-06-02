"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileIcon, LockIcon, CheckCircleIcon } from "lucide-react"
import LoadingAnimation from "./loading-animation"
import AddressAutocomplete from "./address-autocomplete"

// Common color options for different categories
const roofingColors = [
  "Weathered Wood",
  "Charcoal",
  "Pewter Gray",
  "Onyx Black",
  "Driftwood",
  "Barkwood",
  "Shakewood",
  "Slate",
  "Hunter Green",
  "Hickory",
  "Mission Brown",
  "Aged Copper",
  "Other",
]

const sidingColors = [
  "White",
  "Almond",
  "Beige",
  "Clay",
  "Tan",
  "Khaki",
  "Sandstone",
  "Gray",
  "Light Gray",
  "Slate",
  "Blue",
  "Green",
  "Red",
  "Brown",
  "Other",
]

const gutterColors = [
  "White",
  "Brown",
  "Black",
  "Almond",
  "Clay",
  "Gray",
  "Bronze",
  "Copper",
  "Musket Brown",
  "Royal Brown",
  "Wicker",
  "Other",
]

const trimColors = ["White", "Almond", "Clay", "Tan", "Gray", "Black", "Brown", "Bronze", "Other"]

export default function ContractFormEnhanced() {
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    // Get today's date in YYYY-MM-DD format for date inputs
    const today = new Date().toISOString().split("T")[0]

    // Format date as MM/DD/YYYY for display
    const displayDate = new Date().toLocaleDateString("en-US")

    return {
      date: displayDate,
      customerSignatureDate: today,
      invisionSignatureDate: today,
    }
  })
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [signaturesLocked, setSignaturesLocked] = useState(false)
  const [showLockSuccess, setShowLockSuccess] = useState(false)
  const [customerSignatureImg, setCustomerSignatureImg] = useState<string | null>(null)
  const [invisionSignatureImg, setInvisionSignatureImg] = useState<string | null>(null)

  // Create refs for each page section
  const page1Ref = useRef<HTMLDivElement>(null)
  const page2Ref = useRef<HTMLDivElement>(null)
  const page3Ref = useRef<HTMLDivElement>(null)

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleColorChange = (field: string, value: string) => {
    // If "Other" is selected, set the value to empty string to trigger the input field
    if (value === "Other") {
      setFormData((prev) => ({ ...prev, [field]: value, [`${field}Custom`]: "" }))
    } else {
      // Otherwise, just set the selected color and clear any custom value
      setFormData((prev) => ({ ...prev, [field]: value, [`${field}Custom`]: undefined }))
    }
  }

  const getColorValue = (colorField: string) => {
    const color = formData[colorField]
    const customColor = formData[`${colorField}Custom`]

    return color === "Other" && customColor ? customColor : color
  }

  const handleLockSignatures = async () => {
    // Check if signatures exist
    if (!formData.customerSignature && !formData.invisionSignature) {
      alert("Please add at least one signature before locking.")
      return
    }

    // Convert signatures to images
    if (formData.customerSignature) {
      setCustomerSignatureImg(formData.customerSignature)
    }

    if (formData.invisionSignature) {
      setInvisionSignatureImg(formData.invisionSignature)
    }

    // Show success animation
    setSignaturesLocked(true)
    setShowLockSuccess(true)

    // Hide success animation after 2 seconds
    setTimeout(() => {
      setShowLockSuccess(false)
    }, 2000)
  }

  const handleGeneratePdf = async () => {
    try {
      setIsGeneratingPdf(true)

      // Import required libraries
      const html2canvas = (await import("html2canvas")).default
      const { jsPDF } = await import("jspdf")

      // Create a fixed-width container for consistent PDF generation
      const fixedContainer = document.createElement("div")
      fixedContainer.style.position = "absolute"
      fixedContainer.style.left = "-9999px"
      fixedContainer.style.width = "1024px" // Fixed desktop width
      fixedContainer.style.overflow = "visible"
      document.body.appendChild(fixedContainer)

      // Define PDF settings
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      // Define margins (in mm)
      const margin = {
        top: 15,
        bottom: 15,
        left: 15,
        right: 15,
      }

      // Calculate content area dimensions
      const pageWidth = 210 // A4 width in mm
      const contentWidth = pageWidth - margin.left - margin.right

      // Process each page
      const pageRefs = [page1Ref, page2Ref, page3Ref]

      for (let i = 0; i < pageRefs.length; i++) {
        const pageRef = pageRefs[i]

        if (pageRef.current) {
          // Clone the page content
          const clone = pageRef.current.cloneNode(true) as HTMLElement

          // Apply additional styles to ensure text is fully visible
          const inputElements = clone.querySelectorAll("input")
          inputElements.forEach((inputEl) => {
            if (inputEl instanceof HTMLElement) {
              inputEl.style.minHeight = "28px"
              inputEl.style.lineHeight = "1.5"
              inputEl.style.paddingBottom = "4px"
            }
          })

          // Apply styles to select elements
          const selectElements = clone.querySelectorAll(".select-trigger, [class*='SelectTrigger']")
          selectElements.forEach((select) => {
            if (select instanceof HTMLElement) {
              select.style.minHeight = "28px"
              select.style.paddingBottom = "4px"
            }
          })

          // Add the clone to the fixed container
          fixedContainer.innerHTML = ""
          fixedContainer.appendChild(clone)

          // Capture the page as an image
          const canvas = await html2canvas(fixedContainer, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: "#ffffff",
            letterRendering: true,
            allowTaint: true,
            height: fixedContainer.scrollHeight,
            onclone: (clonedDoc) => {
              // Remove any text-decoration from all elements in the cloned document
              const elements = clonedDoc.querySelectorAll("*")
              elements.forEach((el) => {
                if (el instanceof HTMLElement) {
                  el.style.textDecoration = "none"
                  el.style.borderBottom = "none"
                }
              })
            },
          })

          // Calculate dimensions for this page
          const imgWidth = contentWidth
          const imgHeight = (canvas.height * imgWidth) / canvas.width

          // Add a new page if not the first page
          if (i > 0) {
            doc.addPage()
          }

          // Add the page to the PDF
          doc.addImage(canvas.toDataURL("image/png"), "PNG", margin.left, margin.top, imgWidth, imgHeight)
        }
      }

      // Clean up - remove the fixed container
      document.body.removeChild(fixedContainer)

      // Save the PDF
      doc.save("Scope-of-Work.pdf")
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Failed to generate PDF. Please try again.")
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  // Custom input style with proper spacing for text
  const inputStyle =
    "border-b border-t-0 border-l-0 border-r-0 rounded-none flex-grow min-h-[32px] leading-relaxed py-2 pb-3"

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 shadow-lg">
      {isGeneratingPdf && <LoadingAnimation message="Assembling your scope of work..." />}

      {showLockSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mb-4" />
            <p className="text-xl font-semibold">Signatures Locked Successfully!</p>
          </div>
        </div>
      )}

      <div className="mb-6 flex justify-end gap-2">
        <Button
          onClick={handleLockSignatures}
          disabled={isGeneratingPdf || signaturesLocked}
          className="flex items-center gap-2"
          variant={signaturesLocked ? "outline" : "default"}
        >
          <LockIcon className="h-4 w-4" />
          {signaturesLocked ? "Signatures Locked" : "Lock Signatures"}
        </Button>
        <Button onClick={handleGeneratePdf} disabled={isGeneratingPdf} className="flex items-center gap-2">
          <FileIcon className="h-4 w-4" />
          {isGeneratingPdf ? "Generating PDF..." : "Generate PDF"}
        </Button>
      </div>

      {/* Page 1: Contact Info, Roofing, and Gutter sections */}
      <div ref={page1Ref} className="space-y-6">
        {/* Title */}
        <div className="pb-4">
          <h1 className="text-center font-bold text-xl">ADDENDUM - SCOPE OF WORK & MATERIAL SELECTION</h1>
        </div>

        {/* CONTACT INFO */}
        <div>
          <div className="bg-gray-500 text-white text-center py-1 font-medium">CONTACT INFO</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div className="flex items-center">
              <span className="whitespace-nowrap mr-2">Customer Name / Job #</span>
              <Input
                className={inputStyle}
                value={formData.customerName || ""}
                onChange={(e) => handleInputChange("customerName", e.target.value)}
              />
            </div>
            <div className="flex items-center">
              <span className="whitespace-nowrap mr-2">Date</span>
              <Input
                type="text"
                className={inputStyle}
                value={formData.date || ""}
                onChange={(e) => handleInputChange("date", e.target.value)}
              />
            </div>
          </div>

          <div className="mt-2">
            <div className="flex items-center">
              <span className="whitespace-nowrap mr-2">
                Company Name <span className="italic">(if applicable)</span>
              </span>
              <Input
                className={inputStyle}
                value={formData.companyName || ""}
                onChange={(e) => handleInputChange("companyName", e.target.value)}
              />
            </div>
          </div>

          <div className="mt-2">
            <div className="flex items-center">
              <span className="whitespace-nowrap mr-2">Address</span>
              <AddressAutocomplete
                className={inputStyle}
                value={formData.address || ""}
                onChange={(value) => handleInputChange("address", value)}
                placeholder="Enter address"
              />
            </div>
          </div>
        </div>

        {/* Rest of the form content */}
        {/* ... */}
      </div>

      {/* Additional pages would go here */}
      {/* ... */}
    </div>
  )
}

ContractFormEnhanced.displayName = "ContractFormEnhanced"
