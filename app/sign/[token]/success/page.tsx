import { CheckCircle2 } from "lucide-react";

export default function SignatureSuccessPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-lg mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="flex justify-center mb-6">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <h1 className="text-2xl font-semibold mb-4">Document Signed Successfully!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for signing the document. A confirmation email has been sent to your email address.
          </p>
          <p className="text-sm text-gray-500">
            You can now close this window.
          </p>
        </div>
      </div>
    </main>
  );
} 