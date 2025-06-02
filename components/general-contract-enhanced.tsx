"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import SignatureCanvas from "./signature-canvas"
import InitialsCanvas from "./initials-canvas"
import { FileIcon, CheckCircle } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import LoadingAnimation from "./loading-animation"
import AddressAutocomplete from "./address-autocomplete"

export default function GeneralContractEnhanced() {
  // Format current date as MM/DD/YYYY
  const formatDate = () => {
    const now = new Date()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const day = String(now.getDate()).padStart(2, "0")
    const year = now.getFullYear()
    return `${month}/${day}/${year}`
  }

  const [formData, setFormData] = useState<Record<string, any>>(() => {
    // Initialize with current date
    return {
      date: formatDate(),
      agreesDate: formatDate(),
    }
  })

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const contractRef = useRef<HTMLDivElement>(null)
  const finalParagraphsRef = useRef<HTMLDivElement>(null)

  // Store master signature and initials
  const [masterSignature, setMasterSignature] = useState<string>("")
  const [masterInitials, setMasterInitials] = useState<string>("")
  const [hasSetupSignature, setHasSetupSignature] = useState(false)

  // Set the current date when component mounts
  useEffect(() => {
    const currentDate = formatDate()
    setFormData((prev) => ({
      ...prev,
      date: currentDate,
      agreesDate: currentDate,
    }))
  }, [])

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSignatureSetup = (signature: string) => {
    setMasterSignature(signature)
  }

  const handleInitialsSetup = (initials: string) => {
    setMasterInitials(initials)
    if (initials && masterSignature) {
      setHasSetupSignature(true)
    }
  }

  const applySignature = (field: string) => {
    if (masterSignature) {
      handleInputChange(field, masterSignature)
    }
  }

  const applyInitials = (field: string) => {
    if (masterInitials) {
      handleInputChange(field, masterInitials)
    }
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

      // Clone the contract content into the fixed container
      if (contractRef.current) {
        const clone = contractRef.current.cloneNode(true) as HTMLElement
        fixedContainer.appendChild(clone)
      }

      // Clone the final paragraphs if they exist
      if (finalParagraphsRef.current) {
        const finalClone = finalParagraphsRef.current.cloneNode(true) as HTMLElement
        fixedContainer.appendChild(finalClone)
      }

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      // Define margins (in mm)
      const margin = {
        top: 20,
        bottom: 20,
        left: 15,
        right: 15,
      }

      // Calculate content area dimensions
      const pageWidth = 210 // A4 width in mm
      const contentWidth = pageWidth - margin.left - margin.right

      // Get all pages from the fixed container
      const pages = fixedContainer.querySelectorAll(".contract-page")

      // Process each page
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i] as HTMLElement

        // Capture the page as an image
        const canvas = await html2canvas(page, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
          // Add these options to improve text rendering
          letterRendering: true,
          allowTaint: true,
          height: page.scrollHeight + 20, // Add extra height to prevent cutoff
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

      // Get the final paragraphs from the fixed container
      const finalParagraphsElement = fixedContainer.querySelector('[class*="bg-white"]:not(.contract-page)')

      if (finalParagraphsElement) {
        // Add a new page
        doc.addPage()

        // Capture the final paragraphs section
        const finalCanvas = await html2canvas(finalParagraphsElement as HTMLElement, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
          letterRendering: true,
          allowTaint: true,
          height: finalParagraphsElement.scrollHeight + 20,
        })

        // Calculate dimensions
        const finalImgWidth = contentWidth
        const finalImgHeight = (finalCanvas.height * finalImgWidth) / finalCanvas.width

        // Add the final paragraphs to the PDF
        doc.addImage(finalCanvas.toDataURL("image/png"), "PNG", margin.left, margin.top, finalImgWidth, finalImgHeight)
      }

      // Clean up - remove the fixed container
      document.body.removeChild(fixedContainer)

      // Save the PDF
      doc.save("General-Contract.pdf")
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Failed to generate PDF. Please try again.")
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 shadow-lg">
      {isGeneratingPdf && <LoadingAnimation message="Assembling your contract..." />}

      <div className="mb-6 flex justify-between">
        <Link href="/">
          <Button variant="outline">Back to Contracts</Button>
        </Link>
        <Button onClick={handleGeneratePdf} disabled={isGeneratingPdf} className="flex items-center gap-2">
          <FileIcon className="h-4 w-4" />
          {isGeneratingPdf ? "Generating PDF..." : "Generate PDF"}
        </Button>
      </div>

      {/* Signature Setup Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Setup Your Signature & Initials</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="masterSignature">Your Signature (sign once)</Label>
            <SignatureCanvas value={masterSignature} onChange={handleSignatureSetup} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="masterInitials">Your Initials (write once)</Label>
            <InitialsCanvas value={masterInitials} onChange={handleInitialsSetup} />
          </div>

          {hasSetupSignature && (
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>
                Signature and initials ready! Click on any signature or initial field in the contract to apply.
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <div ref={contractRef} className="space-y-8">
        {/* Page 1 */}
        <div className="contract-page pt-10 pb-6">
          <div className="text-center mb-4">
            <img
              src="https://ehjgnin9yr7pmzsk.public.blob.vercel-storage.com/in-vision-logo-UJNZxvzrwPs8WsZrFbI7Z86L8TWcc5.png"
              alt="In-Vision Construction Logo"
              className="w-48 h-auto mx-auto mb-2"
            />

            <h1 className="text-xl font-bold">In-Vision Construction</h1>
            <p className="text-sm" style={{ textDecoration: "none", borderBottom: "none" }}>
              36712 Chatham Ct, Clinton Township, MI 48035
            </p>
            <p className="text-sm" style={{ textDecoration: "none", borderBottom: "none" }}>
              (313) 574-2319
            </p>
            <p className="text-sm" style={{ textDecoration: "none", borderBottom: "none" }}>
              License #2424d1266
            </p>
          </div>

          <div className="space-y-2 mb-6">
            <div className="flex">
              <span className="w-20">Name:</span>
              <Input
                className="border-b border-t-0 border-l-0 border-r-0 rounded-none flex-grow min-h-[28px] leading-relaxed py-1"
                value={formData.name || ""}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
              <span className="w-20 ml-4">Date:</span>
              <Input
                className="border-b border-t-0 border-l-0 border-r-0 rounded-none flex-grow min-h-[28px] leading-relaxed py-1"
                value={formData.date || ""}
                onChange={(e) => handleInputChange("date", e.target.value)}
                readOnly
              />
            </div>
            <div className="flex">
              <span className="w-32">Project Address:</span>
              <AddressAutocomplete
                className="border-b border-t-0 border-l-0 border-r-0 rounded-none flex-grow min-h-[28px] leading-relaxed py-1"
                value={formData.projectAddress || ""}
                onChange={(value) => handleInputChange("projectAddress", value)}
                placeholder="Enter project address"
              />
            </div>
            <div className="flex">
              <span className="w-32">Billing Address:</span>
              <AddressAutocomplete
                className="border-b border-t-0 border-l-0 border-r-0 rounded-none flex-grow min-h-[28px] leading-relaxed py-1"
                value={formData.billingAddress || ""}
                onChange={(value) => handleInputChange("billingAddress", value)}
                placeholder="Enter billing address"
              />
            </div>
            <div className="flex">
              <span className="w-20">Phone:</span>
              <Input
                className="border-b border-t-0 border-l-0 border-r-0 rounded-none flex-grow min-h-[28px] leading-relaxed py-1"
                value={formData.phone || ""}
                onChange={(e) => handleInputChange("phone", e.target.value)}
              />
              <span className="w-20 ml-4">Email:</span>
              <Input
                className="border-b border-t-0 border-l-0 border-r-0 rounded-none flex-grow min-h-[28px] leading-relaxed py-1"
                value={formData.email || ""}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
            </div>
          </div>

          {/* Rest of the contract content remains the same */}
          {/* ... */}

          <div className="text-sm mb-6">
            <p>
              The Agreement does not obligate Home Owner or In-Vision Construction in any way until a Scope of Work is
              approved by Insurance Co. and accepted by In-Vision Construction LLC. Home Owner authorizes In-Vision
              Construction LLC to use Home Owner's best interest for roof/siding/gutter replacement at a "Price
              Agreeable" to Insurance Co. and In-Vision Construction LLC with no additional cost to Home Owner except
              for the Home Owner's deductible. When Price Agreeable is reached, In-Vision Construction LLC will contract
              labor and Home Owner authorizes In-Vision Construction LLC to obtain labor and material in accordance with
              the Price Agreeable and the specifications herein.
            </p>
          </div>

          <div className="mb-6">
            <h2 className="font-bold underline mb-2">CUSTOMER'S RIGHT TO CANCEL (MCL 445.113)</h2>
            <p className="text-sm font-bold">
              You, the buyer, may cancel this transaction at any time prior to midnight of the third business day after
              the date of this transaction. See the attached notice of cancellation form for an explanation of this
              right. Additionally, the seller is prohibited from having an independent courier service or other third
              party pick up your payment at your residence before the end of the 3-business-day period in which you can
              cancel the transaction.
            </p>
          </div>

          <div className="mb-6">
            <p className="text-sm font-bold">
              THIS AGREEMENT CONTAINS MANDATORY ARBITRATION PROVISIONS WHICH MAY BE ENFORCED BY THE PARTIES. THIS
              AGREEMENT CONTAINS A CLASS ACTION WAIVER. BY SIGNING BELOW, YOU ACKNOWLEDGE THAT YOU HAVE READ AND
              UNDERSTAND THESE TERMS.
            </p>
          </div>

          <div className="flex justify-between items-center mt-8">
            <div className="flex items-center">
              <span className="mr-2">AgreestoTerms:</span>
              <div
                className="cursor-pointer border border-dashed border-gray-300 p-1 min-h-[80px] min-w-[200px]"
                onClick={() => applySignature("agreesSignature")}
              >
                {formData.agreesSignature ? (
                  <img src={formData.agreesSignature || "/placeholder.svg"} alt="Signature" className="max-h-16" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-400">Click to sign</div>
                )}
              </div>
            </div>
            <div className="flex items-center">
              <span className="mr-2">Date:</span>
              <Input
                className="w-32 border-b border-t-0 border-l-0 border-r-0 rounded-none min-h-[28px] leading-relaxed py-1"
                value={formData.agreesDate || ""}
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Additional pages would go here */}
        {/* ... */}
      </div>

      {/* Final Paragraphs Section - Separate for PDF generation */}
      <div ref={finalParagraphsRef} className="pt-10 pb-6 bg-white">
        {/* Final paragraphs content */}
        {/* ... */}
      </div>
    </div>
  )
}

GeneralContractEnhanced.displayName = "GeneralContractEnhanced"
