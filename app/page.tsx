"use client"

import { useState } from "react"
import { LeadSearch } from "@/components/LeadSearch"
import type { Lead } from "@/types/lead"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import RandomTip from "@/components/random-tip-direct"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { ContractLoader } from "@/components/ContractLoader"
import { GlobeComponent } from "@/components/GlobeComponent"

export default function Home() {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { data: session } = useSession()

  const handleLeadSelect = (lead: Lead) => setSelectedLead(lead)

  const navigateToContract = async (href: string) => {
    if (selectedLead) {
      setIsLoading(true)
      localStorage.setItem("selectedLead", JSON.stringify(selectedLead))
      await new Promise((r) => setTimeout(r, 7000))
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

      {/* Avatar Dropdown */}
      <div className="fixed top-10 right-10 z-50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-10 w-10 cursor-pointer ring-2 ring-[#F1F20E] hover:ring-4 transition-all">
              <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
              <AvatarFallback className="bg-black text-[#F1F20E] font-semibold">
                {session?.user?.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-black border border-[#F1F20E]">
            <DropdownMenuLabel className="border-b border-[#F1F20E]/20">
              <p className="text-sm font-medium text-white">{session?.user?.name}</p>
              <p className="text-xs text-[#F1F20E]">{session?.user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#F1F20E]/20" />
            <DropdownMenuItem
              onClick={() => signOut()}
              className="text-white hover:bg-[#F1F20E]/20"
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Logo */}
      <div className="fixed left-8 top-8 z-50">
        <Image
          src="https://ehjgnin9yr7pmzsk.public.blob.vercel-storage.com/in-vision-logo-UJNZxvzrwPs8WsZrFbI7Z86L8TWcc5.png"
          alt="In-Vision Construction Logo"
          width={150}
          height={150}
          className="w-[100px] sm:w-[120px] md:w-[150px] lg:w-[180px] h-auto transform hover:scale-105 transition duration-200"
          priority
        />
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold mt-2 text-[#F1F20E]">
          In-Vision Construction
        </h1>
        <p className="text-sm sm:text-base text-gray-500">Contracts</p>
      </div>

      {/* Contracts + Lead Search */}
      <div className="fixed left-1/2 -translate-x-1/2 top-[200px] z-40 flex flex-col items-center gap-4 w-full px-4 max-w-7xl">
        {/* Buttons */}
        <div className="grid grid-cols-4 gap-4 w-full">
          {[
            { label: "Scope of Work", path: "/scope-of-work" },
            { label: "General Contract", path: "/general-contract" },
            { label: "3rd Party Auth", path: "/third-party-authorization" },
            { label: "Warranty Contract", path: "/warranty-contract" },
          ].map((btn) => (
            <Card key={btn.path} className="bg-transparent border-none shadow-none">
              <CardContent className="p-2 h-24">
                <Button
                  className="w-full h-full btn-gradient flex items-center justify-center px-4 whitespace-normal text-black hover:scale-105"
                  onClick={() => navigateToContract(btn.path)}
                >
                  {btn.label}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Lead Search */}
        <div className="w-full max-w-lg bg-black bg-opacity-25 border border-[#F1F20E]/25 rounded-lg p-4">
          <h2 className="text-sm font-semibold text-[#F1F20E] mb-2">Search Lead:</h2>
          <LeadSearch onLeadSelect={handleLeadSelect} selectedLead={selectedLead} />

          {/* Selected Lead Info */}
          {selectedLead && (
            <div className="mt-4 bg-black bg-opacity-50 border border-[#F1F20E]/25 rounded-lg p-3">
              <div className="flex justify-between">
                <div>
                  <p className="text-[#F1F20E] font-semibold">Name: <span className="text-white">{selectedLead.firstName} {selectedLead.lastName}</span></p>
                  <p className="text-[#F1F20E] font-semibold">Phone: <span className="text-white">{selectedLead.phone || "N/A"}</span></p>
                  <p className="text-[#F1F20E] font-semibold">Email: <span className="text-white">{selectedLead.email || "N/A"}</span></p>
                  <p className="text-[#F1F20E] font-semibold">Address: <span className="text-white">{selectedLead.address || "N/A"}</span></p>
                </div>
                <Button
                  variant="ghost"
                  className="h-6 px-2 text-[#F1F20E] hover:bg-[#F1F20E]/10"
                  onClick={() => setSelectedLead(null)}
                >
                  ✕
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Random Tip at Bottom */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4">
        <RandomTip />
      </div>
    </main>
  )
}
