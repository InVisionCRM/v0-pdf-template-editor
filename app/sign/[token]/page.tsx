import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import SignatureView from "@/components/signature-view";

export const dynamic = "force-dynamic";

async function getSignatureRequest(token: string) {
  const signatureRequest = await db.signatureRequest.findFirst({
    where: {
      token,
      status: {
        not: "SIGNED"
      },
      expiresAt: {
        gt: new Date()
      }
    }
  });

  if (!signatureRequest) {
    return null;
  }

  // Update viewedAt if not already set
  if (!signatureRequest.viewedAt) {
    await db.signatureRequest.update({
      where: { id: signatureRequest.id },
      data: { 
        viewedAt: new Date(),
        status: "VIEWED"
      }
    });
  }

  return signatureRequest;
}

export default async function SignPage({ params }: { params: { token: string } }) {
  const signatureRequest = await getSignatureRequest(params.token);

  if (!signatureRequest) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-semibold mb-6">Document Signing</h1>
          <SignatureView signatureRequest={signatureRequest} />
        </div>
      </div>
    </main>
  );
} 