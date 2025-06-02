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
import Image from "next/image"

export default function WarrantyContract() {
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
      projectAddress: "",
      dateOfCompletion: "",
      authorizedRepresentativeSignatureDate: formatDate(),
    }
  })

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const contractRef = useRef<HTMLDivElement>(null)

  // Store master signature and initials
  const [masterSignature, setMasterSignature] = useState<string>("")
  const [masterInitials, setMasterInitials] = useState<string>("") // Although not used in this specific contract, keeping for consistency
  const [hasSetupSignature, setHasSetupSignature] = useState(false)

  // Set the current date when component mounts
  useEffect(() => {
    const currentDate = formatDate()
    setFormData((prev) => ({
      ...prev,
      date: currentDate, // This is for the "Authorized Representative Date"
      agreesDate: currentDate, // Not used directly in form text, but good for consistency
      authorizedRepresentativeSignatureDate: currentDate,
    }))
  }, [])

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSignatureSetup = (signature: string) => {
    setMasterSignature(signature)
     if (signature && masterInitials) { // Check masterInitials even if not directly used in this contract
      setHasSetupSignature(true)
    }
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

  // applyInitials is kept for consistency, though not used in this warranty
  const applyInitials = (field: string) => {
    if (masterInitials) {
      handleInputChange(field, masterInitials)
    }
  }

  const handleGeneratePdf = async () => {
    console.log("[PDF_GEN] Starting PDF generation...");
    try {
      setIsGeneratingPdf(true);

      if (!contractRef.current) {
        console.error("[PDF_GEN_ERR] contractRef.current is null. Aborting.");
        alert("Error generating PDF: Contract content not found.");
        setIsGeneratingPdf(false);
        return;
      }
      console.log("[PDF_GEN] contractRef.current is available.");

      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");
      console.log("[PDF_GEN] html2canvas and jspdf dynamically imported.");

      const fixedContainer = document.createElement("div");
      fixedContainer.style.position = "absolute";
      fixedContainer.style.left = "-9999px";
      fixedContainer.style.width = "1024px";
      fixedContainer.style.overflow = "visible";
      document.body.appendChild(fixedContainer);
      console.log("[PDF_GEN] fixedContainer created and appended to body.");

      const clone = contractRef.current.cloneNode(true) as HTMLElement;
      // Remove signature setup card from clone
      const signatureSetupCard = clone.querySelector(".signature-setup-card");
      if (signatureSetupCard) signatureSetupCard.remove();
      // Remove buttons from clone
      const buttonsToHide = clone.querySelectorAll('button');
      buttonsToHide.forEach(button => { (button as HTMLElement).style.display = 'none'; });
      // Remove Link component if it's directly inside contractRef and meant for navigation
      const navLink = clone.querySelector('a[href="/"]');
      if (navLink && navLink.parentElement === clone) navLink.remove();

      // ADD PADDING TO THE CLONE FOR PDF GENERATION
      clone.style.paddingBottom = "50px";

      fixedContainer.appendChild(clone);
      console.log("[PDF_GEN] Contract content cloned and appended to fixedContainer.");

      const firstChildInFixed = fixedContainer.firstChild as HTMLElement | null;
      if (!firstChildInFixed) {
        console.error("[PDF_GEN_ERR] fixedContainer has no firstChild. Aborting.");
        alert("Error generating PDF: Cloned content is missing.");
        document.body.removeChild(fixedContainer); // Clean up before aborting
        setIsGeneratingPdf(false);
        return;
      }
      console.log("[PDF_GEN] firstChildInFixed is available.");

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const margin = { top: 20, bottom: 20, left: 15, right: 15 };
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const contentWidth = pageWidth - margin.left - margin.right;
      const estimatedManualHeightMm = 25; 
      const maxAllowedCanvasHeightMm = pageHeight - margin.top - margin.bottom - estimatedManualHeightMm;

      const currentPaddingBottom = parseInt(firstChildInFixed.style.paddingBottom || "0", 10);
      const canvasCaptureHeight = Math.max(firstChildInFixed.scrollHeight, firstChildInFixed.offsetHeight) + currentPaddingBottom;
      console.log(`[PDF_GEN] Calculated canvasCaptureHeight: ${canvasCaptureHeight}px`);

      const html2canvasOptions = {
        scale: 2,
        useCORS: true,
        logging: false, // Set to true for more html2canvas internal logs if needed during prod debug
        backgroundColor: "#ffffff",
        allowTaint: true,
        height: canvasCaptureHeight,
        onclone: (clonedDoc: Document) => {
            console.log("[PDF_GEN] html2canvas onclone started.");
            clonedDoc.body.style.transform = 'translateZ(0)';
            clonedDoc.querySelectorAll('*').forEach(el => {
              if (el instanceof HTMLElement) el.style.textDecoration = 'none';
            });

            clonedDoc.querySelectorAll('input[type="text"], input[type="date"]').forEach((node) => {
              const input = node as HTMLInputElement;
              if (input.id === 'authorizedRepresentativeSignatureDate') return;
              const inputValue = input.value;
              const parent = input.parentNode as HTMLElement | null; // Type assertion
              if (parent) {
                const span = clonedDoc.createElement('span');
                span.textContent = inputValue;
                const computedStyle = window.getComputedStyle(input);
                span.style.fontFamily = computedStyle.fontFamily;
                span.style.fontSize = computedStyle.fontSize;
                span.style.fontWeight = computedStyle.fontWeight;
                span.style.color = (computedStyle.color && computedStyle.color !== 'rgba(0, 0, 0, 0)' && computedStyle.color !== 'transparent') ? computedStyle.color : '#000000';
                span.style.lineHeight = computedStyle.lineHeight;
                span.style.setProperty('display', 'inline-block', 'important');
                if (input.id) span.id = input.id + '-span';
                parent.replaceChild(span, input);
              }
            });
            
            let authRepLabel: HTMLLabelElement | null = null;
            const labels = clonedDoc.querySelectorAll('label');
            for (let i = 0; i < labels.length; i++) {
                const currentLabel = labels[i] as HTMLLabelElement;
                if (currentLabel.htmlFor === 'authorizedRepresentativeSignature') {
                    authRepLabel = currentLabel;
                    break;
                }
            }

            if (authRepLabel) {
                const currentAuthRepLabel: HTMLLabelElement = authRepLabel; // Ensure non-null for type checker
                const signatureContainerDiv = currentAuthRepLabel.parentElement as HTMLElement | null;
                if (signatureContainerDiv && signatureContainerDiv.parentElement) {
                    const gridParentDivToRemove = signatureContainerDiv.parentElement as HTMLElement;
                    if (gridParentDivToRemove.classList.contains('grid')) {
                         gridParentDivToRemove.remove();
                    }
                }
            }
            const hiddenSigInput = clonedDoc.getElementById('authorizedRepresentativeSignatureField');
            if (hiddenSigInput && hiddenSigInput.parentElement) {
                const parentOfHidden = hiddenSigInput.parentElement as HTMLElement | null;
                if (parentOfHidden && parentOfHidden.classList.contains('grid')) parentOfHidden.remove();
                else if (parentOfHidden && parentOfHidden.parentElement && (parentOfHidden.parentElement as HTMLElement).classList.contains('grid')) (parentOfHidden.parentElement as HTMLElement).remove();
            }
            console.log("[PDF_GEN] html2canvas onclone finished.");
          }
      };
      console.log("[PDF_GEN] html2canvasOptions prepared. Calling html2canvas...");
      const canvas = await html2canvas(firstChildInFixed, html2canvasOptions);
      console.log("[PDF_GEN] html2canvas processing finished.");

      document.body.removeChild(fixedContainer); 
      console.log("[PDF_GEN] fixedContainer removed from body.");

      const imgOriginalWidthPx = canvas.width;
      const imgOriginalHeightPx = canvas.height;
      const pdfImageFitToWidthMm = contentWidth;
      const projectedHeightMm = (imgOriginalHeightPx * pdfImageFitToWidthMm) / imgOriginalWidthPx;

      let finalPdfImageWidthMm = pdfImageFitToWidthMm;
      let finalPdfImageHeightMm = projectedHeightMm;
      let xPositionCanvas = margin.left;

      if (projectedHeightMm > maxAllowedCanvasHeightMm) {
        finalPdfImageHeightMm = maxAllowedCanvasHeightMm;
        finalPdfImageWidthMm = (imgOriginalWidthPx * finalPdfImageHeightMm) / imgOriginalHeightPx;
        if (finalPdfImageWidthMm < contentWidth) {
          xPositionCanvas = margin.left + (contentWidth - finalPdfImageWidthMm) / 2;
        }
      }
      console.log("[PDF_GEN] Image dimensions for PDF calculated.");

      doc.addImage(canvas.toDataURL("image/png"), "PNG", xPositionCanvas, margin.top, finalPdfImageWidthMm, finalPdfImageHeightMm);
      console.log("[PDF_GEN] Main contract image added to PDF.");

      // --- MANUALLY ADD SIGNATURE AND DATE --- 
      const yManualStart = margin.top + finalPdfImageHeightMm + 8; 
      const sigHeightMm = 12;
      const sigWidthMm = 40;
      const labelFontSize = 10; 
      const textSpacingMm = 4; 

      doc.setFontSize(labelFontSize);
      doc.setTextColor(0, 0, 0); 

      const col1X = margin.left;
      const col2X = margin.left + (contentWidth / 2) + 5; 

      doc.text("Authorized Representative:", col1X, yManualStart);
      if (formData.authorizedRepresentativeSignature && typeof formData.authorizedRepresentativeSignature === 'string' && formData.authorizedRepresentativeSignature.startsWith('data:image/png;base64')) {
        doc.addImage(formData.authorizedRepresentativeSignature, 'PNG', col1X, yManualStart + textSpacingMm, sigWidthMm, sigHeightMm);
      } else {
        const lineY = yManualStart + textSpacingMm + (sigHeightMm / 2); 
        doc.setDrawColor(100, 100, 100); 
        doc.line(col1X, lineY, col1X + sigWidthMm, lineY);
      }

      doc.text("Date:", col2X, yManualStart);
      doc.text(formData.authorizedRepresentativeSignatureDate || "_________________", col2X, yManualStart + textSpacingMm);
      console.log("[PDF_GEN] Manual signature and date added to PDF.");
      // --- END OF MANUAL ADDITION --- 

      doc.save("Warranty-Contract.pdf");
      console.log("[PDF_GEN] PDF saved.");
    } catch (error) {
      console.error("[PDF_GEN_ERR] Error during PDF generation:", error);
      alert("Failed to generate PDF. An unexpected error occurred.");
    } finally {
      setIsGeneratingPdf(false);
      // Ensure fixedContainer is removed, even if it was already removed, querySelector will handle null.
      const fc = document.querySelector('div[style*="position: absolute"][style*="left: -9999px"]');
      if (fc) {
        document.body.removeChild(fc);
        console.log("[PDF_GEN] fixedContainer cleaned up in finally block.");
      } else {
        console.log("[PDF_GEN] No fixedContainer found for cleanup in finally block (might have been removed earlier or not added due to error).");
      }
      console.log("[PDF_GEN] PDF generation process ended (finally block).");
    }
  }

  const warrantyText = `IN-VISION CONSTRUCTION
ROOF REPLACEMENT WARRANTY CERTIFICATE
Project Address: ${formData.projectAddress || "___________________________"}
Date of Completion: ${formData.dateOfCompletion || "________________________"}

1. WARRANTY COVERAGE
In-Vision Construction warrants that the roof replacement performed at the above project address will be free from
defects in workmanship and materials for a period of two (2) years from the date of project completion, subject to the
terms and conditions outlined below.

2. WHAT IS COVERED
- Repair or replacement of defective roofing materials.
- Repair of workmanship issues that cause leaks or structural problems.

3. EXCLUSIONS AND LIMITATIONS
This warranty does NOT cover:
- Damage caused by natural disasters, severe weather, or acts of God.
- Damage due to improper maintenance, neglect, or misuse.
- Damage resulting from unrelated structural issues.
- Normal wear and tear.
- Issues caused by building structure or external factors.

4. CUSTOMER RESPONSIBILITIES
- Regular maintenance and inspections.
- Immediate reporting of issues or suspected defects.
- Providing access for inspections and repairs.

5. CLAIM PROCESS
To make a claim under this warranty, the customer must:
- Notify In-Vision Construction in writing within 30 days of discovering a defect.
- Allow access for inspection and repairs.
- Provide proof of the original work and warranty if requested.

6. LIMITATIONS OF LIABILITY
This warranty is limited to the repair or replacement of defective work or materials. In-Vision Construction is not liable for
consequential or incidental damages.

7. TRANSFERABILITY
This warranty is non-transferable and applies only to the original property owner.

This warranty is provided in good faith and is subject to the terms and conditions outlined above.
Authorized Representative: ${formData.authorizedRepresentativeSignature || "______________________"} Date: ${formData.authorizedRepresentativeSignatureDate || "_______________"}`


  return (
    <div className="max-w-4xl mx-auto bg-white p-6 shadow-lg">
      {isGeneratingPdf && <LoadingAnimation message="Assembling your warranty..." />}

      <div className="mb-6 flex justify-between items-center">
        <Link href="/">
          <Button variant="outline">Back to Home</Button>
        </Link>
        <Button onClick={handleGeneratePdf} disabled={isGeneratingPdf} className="flex items-center gap-2">
          <FileIcon className="h-4 w-4" />
          {isGeneratingPdf ? "Generating PDF..." : "Generate PDF"}
        </Button>
      </div>

      {/* Signature Setup Section - kept for consistency though only one signature field in this contract */}
      <Card className="mb-8 signature-setup-card">
        <CardHeader>
          <CardTitle>Setup Your Signature</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="masterSignature">Your Signature (sign once)</Label>
            <SignatureCanvas value={masterSignature} onChange={handleSignatureSetup} />
          </div>
           {/* Initials setup removed as not directly used in this specific warranty text */}
          {hasSetupSignature && masterSignature && (
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>
                Signature ready! Click on the signature field in the warranty to apply.
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <div ref={contractRef} className="space-y-6 prose max-w-none text-xs">
        <div className="text-center mb-4">
          <Image
            src="/placeholder-logo.png"
            alt="In-Vision Construction Logo"
            width={150}
            height={75}
            className="mx-auto h-auto"
          />
        </div>
        <h1 className="text-xl font-bold text-center">IN-VISION CONSTRUCTION</h1>
        <h2 className="text-lg font-semibold text-center">ROOF REPLACEMENT WARRANTY CERTIFICATE</h2>

        <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
                <Label htmlFor="projectAddress">Project Address:</Label>
                <Input
                    id="projectAddress"
                    type="text"
                    value={formData.projectAddress || ""}
                    onChange={(e) => handleInputChange("projectAddress", e.target.value)}
                    className="border-b border-gray-500 focus:border-blue-500 outline-none px-1"
                    placeholder="Enter project address"
                />
            </div>
            <div>
                <Label htmlFor="dateOfCompletion">Date of Completion:</Label>
                <Input
                    id="dateOfCompletion"
                    type="text"
                    value={formData.dateOfCompletion || ""}
                    onChange={(e) => handleInputChange("dateOfCompletion", e.target.value)}
                    className="border-b border-gray-500 focus:border-blue-500 outline-none px-1"
                    placeholder="MM/DD/YYYY"
                />
            </div>
        </div>


        <h3 className="font-semibold mt-4">1. WARRANTY COVERAGE</h3>
        <p>
          In-Vision Construction warrants that the roof replacement performed at the above project address will be free from
          defects in workmanship and materials for a period of two (2) years from the date of project completion, subject to the
          terms and conditions outlined below.
        </p>

        <h3 className="font-semibold mt-4">2. WHAT IS COVERED</h3>
        <ul className="list-disc pl-5">
          <li>Repair or replacement of defective roofing materials.</li>
          <li>Repair of workmanship issues that cause leaks or structural problems.</li>
        </ul>

        <h3 className="font-semibold mt-4">3. EXCLUSIONS AND LIMITATIONS</h3>
        <p>This warranty does NOT cover:</p>
        <ul className="list-disc pl-5">
          <li>Damage caused by natural disasters, severe weather, or acts of God.</li>
          <li>Damage due to improper maintenance, neglect, or misuse.</li>
          <li>Damage resulting from unrelated structural issues.</li>
          <li>Normal wear and tear.</li>
          <li>Issues caused by building structure or external factors.</li>
        </ul>

        <h3 className="font-semibold mt-4">4. CUSTOMER RESPONSIBILITIES</h3>
        <ul className="list-disc pl-5">
          <li>Regular maintenance and inspections.</li>
          <li>Immediate reporting of issues or suspected defects.</li>
          <li>Providing access for inspections and repairs.</li>
        </ul>

        <h3 className="font-semibold mt-4">5. CLAIM PROCESS</h3>
        <p>To make a claim under this warranty, the customer must:</p>
        <ul className="list-disc pl-5">
          <li>Notify In-Vision Construction in writing within 30 days of discovering a defect.</li>
          <li>Allow access for inspection and repairs.</li>
          <li>Provide proof of the original work and warranty if requested.</li>
        </ul>

        <h3 className="font-semibold mt-4">6. LIMITATIONS OF LIABILITY</h3>
        <p>
          This warranty is limited to the repair or replacement of defective work or materials. In-Vision Construction is not liable for
          consequential or incidental damages.
        </p>

        <h3 className="font-semibold mt-4">7. TRANSFERABILITY</h3>
        <p>This warranty is non-transferable and applies only to the original property owner.</p>

        <p className="mt-6">
          This warranty is provided in good faith and is subject to the terms and conditions outlined above.
        </p>

        <div className="grid grid-cols-2 gap-x-8 gap-y-4 mt-8 items-end">
          <div>
            <Label htmlFor="authorizedRepresentativeSignature">Authorized Representative:</Label>
            {formData.authorizedRepresentativeSignature && typeof formData.authorizedRepresentativeSignature === 'string' && formData.authorizedRepresentativeSignature.startsWith('data:image/png;base64') ? (
              <img src={formData.authorizedRepresentativeSignature} alt="Signature" className="border border-gray-300 h-12 w-full object-contain" />
            ) : (
               <div
                onClick={() => applySignature("authorizedRepresentativeSignature")}
                className="border-b border-gray-500 h-12 w-full cursor-pointer flex items-center justify-center text-gray-400"
                role="button"
                tabIndex={0}
                onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') applySignature("authorizedRepresentativeSignature"); }}
              >
                {masterSignature ? (hasSetupSignature ? "Click to apply signature" : "Setup signature first") : "Click to sign"}
              </div>
            )}
             <Input
                id="authorizedRepresentativeSignatureField" // Hidden input for potential internal state, not for PDF rendering
                type="hidden"
                value={formData.authorizedRepresentativeSignature || ""}
             />
          </div>
          <div>
            <Label htmlFor="authorizedRepresentativeSignatureDate">Date:</Label>
            <Input
              id="authorizedRepresentativeSignatureDate"
              type="text"
              value={formData.authorizedRepresentativeSignatureDate || ""}
              onChange={(e) => handleInputChange("authorizedRepresentativeSignatureDate", e.target.value)}
              className="border-b border-gray-500 focus:border-blue-500 outline-none px-1"
              placeholder="MM/DD/YYYY"
            />
          </div>
        </div>
      </div>
    </div>
  )
} 