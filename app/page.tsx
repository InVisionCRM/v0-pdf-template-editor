"use client"

import { useState } from "react"
import { LeadSearch } from "@/components/LeadSearch"
import type { Lead } from "@/types/lead"
import { Button } from "@/components/ui/button"
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
import { GlobeComponent } from "@/components/GlobeComponent"
import { ContractLoader } from "@/components/ContractLoader"

export default function Home() {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()

  const navigateTo = async (path: string) => {
    if (selectedLead) {
      setIsLoading(true)
      localStorage.setItem("selectedLead", JSON.stringify(selectedLead))
      await new Promise((r) => setTimeout(r, 7000))
      setIsLoading(false)
    }
    router.push(path)
  }

  return (
    <main className="relative min-h-screen bg-black">
      {/* 1) Background Globe */}
      <GlobeComponent className="fixed inset-0 opacity-10 z-0" />

      {/* 2) Loading Overlay */}
      <ContractLoader loading={isLoading} onClose={() => setIsLoading(false)} />

      {/* — Logo & Avatar (separated) — */}
      <div className="fixed left-1/2 -translate-x-1/2 top-[10px] z-10 container mx-auto px-4 pt-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Image
              src="https://ehjgnin9yr7pmzsk.public.blob.vercel-storage.com/in-vision-logo-UJNZxvzrwPs8WsZrFbI7Z86L8TWcc5.png"
              alt="Logo"
              width={80}
              height={40}
              className="w-20 h-10"
            />
            <div>
              <h1 className="text-base font-bold text-[#D2EC43] leading-tight">
                In-Vision Construction
              </h1>
              <p className="text-xs text-gray-400">Contracts</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-8 w-8 ring-2 ring-[#D2EC43]">
                <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
                <AvatarFallback className="bg-black text-[#D2EC43]">
                  {session?.user?.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 bg-black border border-[#D2EC43]">
              <DropdownMenuLabel className="px-3 py-2 border-b border-[#D2EC43]/30">
                <p className="text-sm text-white">{session?.user?.name}</p>
                <p className="text-xs text-[#D2EC43]">{session?.user?.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#D2EC43]/30" />
              <DropdownMenuItem
                onClick={() => signOut()}
                className="px-3 py-2 text-white hover:bg-[#D2EC43]/20"
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* — Buttons, Search & Lead Info — */}
      <div className="fixed left-1/2 -translate-x-1/2 top-[100px] z-50 container mx-auto px-5">
        {/* — Contract Buttons — */}
        <div className="grid grid-cols-2 gap-2 mb-2">
          {[
            ["Scope of Work", "/scope-of-work"],
            ["General Contract", "/general-contract"],
            ["3rd Party Auth", "/third-party-authorization"],
            ["Warranty Contract", "/warranty-contract"],
          ].map(([label, href]) => (
            <Button
              key={href}
              className="w-full h-10 text-md btn-gradient text-black flex items-center justify-center"
              onClick={() => navigateTo(href)}
            >
              {label}
            </Button>
          ))}
        </div>

        {/* — Search Lead — */}
        <div className="mb-1 px-20 text-center text-xs">
          <h2 className="text-xs font-semibold text-[#ffffff] mb-1">Search Lead:</h2>
          <LeadSearch onLeadSelect={setSelectedLead} selectedLead={selectedLead} />
        </div>

        {/* — Selected Lead Info — */}
        {selectedLead && (
          <div className="bg-black bg-opacity-50 border border-[#D2EC43]/50 rounded p-1 mb-1">
            <div className="flex justify-between">
              <div className="text-white space-y-1 text-xs">
                <p>
                  <span className="font-semibold text-[#D2EC43]">Name:</span>{" "}
                  {selectedLead.firstName} {selectedLead.lastName}
                </p>
                <p>
                  <span className="font-semibold text-[#D2EC43]">Phone:</span>{" "}
                  {selectedLead.phone || "N/A"}
                </p>
                <p>
                  <span className="font-semibold text-[#D2EC43]">Email:</span>{" "}
                  {selectedLead.email || "N/A"}
                </p>
                <p>
                  <span className="font-semibold text-[#D2EC43]">Address:</span>{" "}
                  {selectedLead.address || "N/A"}
                </p>
              </div>
              <Button
                variant="ghost"
                className="h-6 px-2 text-[#D2EC43] hover:bg-[#D2EC43]/20"
                onClick={() => setSelectedLead(null)}
              >
                ✕
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* — Tooltip at Bottom — */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-5 text-xs container mx-auto px-4">
        <RandomTip />
      </div>
    </main>
  )
}
