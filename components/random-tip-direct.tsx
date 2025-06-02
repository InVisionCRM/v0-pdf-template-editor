"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { LightbulbIcon } from "lucide-react"

// The tips array from the JSON file
const tips = [
  "Asphalt shingles typically last 20–30 years and are the most common residential roofing material.",
  "Architectural shingles are more durable and wind-resistant than 3-tab shingles.",
  "Metal roofs last 40–70 years, shed snow well, and come with higher upfront cost.",
  "EPDM, TPO, and PVC are common single-ply flat roof systems with different properties.",
  "Synthetic underlayment resists water better than traditional felt.",
  "Ice and water shield is essential along eaves, valleys, and penetrations in cold climates.",
  "Proper attic ventilation prevents moisture damage and extends roof life.",
  "Roof decking is usually OSB or plywood; damaged boards must be replaced during tear-off.",
  "Starter strip shingles prevent edge blow-offs and improve sealing.",
  "Drip edge metal directs water into gutters and protects fascia.",
  "Nails should be placed precisely in the shingle nail line—never too high or low.",
  "All flashing must be properly installed around chimneys, skylights, and dormers.",
  "Valleys can be installed as metal, cut, or woven; each has pros and cons.",
  "Tear-off installs are cleaner and longer-lasting than overlay.",
  "Pipe boots and wall junctions are frequent leak points.",
  "Ice dams are reduced by combining insulation, ventilation, and ice guard.",
  "Ridge cap shingles must overlap properly to prevent wind damage.",
  "Hail damage includes bruising, granule loss, and soft spots on shingles.",
  "Insurance carriers often require 8+ hail hits per square to approve claims.",
  "Most manufacturer warranties are void if installation doesn't follow spec.",
  "Vinyl siding is affordable and low-maintenance but cracks in cold climates.",
  "Fiber cement siding resists fire, pests, and rot but is heavy and harder to cut.",
  "Natural wood siding looks great but requires frequent maintenance.",
  "Engineered wood siding is lighter and easier to install than fiber cement.",
  "Aluminum siding is rustproof but easily dented.",
  "Composite siding mimics high-end finishes with low upkeep.",
  "Starter strip and J-channel are essential for secure siding installation.",
  "Nails should allow siding to float—never driven tight.",
  "Windows and doors must be flashed properly to prevent leaks.",
  "Furring strips may be needed to level uneven walls or add rain screen.",
  "House wrap acts as a weather barrier under siding.",
  "Water table and corner trim boards finish and protect edges.",
  "Caulk is used at joints on LP or Hardie, not vinyl.",
  "Hail damage includes cracks, breaks, and chipping on siding panels.",
  "Color fade warranties vary—some guarantee 10+ years without major discoloration.",
  "LP is easier to install; Hardie is tougher and more fire-resistant.",
  "Aluminum gutters are most common and affordable.",
  "Steel gutters are stronger but prone to rust.",
  "Copper gutters offer top performance and visual appeal at high cost.",
  "Vinyl gutters are inexpensive but brittle in cold climates.",
  "5-inch gutters are standard for residential; 6-inch for large or steep roofs.",
  "3x4 downspouts carry more water than 2x3s and reduce overflow.",
  "K-style gutters are common; half-round are more traditional and upscale.",
  "Gutters must slope ¼ inch per 10 feet toward downspouts.",
  "Hidden hangers outperform spike-and-ferrule systems.",
  "Gutter guards reduce clogs but can overflow if debris builds on top.",
  "Gutters must be installed under drip edge metal to catch all runoff.",
  "Kickout flashing prevents roof runoff from getting behind siding.",
  "Splash blocks or extensions prevent water from pooling near foundation.",
  "Clean gutters at least twice a year or more often near trees.",
  "Sagging, separation, rust, and peeling paint below gutters are signs of failure.",
  "Seamless gutters reduce leaks and look cleaner than sectional types.",
  "Downspouts must carry water 5+ feet away from the home.",
  "In cold climates, heat cables can prevent ice dams in gutters.",
  "Most homeowners don't understand roofing systems—use that to educate and build trust.",
  "When discussing attic ventilation, explain it prevents mold and heat damage.",
  "Bring sample shingles or siding to the appointment—physical products close deals.",
  "Use storm history tools to justify insurance claims with documented hail events.",
  "Bundle roofing, siding, and gutter work to increase job value and profit.",
]

export default function RandomTip() {
  const [tip, setTip] = useState<string>("")

  useEffect(() => {
    // Get a random tip from the array
    const randomIndex = Math.floor(Math.random() * tips.length)
    setTip(tips[randomIndex])
  }, [])

  if (!tip) {
    return null // Don't show anything until we have a tip
  }

  return (
    <Card className="bg-black bg-opacity-75 border-[#32CD32] border-2 mb-6">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <LightbulbIcon className="h-6 w-6 text-[#32CD32] flex-shrink-0 mt-0.5" />
          <p className="text-white text-sm">{tip}</p>
        </div>
      </CardContent>
    </Card>
  )
}
