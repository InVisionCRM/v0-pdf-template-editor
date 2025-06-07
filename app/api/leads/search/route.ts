import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/db/prisma"

export async function GET(request: Request) {
  // Check authentication
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.toLowerCase()

  if (!query) {
    return NextResponse.json([])
  }

  try {
    // Search leads using Prisma
    const leads = await prisma.lead.findMany({
      where: {
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { phone: { contains: query, mode: 'insensitive' } },
          { address: { contains: query, mode: 'insensitive' } },
          { insuranceCompany: { contains: query, mode: 'insensitive' } },
          { insurancePolicyNumber: { contains: query, mode: 'insensitive' } },
          { claimNumber: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        address: true,
        insuranceCompany: true,
        insurancePolicyNumber: true,
        claimNumber: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 10 // Limit results to 10 most recent matches
    })

    return NextResponse.json(leads)
  } catch (error) {
    console.error('Lead search error:', error)
    return NextResponse.json(
      { error: "Failed to search leads" },
      { status: 500 }
    )
  }
} 