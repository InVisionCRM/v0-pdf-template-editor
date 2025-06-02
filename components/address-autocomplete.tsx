"use client"

import { useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"

interface AddressAutocompleteProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export default function AddressAutocomplete({
  value,
  onChange,
  placeholder = "Enter address",
  className,
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize Google Maps API
  useEffect(() => {
    // Check if the Google Maps API is already loaded
    if (typeof window.google !== "undefined" && window.google.maps && window.google.maps.places) {
      setIsLoaded(true)
      return
    }

    async function loadGoogleMapsScript() {
      try {
        setIsLoading(true)

        // Fetch the script URL from our secure API route
        const response = await fetch("/api/google-maps")
        const data = await response.json()

        if (response.ok && data.url) {
          // Load the Google Maps API script
          const script = document.createElement("script")
          script.src = data.url
          script.async = true
          script.defer = true
          script.onload = () => {
            setIsLoaded(true)
            setIsLoading(false)
          }
          document.head.appendChild(script)

          return () => {
            // Clean up script if component unmounts before script loads
            if (document.head.contains(script)) {
              document.head.removeChild(script)
            }
          }
        } else {
          throw new Error(data.error || "Failed to load Google Maps API")
        }
      } catch (err) {
        console.error("Error loading Google Maps API:", err)
        setError(err instanceof Error ? err.message : "Unknown error")
        setIsLoading(false)
      }
    }

    loadGoogleMapsScript()
  }, [])

  // Initialize autocomplete when Google Maps API is loaded
  useEffect(() => {
    if (!isLoaded || !inputRef.current) return

    try {
      // Create the autocomplete instance
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ["address"],
        fields: ["formatted_address"],
      })

      // Add listener for place selection
      const listener = autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current?.getPlace()
        if (place && place.formatted_address) {
          onChange(place.formatted_address)
        }
      })

      return () => {
        // Clean up listener when component unmounts
        if (autocompleteRef.current) {
          window.google.maps.event.removeListener(listener)
        }
      }
    } catch (err) {
      console.error("Error initializing Google Maps Autocomplete:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
    }
  }, [isLoaded, onChange])

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={isLoading ? "Loading address autocomplete..." : placeholder}
        className={className}
        disabled={isLoading}
      />
      {error && <p className="text-xs text-red-500 mt-1">Error: {error}</p>}
    </div>
  )
}
