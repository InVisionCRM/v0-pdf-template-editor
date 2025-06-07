let isLoading = false
let isLoaded = false
let loadError: Error | null = null
let loadPromise: Promise<void> | null = null

export async function loadGoogleMapsScript(): Promise<void> {
  // If already loaded, return immediately
  if (isLoaded) {
    return Promise.resolve()
  }

  // If already loading, return the existing promise
  if (loadPromise) {
    return loadPromise
  }

  // Start loading
  isLoading = true
  loadPromise = new Promise(async (resolve, reject) => {
    try {
      // Check if the script is already in the document
      if (typeof window.google !== "undefined" && window.google.maps && window.google.maps.places) {
        isLoaded = true
        isLoading = false
        resolve()
        return
      }

      // Fetch the script URL from our secure API route
      const response = await fetch("/api/google-maps")
      const data = await response.json()

      if (!response.ok || !data.url) {
        throw new Error(data.error || "Failed to load Google Maps API")
      }

      // Load the Google Maps API script
      const script = document.createElement("script")
      script.src = data.url
      script.async = true
      script.defer = true

      script.onload = () => {
        isLoaded = true
        isLoading = false
        loadError = null
        resolve()
      }

      script.onerror = (error) => {
        isLoading = false
        loadError = error as Error
        reject(error)
      }

      document.head.appendChild(script)
    } catch (error) {
      isLoading = false
      loadError = error as Error
      reject(error)
    }
  })

  return loadPromise
}

export function getGoogleMapsLoadingState() {
  return {
    isLoading,
    isLoaded,
    error: loadError
  }
} 