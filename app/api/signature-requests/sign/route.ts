import { db } from "@/lib/db";
import { SignatureRequestStatus } from "@prisma/client";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { token, signature, ipAddress } = await req.json();

    // Find the signature request
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
      return new Response("Invalid or expired signature request", { status: 400 });
    }

    // Create signed contract record
    const signedContract = await db.signedContract.create({
      data: {
        signatureRequestId: signatureRequest.id,
        leadId: signatureRequest.leadId,
        contractType: signatureRequest.contractType,
        contractData: {
          ...signatureRequest.contractData,
          signature,
          signedAt: new Date().toISOString(),
          ipAddress
        },
        signedAt: new Date(),
        ipAddress
      }
    });

    // Update signature request status
    await db.signatureRequest.update({
      where: { id: signatureRequest.id },
      data: {
        status: SignatureRequestStatus.SIGNED,
        signedAt: new Date()
      }
    });

    // Send confirmation email to the lead
    await resend.emails.send({
      from: "Your Company <documents@yourdomain.com>",
      to: signedContract.customerEmail || "",
      subject: "Document Signed Successfully",
      html: `
        <h1>Document Signed Successfully</h1>
        <p>Thank you for signing the document. This email confirms that the document has been signed successfully.</p>
        <p>Document Details:</p>
        <ul>
          <li>Document Type: ${signatureRequest.contractType}</li>
          <li>Signed Date: ${new Date().toLocaleDateString()}</li>
        </ul>
        <p>A copy of the signed document will be sent to you shortly.</p>
      `,
    });

    return Response.json({ success: true, signedContract });
  } catch (error) {
    console.error("Error processing signature:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
} 