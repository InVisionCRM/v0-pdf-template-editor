"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function SignIn() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
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
          <h1 className="text-2xl font-bold text-[#D2EC43] mb-2">In-Vision Construction</h1>
          <p className="text-gray-400">Sign in to access your contracts</p>
        </div>

        {/* Sign In Button */}
        <div className="space-y-4">
          <Button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="w-full bg-white hover:bg-gray-100 text-black flex items-center justify-center gap-3 py-6"
          >
            <Image
              src="https://authjs.dev/img/providers/google.svg"
              alt="Google"
              width={20}
              height={20}
            />
            Sign in with Google
          </Button>
        </div>

        {/* Footer Text */}
        <p className="mt-8 text-center text-sm text-gray-500">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
} 