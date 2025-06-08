"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { GlobeComponent } from "@/components/GlobeComponent"
import { useState } from "react"
import { Loader2 } from "lucide-react"

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = async () => {
    try {
      setIsLoading(true)
      await signIn("google", { 
        callbackUrl: "/",
        redirect: true
      })
    } catch (error) {
      console.error("Sign in error:", error)
    }
  }

  return (
    <main className="relative min-h-screen bg-black">
      {/* Background Globe */}
      <GlobeComponent className="fixed inset-0 opacity-10 z-0" />

      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="max-w-md w-full mx-auto p-8">
          {/* Logo and Title */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <Image
                src="https://ehjgnin9yr7pmzsk.public.blob.vercel-storage.com/in-vision-logo-UJNZxvzrwPs8WsZrFbI7Z86L8TWcc5.png"
                alt="Logo"
                width={160}
                height={80}
                className="w-40 h-20"
                priority
              />
            </div>
            <h1 className="text-3xl font-bold text-[#D2EC43] mb-3">In-Vision Construction</h1>
            <p className="text-gray-400 text-lg">Sign in to access your contracts</p>
          </div>

          {/* Sign In Button */}
          <div className="space-y-6">
            <Button
              onClick={handleSignIn}
              disabled={isLoading}
              className="w-full bg-[#D2EC43] hover:bg-[#bfd43c] text-black flex items-center justify-center gap-3 py-7 text-lg font-medium relative overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(210,236,67,0.3)]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <Image
                    src="https://authjs.dev/img/providers/google.svg"
                    alt="Google"
                    width={24}
                    height={24}
                  />
                  <span>Sign in with Google</span>
                </>
              )}
            </Button>
          </div>

          {/* Footer Text */}
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500">
              By signing in, you agree to our{" "}
              <a href="#" className="text-[#D2EC43] hover:underline">Terms of Service</a>
              {" "}and{" "}
              <a href="#" className="text-[#D2EC43] hover:underline">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
} 