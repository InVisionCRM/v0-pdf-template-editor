"use client"

import { useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { loadGoogleMapsScript, getGoogleMapsLoadingState } from "@/lib/google-maps"

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
  const [error, setError] = useState<string | null>(null)
  const { isLoading, isLoaded } = getGoogleMapsLoadingState()

  // Initialize Google Maps API
  useEffect(() => {
    async function initGoogleMaps() {
      try {
        await loadGoogleMapsScript()
      } catch (err) {
        console.error("Error loading Google Maps API:", err)
        setError(err instanceof Error ? err.message : "Unknown error")
      }
    }

    if (!isLoaded) {
      initGoogleMaps()
    }
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
