declare global {
  interface Window {
    google: {
      maps: {
        places: {
          Autocomplete: new (
            inputField: HTMLInputElement,
            opts?: google.maps.places.AutocompleteOptions
          ) => google.maps.places.Autocomplete
        }
        event: {
          removeListener: (listener: google.maps.MapsEventListener) => void
        }
      }
    }
  }
}

export {}; 