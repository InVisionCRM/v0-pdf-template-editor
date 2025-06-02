"use client"

import { useCallback } from "react"
import Particles from "react-tsparticles"
import { loadSlim } from "tsparticles-slim"
import type { Engine } from "tsparticles-engine"

export default function ParticleBackground() {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine)
  }, [])

  return (
    <div className="fixed inset-0 w-full h-full" style={{ zIndex: -1 }}>
      <Particles
        id="tsparticles"
        init={particlesInit}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          zIndex: -1,
        }}
        options={{
          fullScreen: false,
          background: {
            color: {
              value: "#000000", // Light gray background matching the existing bg-gray-50
            },
          },
          fpsLimit: 120,
          particles: {
            color: {
              value: "#32CD32", // Lime-600 color - darker for better visibility
            },
            links: {
              color: "#32CD32", // Lime-600 color
              distance: 150,
              enable: true,
              opacity: 1, // Increased opacity
              width: 2, // Thicker lines
            },
            move: {
              direction: "none",
              enable: true,
              outModes: {
                default: "bounce",
              },
              random: false,
              speed: 1, // Increased speed
              straight: false,
            },
            number: {
              density: {
                enable: true,
                area: 800,
              },
              value: 50, // More particles
            },
            opacity: {
              value: 1, // Increased opacity
            },
            shape: {
              type: "circle",
            },
            size: {
              value: { min: 2, max: 10 }, // Larger particles
            },
          },
          detectRetina: true,
        }}
      />
    </div>
  )
}
