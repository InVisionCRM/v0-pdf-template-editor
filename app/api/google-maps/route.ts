import { NextResponse } from "next/server"

export async function GET() {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "Google Maps API key is not configured" }, { status: 500 })
    }

    // Return the URL with the API key
    return NextResponse.json({
      url: `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`,
    })
  } catch (error) {
    console.error("Error in Google Maps API route:", error)
    return NextResponse.json({ error: "Failed to process Google Maps API request" }, { status: 500 })
  }
}
