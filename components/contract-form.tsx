"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import SignatureCanvas from "./signature-canvas"
import { FileIcon, LockIcon, CheckCircleIcon } from "lucide-react"
import LoadingAnimation from "./loading-animation"
import AddressAutocomplete from "./address-autocomplete"
import { useLeadData } from "@/hooks/useLeadData"

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

export default function ContractForm() {
  const lead = useLeadData()
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    // Get today's date in YYYY-MM-DD format for date inputs
    const today = new Date().toISOString().split("T")[0]

    // Format date as MM/DD/YYYY for display
    const displayDate = new Date().toLocaleDateString("en-US")

    return {
      date: displayDate,
      customerSignatureDate: today,
      invisionSignatureDate: today,
      // Pre-fill lead data if available
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      propertyAddress: "",
      insuranceCompany: "",
      policyNumber: "",
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

  // Effect to update form data when lead data is available
  useEffect(() => {
    if (lead) {
      setFormData(prev => ({
        ...prev,
        customerName: `${lead.firstName} ${lead.lastName}`,
        address: lead.address,
        // Keep the auto-filled date from initial state
        // Company name is manually filled by user
      }))
    }
  }, [lead])

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

        {/* ROOFING SPECIFICATION INFO */}
        <div>
          <div className="bg-gray-500 text-white text-center py-1 font-medium">ROOFING SPECIFICATION INFO</div>
          <div className="mt-2 text-sm">
            <p>
              As outlined in the Agreement, Customer must select shingle manufacturer, style, and colors. Customer
              understands In-Vision will take reasonable measures to attempt to obtain one of the two options listed
              below and agrees that either of the two listed are acceptable.
            </p>
            <div className="border border-black mt-2 p-2">
              <span>Roof Spec</span>
              <Input
                className="w-full border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[32px] leading-relaxed py-2 pb-3"
                value={formData.roofSpec || ""}
                onChange={(e) => handleInputChange("roofSpec", e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center">
              <span className="whitespace-nowrap mr-2">Roof Color</span>
              <div className="flex-grow relative z-10">
                <Select
                  value={formData.roofColor || ""}
                  onValueChange={(value) => handleColorChange("roofColor", value)}
                >
                  <SelectTrigger className="w-full max-w-xs bg-white min-h-[32px]">
                    <SelectValue placeholder="Select roof color" />
                  </SelectTrigger>
                  <SelectContent className="z-50">
                    {roofingColors.map((color) => (
                      <SelectItem key={color} value={color}>
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.roofColor === "Other" && (
                  <Input
                    className="mt-2 max-w-xs mb-2 min-h-[32px] leading-relaxed py-2 pb-3"
                    placeholder="Enter custom color"
                    value={formData.roofColorCustom || ""}
                    onChange={(e) => handleInputChange("roofColorCustom", e.target.value)}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <span className="mr-2">Ventilation</span>
              <div className="flex items-center mr-2">
                <Checkbox
                  id="pre-existing"
                  checked={formData.ventilationPreExisting || false}
                  onCheckedChange={(checked) => handleInputChange("ventilationPreExisting", checked)}
                />
                <label htmlFor="pre-existing" className="ml-1">
                  Pre-Existing
                </label>
              </div>
              <Input
                className={inputStyle}
                value={formData.ventilationPreExistingDetails || ""}
                onChange={(e) => handleInputChange("ventilationPreExistingDetails", e.target.value)}
              />
            </div>
            <div className="flex items-center">
              <div className="flex items-center mr-2">
                <Checkbox
                  id="adding"
                  checked={formData.ventilationAdding || false}
                  onCheckedChange={(checked) => handleInputChange("ventilationAdding", checked)}
                />
                <label htmlFor="adding" className="ml-1">
                  Adding
                </label>
              </div>
              <Input
                className={inputStyle}
                value={formData.ventilationAddingDetails || ""}
                onChange={(e) => handleInputChange("ventilationAddingDetails", e.target.value)}
              />
            </div>
          </div>

          <div className="mt-2">
            <div className="flex items-center">
              <span className="whitespace-nowrap mr-2">Additional Info</span>
              <Input
                className={inputStyle}
                value={formData.roofingAdditionalInfo || ""}
                onChange={(e) => handleInputChange("roofingAdditionalInfo", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* GUTTER SPECIFICATION INFO */}
        <div>
          <div className="bg-gray-500 text-white text-center py-1 font-medium">GUTTER SPECIFICATION INFO</div>

          <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="mr-2">Scope of Work</span>
              <div className="flex items-center mt-1">
                <Checkbox
                  id="gutters-downspouts"
                  checked={formData.guttersDownspouts || false}
                  onCheckedChange={(checked) => handleInputChange("guttersDownspouts", checked)}
                />
                <label htmlFor="gutters-downspouts" className="ml-1">
                  Gutters/Downspouts
                </label>
              </div>
              <div className="flex items-center mt-1">
                <Checkbox
                  id="none-gutters"
                  checked={formData.noneGutters || false}
                  onCheckedChange={(checked) => handleInputChange("noneGutters", checked)}
                />
                <label htmlFor="none-gutters" className="ml-1">
                  None
                </label>
              </div>
            </div>

            <div>
              <span className="mr-2">Size</span>
              <div className="flex items-center mt-1">
                <Checkbox
                  id="standard"
                  checked={formData.sizeStandard || false}
                  onCheckedChange={(checked) => handleInputChange("sizeStandard", checked)}
                />
                <label htmlFor="standard" className="ml-1">
                  Standard
                </label>
              </div>
              <div className="flex items-center mt-1">
                <Checkbox
                  id="oversized"
                  checked={formData.sizeOversized || false}
                  onCheckedChange={(checked) => handleInputChange("sizeOversized", checked)}
                />
                <label htmlFor="oversized" className="ml-1">
                  Oversized
                </label>
              </div>
            </div>

            <div>
              <div className="flex flex-col">
                <span className="whitespace-nowrap mb-1">Color</span>
                <div className="relative z-10">
                  <Select
                    value={formData.gutterColor || ""}
                    onValueChange={(value) => handleColorChange("gutterColor", value)}
                  >
                    <SelectTrigger className="w-full bg-white min-h-[32px]">
                      <SelectValue placeholder="Select gutter color" />
                    </SelectTrigger>
                    <SelectContent className="z-50">
                      {gutterColors.map((color) => (
                        <SelectItem key={color} value={color}>
                          {color}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.gutterColor === "Other" && (
                    <Input
                      className="mt-2 w-full mb-2 min-h-[32px] leading-relaxed py-2 pb-3"
                      placeholder="Enter custom color"
                      value={formData.gutterColorCustom || ""}
                      onChange={(e) => handleInputChange("gutterColorCustom", e.target.value)}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center">
                <span className="mr-2">Gutter Guards</span>
                <span className="mr-2">Do you have gutter guards?</span>
                <div className="flex items-center">
                  <Checkbox
                    id="yes-guards"
                    checked={formData.hasGutterGuardsYes || false}
                    onCheckedChange={(checked) => handleInputChange("hasGutterGuardsYes", checked)}
                  />
                  <label htmlFor="yes-guards" className="ml-1">
                    Yes
                  </label>
                </div>
                <div className="flex items-center ml-2">
                  <Checkbox
                    id="no-guards"
                    checked={formData.hasGutterGuardsNo || false}
                    onCheckedChange={(checked) => handleInputChange("hasGutterGuardsNo", checked)}
                  />
                  <label htmlFor="no-guards" className="ml-1">
                    No
                  </label>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center">
                <span className="mr-2">If yes, is there a current warranty?</span>
                <div className="flex items-center">
                  <Checkbox
                    id="yes-warranty"
                    checked={formData.hasWarrantyYes || false}
                    onCheckedChange={(checked) => handleInputChange("hasWarrantyYes", checked)}
                  />
                  <label htmlFor="yes-warranty" className="ml-1">
                    Yes
                  </label>
                </div>
                <div className="flex items-center ml-2">
                  <Checkbox
                    id="no-warranty"
                    checked={formData.hasWarrantyNo || false}
                    onCheckedChange={(checked) => handleInputChange("hasWarrantyNo", checked)}
                  />
                  <label htmlFor="no-warranty" className="ml-1">
                    No
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 text-sm">
            <p className="italic">
              Note: Customer is responsible for removing gutter guards prior to roof or gutter installation. In-Vision
              is not responsible for any damage that may occur to gutter guards during installation.
            </p>
          </div>

          <div className="mt-2">
            <div className="flex items-center">
              <span className="whitespace-nowrap mr-2">Additional Info</span>
              <Input
                className={inputStyle}
                value={formData.gutterAdditionalInfo || ""}
                onChange={(e) => handleInputChange("gutterAdditionalInfo", e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Page 2: Siding, Solar, HOA, and Misc sections */}
      <div ref={page2Ref} className="space-y-6 mt-8">
        {/* SIDING INFO */}
        <div>
          <div className="bg-gray-500 text-white text-center py-1 font-medium">SIDING INFO</div>

          <div className="mt-2">
            <div className="border border-black p-2">
              <span>Siding Spec</span>
              <Input
                className="w-full border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[32px] leading-relaxed py-2 pb-3"
                value={formData.sidingSpec || ""}
                onChange={(e) => handleInputChange("sidingSpec", e.target.value)}
              />
            </div>
          </div>

          <div className="mt-2">
            <table className="w-full border-collapse">
              <tbody>
                <tr>
                  <td className="border border-black p-2 pb-4">
                    <span className="block mb-1">Siding Color</span>
                    <div className="relative z-20">
                      <Select
                        value={formData.sidingColor || ""}
                        onValueChange={(value) => handleColorChange("sidingColor", value)}
                      >
                        <SelectTrigger className="w-full bg-white min-h-[32px]">
                          <SelectValue placeholder="Select siding color" />
                        </SelectTrigger>
                        <SelectContent className="z-50">
                          {sidingColors.map((color) => (
                            <SelectItem key={color} value={color}>
                              {color}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formData.sidingColor === "Other" && (
                        <Input
                          className="mt-2 w-full mb-2 min-h-[32px] leading-relaxed py-2 pb-3"
                          placeholder="Enter custom color"
                          value={formData.sidingColorCustom || ""}
                          onChange={(e) => handleInputChange("sidingColorCustom", e.target.value)}
                        />
                      )}
                    </div>
                  </td>
                  <td className="border border-black p-2 pb-4">
                    <span className="block mb-1">Corner Color</span>
                    <div className="relative z-10">
                      <Select
                        value={formData.cornerColor || ""}
                        onValueChange={(value) => handleColorChange("cornerColor", value)}
                      >
                        <SelectTrigger className="w-full bg-white min-h-[32px]">
                          <SelectValue placeholder="Select corner color" />
                        </SelectTrigger>
                        <SelectContent className="z-50">
                          {trimColors.map((color) => (
                            <SelectItem key={color} value={color}>
                              {color}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formData.cornerColor === "Other" && (
                        <Input
                          className="mt-2 w-full mb-2 min-h-[32px] leading-relaxed py-2 pb-3"
                          placeholder="Enter custom color"
                          value={formData.cornerColorCustom || ""}
                          onChange={(e) => handleInputChange("cornerColorCustom", e.target.value)}
                        />
                      )}
                    </div>
                  </td>
                  <td className="border border-black p-2 pb-4">
                    <span className="block mb-1">Gable Vent Color</span>
                    <div className="relative z-10">
                      <Select
                        value={formData.gableVentColor || ""}
                        onValueChange={(value) => handleColorChange("gableVentColor", value)}
                      >
                        <SelectTrigger className="w-full bg-white min-h-[32px]">
                          <SelectValue placeholder="Select gable vent color" />
                        </SelectTrigger>
                        <SelectContent className="z-50">
                          {trimColors.map((color) => (
                            <SelectItem key={color} value={color}>
                              {color}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formData.gableVentColor === "Other" && (
                        <Input
                          className="mt-2 w-full mb-2 min-h-[32px] leading-relaxed py-2 pb-3"
                          placeholder="Enter custom color"
                          value={formData.gableVentColorCustom || ""}
                          onChange={(e) => handleInputChange("gableVentColorCustom", e.target.value)}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-2">
            <div className="flex flex-wrap items-center gap-2">
              <span>Shutter</span>
              <div className="flex items-center">
                <Checkbox
                  id="detach-reset"
                  checked={formData.shutterDetachReset || false}
                  onCheckedChange={(checked) => handleInputChange("shutterDetachReset", checked)}
                />
                <label htmlFor="detach-reset" className="ml-1">
                  Detach & Reset Existing
                </label>
              </div>
              <div className="flex items-center">
                <Checkbox
                  id="replace-new"
                  checked={formData.shutterReplaceNew || false}
                  onCheckedChange={(checked) => handleInputChange("shutterReplaceNew", checked)}
                />
                <label htmlFor="replace-new" className="ml-1">
                  Replace with New <span className="italic">(provided by Customer)</span>
                </label>
              </div>
              <div className="flex items-center">
                <Checkbox
                  id="remove-discard"
                  checked={formData.shutterRemoveDiscard || false}
                  onCheckedChange={(checked) => handleInputChange("shutterRemoveDiscard", checked)}
                />
                <label htmlFor="remove-discard" className="ml-1">
                  Remove & Discard <span className="italic">(do not reinstall)</span>
                </label>
              </div>
              <div className="flex items-center">
                <Checkbox
                  id="n-a"
                  checked={formData.shutterNA || false}
                  onCheckedChange={(checked) => handleInputChange("shutterNA", checked)}
                />
                <label htmlFor="n-a" className="ml-1">
                  N/A
                </label>
              </div>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-4">
            <span>Fascia/Soffit/Wrap Scope of Work</span>
            <div className="flex items-center">
              <Checkbox
                id="fascia"
                checked={formData.fascia || false}
                onCheckedChange={(checked) => handleInputChange("fascia", checked)}
              />
              <label htmlFor="fascia" className="ml-1">
                Fascia
              </label>
            </div>
            <div className="flex items-center">
              <Checkbox
                id="soffit"
                checked={formData.soffit || false}
                onCheckedChange={(checked) => handleInputChange("soffit", checked)}
              />
              <label htmlFor="soffit" className="ml-1">
                Soffit
              </label>
            </div>
            <div className="flex items-center">
              <Checkbox
                id="wraps"
                checked={formData.wraps || false}
                onCheckedChange={(checked) => handleInputChange("wraps", checked)}
              />
              <label htmlFor="wraps" className="ml-1">
                Wraps
              </label>
            </div>
            <div className="flex items-center">
              <Checkbox
                id="none-fascia"
                checked={formData.noneFascia || false}
                onCheckedChange={(checked) => handleInputChange("noneFascia", checked)}
              />
              <label htmlFor="none-fascia" className="ml-1">
                None
              </label>
            </div>
          </div>

          <div className="mt-2">
            <div className="flex items-center">
              <span className="whitespace-nowrap mr-2">Fascia/Soffit/Wrap Color</span>
              <div className="relative z-10">
                <Select
                  value={formData.fasciaColor || ""}
                  onValueChange={(value) => handleColorChange("fasciaColor", value)}
                >
                  <SelectTrigger className="w-full max-w-xs bg-white min-h-[32px]">
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent className="z-50">
                    {trimColors.map((color) => (
                      <SelectItem key={color} value={color}>
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.fasciaColor === "Other" && (
                  <Input
                    className="mt-2 max-w-xs w-full mb-2 min-h-[32px] leading-relaxed py-2 pb-3"
                    placeholder="Enter custom color"
                    value={formData.fasciaColorCustom || ""}
                    onChange={(e) => handleInputChange("fasciaColorCustom", e.target.value)}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="mt-2">
            <div className="flex items-center">
              <span className="whitespace-nowrap mr-2">Additional Info</span>
              <Input
                className={inputStyle}
                value={formData.sidingAdditionalInfo || ""}
                onChange={(e) => handleInputChange("sidingAdditionalInfo", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* SOLAR INFO */}
        <div>
          <div className="bg-gray-500 text-white text-center py-1 font-medium">SOLAR INFO</div>

          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <span className="whitespace-nowrap mr-2">Solar Company</span>
              <Input
                className={inputStyle}
                value={formData.solarCompany || ""}
                onChange={(e) => handleInputChange("solarCompany", e.target.value)}
              />
            </div>
            <div className="flex items-center">
              <span className="whitespace-nowrap mr-2"># of Panels</span>
              <Input
                className={inputStyle}
                value={formData.numberOfPanels || ""}
                onChange={(e) => handleInputChange("numberOfPanels", e.target.value)}
              />
            </div>
          </div>

          <div className="mt-2">
            <div className="flex items-center">
              <span className="whitespace-nowrap mr-2">Solar Contact Info</span>
              <Input
                className={inputStyle}
                value={formData.solarContactInfo || ""}
                onChange={(e) => handleInputChange("solarContactInfo", e.target.value)}
              />
            </div>
          </div>

          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center">
                <Checkbox
                  id="owned"
                  checked={formData.solarOwned || false}
                  onCheckedChange={(checked) => handleInputChange("solarOwned", checked)}
                />
                <label htmlFor="owned" className="ml-1">
                  Owned
                </label>
              </div>
              <div className="flex items-center">
                <Checkbox
                  id="leased"
                  checked={formData.solarLeased || false}
                  onCheckedChange={(checked) => handleInputChange("solarLeased", checked)}
                />
                <label htmlFor="leased" className="ml-1">
                  Leased
                </label>
              </div>
              <div className="flex items-center">
                <Checkbox
                  id="no-solar"
                  checked={formData.solarNo || false}
                  onCheckedChange={(checked) => handleInputChange("solarNo", checked)}
                />
                <label htmlFor="no-solar" className="ml-1">
                  No
                </label>
              </div>
            </div>
            <div className="flex items-center justify-end">
              <div className="flex items-center">
                <Checkbox
                  id="unknown"
                  checked={formData.solarUnknown || false}
                  onCheckedChange={(checked) => handleInputChange("solarUnknown", checked)}
                />
                <label htmlFor="unknown" className="ml-1">
                  Unknown
                </label>
              </div>
            </div>
          </div>

          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center">
                <span className="mr-2">Is there a Critter Cage?</span>
                <div className="flex items-center">
                  <Checkbox
                    id="yes-critter"
                    checked={formData.hasCritterCageYes || false}
                    onCheckedChange={(checked) => handleInputChange("hasCritterCageYes", checked)}
                  />
                  <label htmlFor="yes-critter" className="ml-1">
                    Yes
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-2">
            <div className="flex items-center">
              <span className="whitespace-nowrap mr-2">Additional Info</span>
              <Input
                className={inputStyle}
                value={formData.solarAdditionalInfo || ""}
                onChange={(e) => handleInputChange("solarAdditionalInfo", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* HOA INFO */}
        <div>
          <div className="bg-gray-500 text-white text-center py-1 font-medium">HOME OWNERS ASSOCIATION (HOA)</div>

          <div className="mt-2">
            <div className="flex items-center">
              <span className="whitespace-nowrap mr-2">HOA Contact Info</span>
              <Input
                className={inputStyle}
                value={formData.hoaContactInfo || ""}
                onChange={(e) => handleInputChange("hoaContactInfo", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* MISC */}
        <div>
          <div className="bg-gray-500 text-white text-center py-1 font-medium">MISC</div>

          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center">
                <span className="whitespace-nowrap mr-2">Satellite Dish</span>
                <span className="mr-2">If there is a satellite dish, do we?</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <div className="flex items-center">
                  <Checkbox
                    id="keep"
                    checked={formData.satelliteKeep || false}
                    onCheckedChange={(checked) => handleInputChange("satelliteKeep", checked)}
                  />
                  <label htmlFor="keep" className="ml-1">
                    Keep
                  </label>
                </div>
                <div className="flex items-center">
                  <Checkbox
                    id="dispose"
                    checked={formData.satelliteDispose || false}
                    onCheckedChange={(checked) => handleInputChange("satelliteDispose", checked)}
                  />
                  <label htmlFor="dispose" className="ml-1">
                    Dispose
                  </label>
                </div>
                <div className="flex items-center">
                  <Checkbox
                    id="no-dish"
                    checked={formData.noDishExists || false}
                    onCheckedChange={(checked) => handleInputChange("noDishExists", checked)}
                  />
                  <label htmlFor="no-dish" className="ml-1">
                    No Dish Exists
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-2 text-sm">
            <p className="italic">
              Note: Customer is responsible for satellite dish removal and re-installation. While In-Vision can remove
              and re-attach a satellite dish, our crews are not satellite dish experts. Any time a satellite dish is
              modified on a structure, the cable/ satellite/ internet provider must reset and reposition the dish for
              proper reception. In-Vision is not responsible for any damage that may occur to satellite dishes during
              removal and re-attaching.
            </p>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center">
                <span className="whitespace-nowrap mr-2">Detached Structure</span>
                <span className="mr-2">Is there a detached structure?</span>
                <div className="flex items-center">
                  <Checkbox
                    id="yes-detached"
                    checked={formData.hasDetachedStructureYes || false}
                    onCheckedChange={(checked) => handleInputChange("hasDetachedStructureYes", checked)}
                  />
                  <label htmlFor="yes-detached" className="ml-1">
                    Yes
                  </label>
                </div>
                <div className="flex items-center ml-2">
                  <Checkbox
                    id="no-detached"
                    checked={formData.hasDetachedStructureNo || false}
                    onCheckedChange={(checked) => handleInputChange("hasDetachedStructureNo", checked)}
                  />
                  <label htmlFor="no-detached" className="ml-1">
                    No
                  </label>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center">
                <span className="mr-2">If yes, are we performing work on it?</span>
                <div className="flex items-center">
                  <Checkbox
                    id="yes-work"
                    checked={formData.performingWorkYes || false}
                    onCheckedChange={(checked) => handleInputChange("performingWorkYes", checked)}
                  />
                  <label htmlFor="yes-work" className="ml-1">
                    Yes
                  </label>
                </div>
                <div className="flex items-center ml-2">
                  <Checkbox
                    id="no-work"
                    checked={formData.performingWorkNo || false}
                    onCheckedChange={(checked) => handleInputChange("performingWorkNo", checked)}
                  />
                  <label htmlFor="no-work" className="ml-1">
                    No
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-2">
            <div className="flex items-center">
              <span className="whitespace-nowrap mr-2">Description</span>
              <Input
                className={inputStyle}
                value={formData.detachedDescription || ""}
                onChange={(e) => handleInputChange("detachedDescription", e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center">
                <span className="whitespace-nowrap mr-2">Driveway Damage</span>
                <span className="mr-2">Is there any existing driveway damage?</span>
              </div>
            </div>
            <div>
              <div className="flex items-center">
                <div className="flex items-center">
                  <Checkbox
                    id="yes-driveway"
                    checked={formData.hasDrivewayDamageYes || false}
                    onCheckedChange={(checked) => handleInputChange("hasDrivewayDamageYes", checked)}
                  />
                  <label htmlFor="yes-driveway" className="ml-1">
                    Yes
                  </label>
                </div>
                <div className="flex items-center ml-2">
                  <Checkbox
                    id="no-driveway"
                    checked={formData.hasDrivewayDamageNo || false}
                    onCheckedChange={(checked) => handleInputChange("hasDrivewayDamageNo", checked)}
                  />
                  <label htmlFor="no-driveway" className="ml-1">
                    No
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-2">
            <div className="flex items-center">
              <span className="whitespace-nowrap mr-2">Description</span>
              <Input
                className={inputStyle}
                value={formData.drivewayDescription || ""}
                onChange={(e) => handleInputChange("drivewayDescription", e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-start">
              <span className="whitespace-nowrap mr-2">Landscaping Damage</span>
              <p className="text-sm">
                In-Vision takes precautions to protect landscaping and other items outside the home, however, In-Vision
                does not guarantee that all plants, landscaping, grass, etc. will be unaffected. In our efforts to
                protect landscaping, it is also the Customer's responsibility to remove any items that might be in
                danger of construction debris. If any item (s) cannot be moved which Customer feels needs extra
                protection list below:
              </p>
            </div>
          </div>

          <div className="mt-2">
            <div className="flex items-center">
              <span className="whitespace-nowrap mr-2">Additional Notes</span>
              <Input
                className={inputStyle}
                value={formData.additionalNotes || ""}
                onChange={(e) => handleInputChange("additionalNotes", e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Page 3: Approval and Signatures */}
      <div ref={page3Ref} className="space-y-6 mt-8">
        {/* APPROVAL */}
        <div>
          <div className="bg-gray-500 text-white text-center py-1 font-medium">APPROVAL</div>

          <div className="mt-2 pb-4 text-sm">
            <p>
              This Addendum – Scope of Work & Material Selection is made and entered into by and between In-Vision and
              the Customer. This Addendum is hereby attached to the original Agreement that was entered into by and
              between In-Vision and Customer and is bound by the same General Terms and other Addendums attached to the
              original Agreement.
            </p>

            <p className="mt-4">
              <strong>Color Variation</strong> Customer understands the color samples shown are provided by the shingle,
              siding, and gutter manufacturers as an approximate representation of the color. The actual color on the
              roof as it does in the sample based on variations in the printing or computer monitor colors,
              manufacturing process, sun vs shade vs overcast, the natural colors variations of the dry vs wet, etc.
              In-Vision is not responsible for color variations in a given product.
            </p>
          </div>

          <div>
            <p className="font-bold">Nail Pops</p>
            <p className="text-sm">
              Nail pops can occur on interior walls and ceilings of homes during the installation of roof, siding,
              gutters, and solar panels. There are a variety of reasons for nail pops to occur including but not limited
              to: improper drywall attachment, settling of roof and home, nicote-reci use of nail sizes on drywall,
              expansion and contraction on the wood studs, and vibration during the removal and re-installation of
              exterior products. Nail pops are not covered under In-Vision's warranty and In-Vision is not responsible
              for repairing any nail pops that may occur. The expense associated with repairing nail pops are the
              responsibility of the Customer.
            </p>

            <p className="text-sm mt-2">
              By their signature below, Customer hereby acknowledges and agrees to the scope of work and material
              selection as outlined on this page. No oral modifications, revisions or additions may be made to this
              Addendum.
            </p>
          </div>

          <div className="mt-4">
            <div className="flex flex-col space-y-2">
              <p className="font-medium">Customer:</p>
              <div className="border border-dashed border-gray-300 p-1 min-h-[80px]">
                {customerSignatureImg ? (
                  <img src={customerSignatureImg || "/placeholder.svg"} alt="Customer Signature" className="max-h-16" />
                ) : (
                  <SignatureCanvas
                    value={formData.customerSignature || ""}
                    onChange={(value) => handleInputChange("customerSignature", value)}
                  />
                )}
              </div>
              <div className="flex items-center mt-2">
                <span className="mr-2">Date:</span>
                <Input
                  type="date"
                  className="max-w-xs min-h-[32px] leading-relaxed py-2 pb-3"
                  value={formData.customerSignatureDate || ""}
                  onChange={(e) => handleInputChange("customerSignatureDate", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex flex-col space-y-2">
              <p className="font-medium">In-Vision:</p>
              <div className="border border-dashed border-gray-300 p-1 min-h-[80px]">
                {invisionSignatureImg ? (
                  <img
                    src={invisionSignatureImg || "/placeholder.svg"}
                    alt="In-Vision Signature"
                    className="max-h-16"
                  />
                ) : (
                  <SignatureCanvas
                    value={formData.invisionSignature || ""}
                    onChange={(value) => handleInputChange("invisionSignature", value)}
                  />
                )}
              </div>
              <div className="flex items-center mt-2">
                <span className="mr-2">Date:</span>
                <Input
                  type="date"
                  className="max-w-xs min-h-[32px] leading-relaxed py-2 pb-3"
                  value={formData.invisionSignatureDate || ""}
                  onChange={(e) => handleInputChange("invisionSignatureDate", e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
