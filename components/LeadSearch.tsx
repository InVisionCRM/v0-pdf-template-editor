"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import type { Lead } from "@/types/lead"

interface LeadSearchProps {
  onLeadSelect: (lead: Lead) => void
  selectedLead: Lead | null
}

export function LeadSearch({ onLeadSelect, selectedLead }: LeadSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Clear search results when a lead is selected
  useEffect(() => {
    if (selectedLead) {
      setSearchQuery("")
      setSearchResults([])
    }
  }, [selectedLead])

  // Debounced search effect
  useEffect(() => {
    const searchLeads = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([])
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch(`/api/leads/search?q=${encodeURIComponent(searchQuery)}`)
        if (!response.ok) throw new Error("Failed to fetch leads")
        
        const data = await response.json()
        setSearchResults(data)
      } catch (error) {
        console.error("Error searching leads:", error)
        setSearchResults([])
      } finally {
        setIsLoading(false)
      }
    }

    // Debounce the search to avoid too many API calls
    const timeoutId = setTimeout(searchLeads, 300)
    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-black bg-opacity-50 border-[#32CD32] text-white placeholder-gray-400 pr-10 h-12 text-lg"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {!selectedLead && (
        <>
          {isLoading && (
            <div className="text-center text-gray-400">
              Searching...
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="space-y-1">
              {searchResults.map((lead) => (
                <div
                  key={lead.id}
                  className="p-2 bg-black bg-opacity-50 rounded-lg border border-[#32CD32] cursor-pointer hover:bg-opacity-75 transition-colors"
                  onClick={() => onLeadSelect(lead)}
                >
                  <h3 className="font-medium text-white">
                    {lead.firstName} {lead.lastName}
                  </h3>
                </div>
              ))}
            </div>
          )}

          {searchResults.length === 0 && searchQuery && !isLoading && (
            <div className="text-center text-gray-400">
              No leads found
            </div>
          )}
        </>
      )}
    </div>
  )
} 