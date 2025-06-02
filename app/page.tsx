import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import ParticleBackground from "@/components/particle-background"
import RandomTip from "@/components/random-tip-direct"

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8 relative">
      <ParticleBackground />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="https://ehjgnin9yr7pmzsk.public.blob.vercel-storage.com/in-vision-logo-UJNZxvzrwPs8WsZrFbI7Z86L8TWcc5.png"
              alt="In-Vision Construction Logo"
              width={200}
              height={200}
              className="h-auto"
              priority
            />
          </div>
          <h1 className="text-3xl font-bold mb-2 text-[#32CD32]">In-Vision Construction Contracts</h1>
          <p className="text-gray-500">Select a contract type to view and edit</p>
        </div>

        <RandomTip />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-md hover:shadow-lg transition-shadow bg-black bg-opacity-75">
            <CardHeader>
              <CardTitle className="text-white">Scope of Work</CardTitle>
              <CardDescription className="text-white">
                Addendum for detailed scope of work and material specifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/scope-of-work">
                <Button className="w-full bg-[#32CD32] text-black hover:bg-[#32CD32]/90">Open Contract</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow bg-black bg-opacity-75">
            <CardHeader>
              <CardTitle className="text-white">General Contract</CardTitle>
              <CardDescription className="text-white">
                Standard agreement between In-Vision Construction and Home Owner
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/general-contract">
                <Button className="w-full bg-[#32CD32] text-black hover:bg-[#32CD32]/90">Open Contract</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow bg-black bg-opacity-75">
            <CardHeader>
              <CardTitle className="text-white">Warranty Contract</CardTitle>
              <CardDescription className="text-white">
                Roof Replacement Warranty Certificate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/warranty-contract">
                <Button className="w-full bg-[#32CD32] text-black hover:bg-[#32CD32]/90">Open Contract</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
