import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function GET(request: Request) {
  // Check authentication
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Get search query
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')

  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
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
        ],
      },
      take: 10, // Limit results
      orderBy: {
        updatedAt: 'desc'
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
        insuranceAdjusterName: true,
        insuranceAdjusterPhone: true,
        insuranceAdjusterEmail: true,
      }
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