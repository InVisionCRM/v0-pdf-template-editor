"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { FileIcon, CheckCircle, Edit3Icon } from "lucide-react"
import Link from "next/link"
import { Label } from "@/components/ui/label"
import LoadingAnimation from "./loading-animation"
import { format } from "date-fns"
import AdoptSignatureDialog from "./adopt-signature-dialog"

export default function ThirdPartyAuthorization() {
  const formatDate = () => {
    const now = new Date()
    return format(now, "MM/dd/yyyy")
  }

  const [formData, setFormData] = useState<Record<string, any>>(() => {
    return {
      date: formatDate(),
      primarySignatureDate: formatDate(),
      coSignatureDate: formatDate(),
      authorizedParty1Name: "In-Vision Construction LLC",
      authorizedParty1Phone: "313-247-0142",
      authorizedParty1Email: "Info@in-visionconstruction.com",
      authorizedParty1Address: "36712 Chatham Ct, Clinton Township, Mi 48036",
    }
  })

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const formRef = useRef<HTMLDivElement>(null)

  const [primarySignature, setPrimarySignature] = useState<string>("")
  const [coSignature, setCoSignature] = useState<string>("")
  const [hasSetupPrimarySignature, setHasSetupPrimarySignature] = useState(false)
  const [hasSetupCoSignature, setHasSetupCoSignature] = useState(false)

  const [isPrimaryAdoptDialogOpen, setIsPrimaryAdoptDialogOpen] = useState(false)
  const [isCoAdoptDialogOpen, setIsCoAdoptDialogOpen] = useState(false)

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  useEffect(() => {
    setHasSetupPrimarySignature(!!primarySignature && primarySignature !== "data:,")
  }, [primarySignature])

  useEffect(() => {
    setHasSetupCoSignature(!!coSignature && coSignature !== "data:,")
  }, [coSignature])

  const handleAdoptPrimarySignature = (signature: string) => {
    setPrimarySignature(signature)
    setIsPrimaryAdoptDialogOpen(false)
  }

  const handleAdoptCoSignature = (signature: string) => {
    setCoSignature(signature)
    setIsCoAdoptDialogOpen(false)
  }

  const applyPrimarySignature = () => {
    if (primarySignature) {
      handleInputChange("primarySignature", primarySignature)
    }
  }

  const applyCoSignature = () => {
    if (coSignature) {
      handleInputChange("coSignature", coSignature)
    }
  }

  const handleGeneratePdf = async () => {
    if (!formRef.current) {
      alert("Form content not found")
      return
    }
    try {
      setIsGeneratingPdf(true)
      await new Promise((resolve) => setTimeout(resolve, 100))
      const [html2canvasModule, jsPDFModule] = await Promise.all([
        import("html2canvas").catch(() => null),
        import("jspdf").catch(() => null),
      ])
      if (!html2canvasModule || !jsPDFModule) {
        throw new Error("Failed to load PDF libraries")
      }
      const html2canvas = html2canvasModule.default
      const { jsPDF } = jsPDFModule
      const fixedContainer = document.createElement("div")
      fixedContainer.style.position = "absolute"
      fixedContainer.style.left = "-9999px"
      fixedContainer.style.width = "800px"
      fixedContainer.style.padding = "40px"
      fixedContainer.style.backgroundColor = "#ffffff"
      document.body.appendChild(fixedContainer)
      
      fixedContainer.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-size: 24px; font-weight: bold; margin: 0; text-transform: uppercase;">THIRD PARTY AUTHORIZATION FORM</h1>
        </div>
        ${formRef.current.innerHTML}
      `

      const canvas = await html2canvas(fixedContainer, {
        scale: 0.75,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        width: fixedContainer.scrollWidth, 
        height: fixedContainer.scrollHeight,
      })
      document.body.removeChild(fixedContainer)
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })
      const pdfWidth = 210
      const pdfHeight = 297
      const margin = 15
      const maxWidth = pdfWidth - margin * 2
      const maxHeight = pdfHeight - margin * 2
      const imgWidth = canvas.width / 2 
      const imgHeight = canvas.height / 2 
      const ratio = Math.min(maxWidth / imgWidth, maxHeight / imgHeight)
      const finalWidth = imgWidth * ratio
      const finalHeight = imgHeight * ratio
      const xOffset = (pdfWidth - finalWidth) / 2
      const yOffset = margin
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", xOffset, yOffset, finalWidth, finalHeight)
      pdf.save("Third-Party-Authorization.pdf")
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Failed to generate PDF. Please try again.")
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 shadow-lg">
      {isGeneratingPdf && <LoadingAnimation message="Generating Authorization Form..." />}

      <div className="mb-6 flex justify-between items-center">
        <Link href="/">
          <Button variant="outline">Back to Contracts</Button>
        </Link>
        <Button onClick={handleGeneratePdf} disabled={isGeneratingPdf} className="flex items-center gap-2">
          <FileIcon className="h-4 w-4" />
          {isGeneratingPdf ? "Generating PDF..." : "Generate PDF"}
        </Button>
      </div>

      <div className="mb-8 p-6 border border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-center">
        {!hasSetupPrimarySignature ? (
          <React.Fragment>
            <Edit3Icon className="h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-700 mb-1">Setup Primary Homeowner&apos;s Signature</h3>
            <p className="text-sm text-gray-500 mb-4">
              Click the button below to draw or type the primary homeowner&apos;s signature.
            </p>
            <Button onClick={() => setIsPrimaryAdoptDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
              Setup Primary Signature
            </Button>
          </React.Fragment>
        ) : (
          <div className="flex flex-col items-center text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mb-3" />
            <h3 className="text-lg font-medium text-gray-700 mb-1">Primary Signature Setup Complete!</h3>
            <p className="text-sm text-gray-500 mb-4">
              The primary homeowner&apos;s signature is ready. You can apply it below or update it if needed.
            </p>
            <Button onClick={() => setIsPrimaryAdoptDialogOpen(true)} variant="outline">
              Update Primary Signature
            </Button>
          </div>
        )}
      </div>

      <AdoptSignatureDialog
        open={isPrimaryAdoptDialogOpen}
        onOpenChange={setIsPrimaryAdoptDialogOpen}
        onAdopt={handleAdoptPrimarySignature}
        initialSignature={primarySignature}
        title="Adopt Primary Homeowner&apos;s Signature"
        needsInitials={false}
      />

      <div className="mb-8 p-6 border border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-center">
        {!hasSetupCoSignature ? (
          <React.Fragment>
            <Edit3Icon className="h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-700 mb-1">Setup Co-Homeowner/Spouse&apos;s Signature</h3>
            <p className="text-sm text-gray-500 mb-4">
              Click the button below to draw or type the co-homeowner/spouse&apos;s signature (if applicable).
            </p>
            <Button onClick={() => setIsCoAdoptDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
              Setup Co-Homeowner Signature
            </Button>
          </React.Fragment>
        ) : (
          <div className="flex flex-col items-center text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mb-3" />
            <h3 className="text-lg font-medium text-gray-700 mb-1">Co-Homeowner Signature Setup Complete!</h3>
            <p className="text-sm text-gray-500 mb-4">
              The co-homeowner/spouse&apos;s signature is ready. You can apply it below or update it if needed.
            </p>
            <Button onClick={() => setIsCoAdoptDialogOpen(true)} variant="outline">
              Update Co-Homeowner Signature
            </Button>
          </div>
        )}
      </div>

      <AdoptSignatureDialog
        open={isCoAdoptDialogOpen}
        onOpenChange={setIsCoAdoptDialogOpen}
        onAdopt={handleAdoptCoSignature}
        initialSignature={coSignature}
        title="Adopt Co-Homeowner/Spouse&apos;s Signature"
        needsInitials={false}
      />

      <div ref={formRef} className="space-y-6 text-sm">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold uppercase">Third Party Authorization Form</h1>
        </div>

        <div className="border p-4 rounded-md space-y-3">
          <h2 className="text-xl font-semibold">Homeowner/ Borrower (defined as)</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="homeownerName">Name:</Label>
              <Input id="homeownerName" value={formData.homeownerName || ""} onChange={(e) => handleInputChange("homeownerName", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="homeownerPhone">Phone:</Label>
              <Input id="homeownerPhone" value={formData.homeownerPhone || ""} onChange={(e) => handleInputChange("homeownerPhone", e.target.value)} />
            </div>
          </div>
          <div>
            <Label htmlFor="homeownerAddress">Address:</Label>
            <Input id="homeownerAddress" value={formData.homeownerAddress || ""} onChange={(e) => handleInputChange("homeownerAddress", e.target.value)} />
          </div>
        </div>

        <div className="border p-4 rounded-md space-y-3 bg-gray-50">
          <h2 className="text-xl font-semibold">Authorized Party 1 (defined as)</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="authorizedParty1Name">Name:</Label>
              <Input id="authorizedParty1Name" value={formData.authorizedParty1Name || ""} readOnly className="bg-gray-200" />
            </div>
            <div>
              <Label htmlFor="authorizedParty1Phone">Ph:</Label>
              <Input id="authorizedParty1Phone" value={formData.authorizedParty1Phone || ""} readOnly className="bg-gray-200" />
            </div>
            <div>
              <Label htmlFor="authorizedParty1Email">Em:</Label>
              <Input id="authorizedParty1Email" value={formData.authorizedParty1Email || ""} readOnly className="bg-gray-200" />
            </div>
          </div>
          <div>
            <Label htmlFor="authorizedParty1Address">Address:</Label>
            <Input id="authorizedParty1Address" value={formData.authorizedParty1Address || ""} readOnly className="bg-gray-200" />
          </div>
        </div>

        <div className="border p-4 rounded-md space-y-3">
          <h2 className="text-xl font-semibold">Authorized Party 2 (defined as)</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="authorizedParty2Name">Name:</Label>
              <Input id="authorizedParty2Name" value={formData.authorizedParty2Name || ""} onChange={(e) => handleInputChange("authorizedParty2Name", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="authorizedParty2Phone">Ph:</Label>
              <Input id="authorizedParty2Phone" value={formData.authorizedParty2Phone || ""} onChange={(e) => handleInputChange("authorizedParty2Phone", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="authorizedParty2Email">Em:</Label>
              <Input id="authorizedParty2Email" value={formData.authorizedParty2Email || ""} onChange={(e) => handleInputChange("authorizedParty2Email", e.target.value)} />
            </div>
          </div>
          <div>
            <Label htmlFor="authorizedParty2Address">Address:</Label>
            <Input id="authorizedParty2Address" value={formData.authorizedParty2Address || ""} onChange={(e) => handleInputChange("authorizedParty2Address", e.target.value)} />
          </div>
        </div>

        <div className="border p-4 rounded-md space-y-3">
          <h2 className="text-xl font-semibold">Mortgage Company (as defined as)</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="mortgageCompanyName">Name:</Label>
              <Input id="mortgageCompanyName" value={formData.mortgageCompanyName || ""} onChange={(e) => handleInputChange("mortgageCompanyName", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="loanAccountNumber">Loan Account #:</Label>
              <Input id="loanAccountNumber" value={formData.loanAccountNumber || ""} onChange={(e) => handleInputChange("loanAccountNumber", e.target.value)} />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Checkbox id="helocYes" checked={formData.helocYes || false} onCheckedChange={(checked) => { handleInputChange("helocYes", checked); if (checked) handleInputChange("helocNo", false); }} />
              <Label htmlFor="helocYes">Is this a Home Equity Line of Credit (HELOC) loan? Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="helocNo" checked={formData.helocNo === undefined ? true : formData.helocNo} onCheckedChange={(checked) => { handleInputChange("helocNo", checked); if (checked) handleInputChange("helocYes", false); }} />
              <Label htmlFor="helocNo">No</Label>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Checkbox id="reverseMortgageYes" checked={formData.reverseMortgageYes || false} onCheckedChange={(checked) => { handleInputChange("reverseMortgageYes", checked); if (checked) handleInputChange("reverseMortgageNo", false); }} />
              <Label htmlFor="reverseMortgageYes">Is this a reverse mortgage? Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="reverseMortgageNo" checked={formData.reverseMortgageNo === undefined ? true : formData.reverseMortgageNo} onCheckedChange={(checked) => { handleInputChange("reverseMortgageNo", checked); if (checked) handleInputChange("reverseMortgageYes", false); }} />
              <Label htmlFor="reverseMortgageNo">No</Label>
            </div>
          </div>
        </div>

        <div className="border p-4 rounded-md space-y-3">
          <h2 className="text-xl font-semibold">Insurance Company (as defined as)</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="insuranceCompanyName">Name:</Label>
              <Input id="insuranceCompanyName" value={formData.insuranceCompanyName || ""} onChange={(e) => handleInputChange("insuranceCompanyName", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="claimNumber">Claim #:</Label>
              <Input id="claimNumber" value={formData.claimNumber || ""} onChange={(e) => handleInputChange("claimNumber", e.target.value)} />
            </div>
          </div>
        </div>

        <div className="border p-4 rounded-md space-y-3">
          <h2 className="text-xl font-semibold">Authorization Details</h2>
          <p>
            The above Homeowner/Borrower hereby authorizes the above defined Mortgage Company to release any and all information requested by the above defined Authorized Party 1 and/or Authorized Party 2, regarding the above loan account number. Information to be released may include, but is not limited to the following:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-4">
            <li>Payment information, history, and breakdown (principal, interest, taxes, insurance)</li>
            <li>Loan balances, terms, and modification details</li>
            <li>Escrow account information including disbursements and shortages</li>
            <li>Insurance policy details and loss draft information</li>
            <li>Property inspection reports and valuation data</li>
          </ul>
          <p>
            Furthermore, the Homeowner/Borrower authorizes the Mortgage Company to endorse and release any insurance claim funds related to the property address directly to Authorized Party 1 (In-Vision Construction LLC) or jointly to the Homeowner/Borrower and Authorized Party 1.
          </p>
          <p>
            This authorization shall remain in full force and effect until revoked in writing by the Homeowner/Borrower. A photocopy or facsimile of this authorization shall be considered as effective and valid as the original.
          </p>
        </div>

        <div className="border p-4 rounded-md space-y-6">
          <h2 className="text-xl font-semibold">Signatures</h2>
          <div>
            <h3 className="font-medium mb-1">Primary Homeowner:</h3>
            <div className="grid md:grid-cols-3 gap-4 items-end">
              <div className="md:col-span-2">
                <Label htmlFor="primarySignatureField">Signature:</Label>
                <div
                  id="primarySignatureField"
                  className="mt-1 border rounded-md min-h-[100px] flex items-center justify-center cursor-pointer bg-gray-100 hover:bg-gray-200 transition-colors"
                  onClick={applyPrimarySignature}
                >
                  {formData.primarySignature ? (
                    <img
                      src={formData.primarySignature}
                      alt="Primary Signature"
                      className="max-h-24 object-contain p-1"
                    />
                  ) : (
                    <span className="text-gray-500">Click to Sign with Adopted Signature</span>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="primarySignatureDate">Date:</Label>
                <Input id="primarySignatureDate" value={formData.primarySignatureDate || ""} readOnly className="mt-1 bg-gray-100" />
              </div>
            </div>
            <div className="mt-2">
              <Label htmlFor="primaryPrintedName">Printed Name:</Label>
              <Input id="primaryPrintedName" value={formData.primaryPrintedName || ""} onChange={(e) => handleInputChange("primaryPrintedName", e.target.value)} />
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-1">Co-Homeowner/Spouse (if applicable):</h3>
            <div className="grid md:grid-cols-3 gap-4 items-end">
              <div className="md:col-span-2">
                <Label htmlFor="coSignatureField">Signature:</Label>
                <div
                  id="coSignatureField"
                  className="mt-1 border rounded-md min-h-[100px] flex items-center justify-center cursor-pointer bg-gray-100 hover:bg-gray-200 transition-colors"
                  onClick={applyCoSignature}
                >
                  {formData.coSignature ? (
                    <img
                      src={formData.coSignature}
                      alt="Co-Homeowner Signature"
                      className="max-h-24 object-contain p-1"
                    />
                  ) : (
                    <span className="text-gray-500">Click to Sign with Adopted Signature</span>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="coSignatureDate">Date:</Label>
                <Input id="coSignatureDate" value={formData.coSignatureDate || ""} readOnly className="mt-1 bg-gray-100" />
              </div>
            </div>
            <div className="mt-2">
              <Label htmlFor="coPrintedName">Printed Name:</Label>
              <Input id="coPrintedName" value={formData.coPrintedName || ""} onChange={(e) => handleInputChange("coPrintedName", e.target.value)} />
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-600 mt-4">
          By signing this form, you acknowledge that you have read, understood, and agree to the terms of this Third Party Authorization. You confirm that you are an authorized signatory for the property and loan account listed.
        </p>
      </div>
    </div>
  )
}

ThirdPartyAuthorization.displayName = "ThirdPartyAuthorization"
