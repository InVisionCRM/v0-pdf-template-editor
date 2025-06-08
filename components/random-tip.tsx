"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { LightbulbIcon } from "lucide-react"

interface Tip {
  content: string
}

export default function RandomTip() {
  const [tip, setTip] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchRandomTip() {
      try {
        setIsLoading(true)
        const response = await fetch("/api/random-tip")
        if (!response.ok) {
          throw new Error("Failed to fetch tip")
        }
        const data = await response.json()
        setTip(data.tip)
      } catch (error) {
        console.error("Error fetching random tip:", error)
        setTip("Did you know? Regular roof maintenance can extend your roof's lifespan by up to 5 years.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchRandomTip()
  }, [])

  if (isLoading) {
    return null // Don't show anything while loading
  }

  return (
    <Card className="bg-black bg-opacity-75 border-[#32CD32] border-2 mb-6">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <LightbulbIcon className="h-10 w-6 text-[#32CD32] flex-shrink-0 mt-0.5" />
          <p className="text-white text-sm">{tip}</p>
        </div>
      </CardContent>
    </Card>
  )
}
