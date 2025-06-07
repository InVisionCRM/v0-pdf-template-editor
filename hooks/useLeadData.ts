"use client"

import { useState, useEffect } from "react"
import type { Lead } from "@/types/lead"

export function useLeadData() {
  const [lead, setLead] = useState<Lead | null>(null)

  useEffect(() => {
    try {
      const storedLead = localStorage.getItem("selectedLead")
      if (storedLead) {
        const parsedLead = JSON.parse(storedLead) as Lead
        setLead(parsedLead)
      }
    } catch (error) {
      console.error("Error retrieving lead data:", error)
    }
  }, [])

  return lead
} 