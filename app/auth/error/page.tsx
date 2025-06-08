"use client"

import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { Suspense } from "react"

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "Configuration":
        return "There is a problem with the server configuration."
      case "AccessDenied":
        return "You do not have permission to sign in."
      case "Verification":
        return "The verification link was invalid or has expired."
      default:
        return "An error occurred during authentication."
    }
  }

  return (
    <div className="max-w-md w-full mx-auto p-8">
      {/* Logo and Title */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <Image
            src="https://ehjgnin9yr7pmzsk.public.blob.vercel-storage.com/in-vision-logo-UJNZxvzrwPs8WsZrFbI7Z86L8TWcc5.png"
            alt="Logo"
            width={120}
            height={60}
            className="w-30 h-15"
          />
        </div>
        <h1 className="text-2xl font-bold text-red-500 mb-2">Authentication Error</h1>
        <p className="text-gray-400 mb-8">{getErrorMessage(error)}</p>
      </div>

      {/* Back to Sign In Button */}
      <Link href="/auth/signin">
        <Button className="w-full bg-[#D2EC43] hover:bg-[#bfd43c] text-black">
          Back to Sign In
        </Button>
      </Link>
    </div>
  )
}

export default function AuthError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <Suspense fallback={
        <div className="max-w-md w-full mx-auto p-8 text-center">
          <div className="animate-pulse">
            <div className="h-16 w-32 bg-gray-700 rounded mx-auto mb-4"></div>
            <div className="h-8 w-64 bg-gray-700 rounded mx-auto mb-4"></div>
            <div className="h-4 w-48 bg-gray-700 rounded mx-auto mb-8"></div>
            <div className="h-12 w-full bg-gray-700 rounded"></div>
          </div>
        </div>
      }>
        <ErrorContent />
      </Suspense>
    </div>
  )
} 