"use client"

import { useState } from "react"
import { LeadSearch } from "@/components/LeadSearch"
import type { Lead } from "@/types/lead"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import ParticleBackground from "@/components/particle-background"
import RandomTip from "@/components/random-tip-direct"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ContractLoader } from "@/components/ContractLoader"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOut } from "next-auth/react"
import { GlobeComponent } from "@/components/GlobeComponent"

export default function Home() {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { data: session } = useSession()

  const handleLeadSelect = (lead: Lead) => {
    setSelectedLead(lead)
  }

  const navigateToContract = async (href: string) => {
    if (selectedLead) {
      setIsLoading(true)
      localStorage.setItem("selectedLead", JSON.stringify(selectedLead))
      
      // Simulate some loading time for the animation
      await new Promise(resolve => setTimeout(resolve, 7000)) // 1s per state * 7 states
      
      setIsLoading(false)
      router.push(href)
    } else {
      router.push(href)
    }
  }

  return (
    <main className="min-h-screen bg-black overflow-hidden">
      <GlobeComponent />

      <ContractLoader loading={isLoading} onClose={() => setIsLoading(false)} />

      {/* User Avatar */}
      <div className="fixed top-10 right-10 z-50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-10 w-10 cursor-pointer ring-2 ring-[#32CD32] hover:ring-4 transition-all">
              <AvatarImage src={session?.user?.image || ''} alt={session?.user?.name || ''} />
              <AvatarFallback className="bg-black text-[#32CD32] font-semibold">
                {session?.user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-black border border-[#32CD32]">
            <DropdownMenuLabel className="border-b border-[#32CD32]/20">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-white">{session?.user?.name}</p>
                <p className="text-xs leading-none text-[#32CD32]">{session?.user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#32CD32]/20" />
            <DropdownMenuItem 
              onClick={() => signOut()}
              className="text-white hover:text-white hover:bg-[#32CD32]/20 cursor-pointer"
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Logo and Content Container */}
      <div className="fixed left-8 top-8 z-50">
        <div className="relative">
          <Image
            src="https://ehjgnin9yr7pmzsk.public.blob.vercel-storage.com/in-vision-logo-UJNZxvzrwPs8WsZrFbI7Z86L8TWcc5.png"
            alt="In-Vision Construction Logo"
            width={150}
            height={150}
            className="w-[100px] sm:w-[120px] md:w-[150px] lg:w-[180px] h-auto transform hover:scale-105 transition-transform duration-200"
            priority
          />
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold mt-2 text-[#32CD32]">In-Vision Construction</h1>
          <p className="text-sm sm:text-base text-gray-500">Contracts</p>
        </div>
      </div>

      {/* Main Content Container - Adjusted to account for logo */}
      <div className="w-full fixed left-1/2 -translate-x-1/2 top-[200px] sm:top-[220px] md:top-[250px] z-50">
        <div className="max-w-7xl w-full mx-auto px-4">
          {/* Tips Section */}
          <div className="mb-8">
            <RandomTip />
          </div>

          {/* Lead Search Section */}
          <div className="mb-2 bg-black bg-opacity-25 py-2 px-4 rounded-lg border border-[#32CD32] border-opacity-25 max-w-lg mx-auto">
            <h2 className="text-sm font-semibold text-[#32CD32] inline-block mr-2">Search Lead:</h2>
            <LeadSearch onLeadSelect={handleLeadSelect} selectedLead={selectedLead} />
          </div>

          {/* Selected Lead Info */}
          {selectedLead && (
            <div className="mb-2 bg-black bg-opacity-50 py-3 px-4 rounded-lg border border-[#32CD32] border-opacity-25 max-w-lg mx-auto">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center">
                    <span className="font-semibold text-[#32CD32] mr-2">Name:</span>
                    <span className="text-white">{selectedLead.firstName} {selectedLead.lastName}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-semibold text-[#32CD32] mr-2">Phone:</span>
                    <span className="text-white">{selectedLead.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-semibold text-[#32CD32] mr-2">Email:</span>
                    <span className="text-white">{selectedLead.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-semibold text-[#32CD32] mr-2">Address:</span>
                    <span className="text-white">{selectedLead.address || 'N/A'}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  className="h-6 px-2 text-[#32CD32] hover:text-[#228B22] hover:bg-[#32CD32]/10 ml-2"
                  onClick={() => setSelectedLead(null)}
                >
                  ✕
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contract Buttons Container - Fixed from bottom */}
      <div className="w-full fixed left-1/2 -translate-x-1/2 bottom-[200px] z-40">
        <div className="max-w-7xl w-full mx-auto px-4">
          {/* Contract Types Grid */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="bg-transparent border-none shadow-none">
              <CardContent className="p-2">
                <Button
                  className="w-full btn-gradient py-6 px-4 text-md whitespace-normal h-auto hover:scale-105"
                  onClick={() => navigateToContract("/scope-of-work")}
                >
                  Scope of Work
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-transparent border-none shadow-none">
              <CardContent className="p-2">
                <Button
                  className="w-full btn-gradient py-6 px-4 text-md whitespace-normal h-auto hover:scale-105"
                  onClick={() => navigateToContract("/general-contract")}
                >
                  General Contract
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-transparent border-none shadow-none">
              <CardContent className="p-2">
                <Button
                  className="w-full btn-gradient py-6 px-4 text-md whitespace-normal h-auto hover:scale-105"
                  onClick={() => navigateToContract("/third-party-authorization")}
                >
                  3rd Party Auth
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-transparent border-none shadow-none">
              <CardContent className="p-2">
                <Button
                  className="w-full btn-gradient py-6 px-4 text-md whitespace-normal h-auto hover:scale-105"
                  onClick={() => navigateToContract("/warranty-contract")}
                >
                  Warranty Contract
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}

