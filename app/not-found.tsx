"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import ParticleBackground from "@/components/particle-background"

export default function NotFound() {
  return (
    <main className="min-h-screen p-4 md:p-8 relative">
      <ParticleBackground />
      
      <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center justify-center min-h-[80vh]">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-[#32CD32]">404 - Page Not Found</h1>
          <p className="text-gray-400">The page you're looking for doesn't exist or has been moved.</p>
          
          <div className="mt-8">
            <Link href="/">
              <Button className="bg-[#32CD32] text-black hover:bg-[#32CD32]/90">
                Return Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
} 