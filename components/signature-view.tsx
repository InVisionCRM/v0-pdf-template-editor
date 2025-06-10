"use client";

import { useState } from "react";
import { SignatureRequest } from "@prisma/client";
import { Button } from "@/components/ui/button";
import DocumentPreview from "@/components/document-preview";
import SignatureCanvas from "@/components/signature-canvas";
import { useRouter } from "next/navigation";

interface SignatureViewProps {
  signatureRequest: SignatureRequest;
}

export default function SignatureView({ signatureRequest }: SignatureViewProps) {
  const router = useRouter();
  const [signature, setSignature] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSign = async () => {
    if (!signature) {
      setError("Please provide your signature");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/signature-requests/sign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: signatureRequest.token,
          signature,
          ipAddress: await fetch("https://api.ipify.org?format=json")
            .then((res) => res.json())
            .then((data) => data.ip),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to sign document");
      }

      // Redirect to success page
      router.push(`/sign/${signatureRequest.token}/success`);
    } catch (err) {
      setError("An error occurred while signing the document. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Document Preview */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <DocumentPreview
          fields={signatureRequest.contractData.fields}
          formData={signatureRequest.contractData.formData}
        />
      </div>

      {/* Signature Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium">Your Signature</h2>
        <div className="border rounded-lg p-4 bg-white">
          <SignatureCanvas
            value={signature}
            onChange={setSignature}
            allowTypedSignature={true}
          />
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <div className="flex justify-end space-x-4">
          <Button
            variant="outline"
            onClick={() => setSignature("")}
            disabled={isSubmitting}
          >
            Clear
          </Button>
          <Button
            onClick={handleSign}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing..." : "Sign Document"}
          </Button>
        </div>
      </div>
    </div>
  );
} 