import { auth } from "@clerk/nextjs";
import { Resend } from "resend";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { SignatureRequestStatus } from "@prisma/client";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { leadId, contractType, contractData, leadEmail } = await req.json();

    // Generate a secure token for the signature request
    const token = nanoid(32);
    
    // Calculate expiry date (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Create signature request in database
    const signatureRequest = await db.signatureRequest.create({
      data: {
        leadId,
        contractType,
        status: SignatureRequestStatus.SENT,
        token,
        expiresAt,
        sentById: userId,
        contractData,
        emailSent: false,
      },
    });

    // Generate the signature URL
    const signatureUrl = `${process.env.NEXT_PUBLIC_APP_URL}/sign/${token}`;

    // Send email using Resend
    await resend.emails.send({
      from: "Your Company <documents@yourdomain.com>",
      to: leadEmail,
      subject: "Document Ready for Signature",
      html: `
        <h1>Document Ready for Your Signature</h1>
        <p>A document has been sent to you for electronic signature.</p>
        <p>Please click the link below to view and sign the document:</p>
        <a href="${signatureUrl}" style="display: inline-block; background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">View and Sign Document</a>
        <p>This link will expire in 30 days.</p>
        <p>If you did not request this document, please ignore this email.</p>
      `,
    });

    // Update signature request to mark email as sent
    await db.signatureRequest.update({
      where: { id: signatureRequest.id },
      data: { emailSent: true },
    });

    return Response.json({ success: true, signatureRequest });
  } catch (error) {
    console.error("Error creating signature request:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
} 