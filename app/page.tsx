import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Upload, Music } from "lucide-react"

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-8 p-8">
        <h1 className="text-6xl font-bold text-gray-900">
          wvclb
        </h1>
        <p className="text-xl text-gray-600 max-w-md mx-auto">
          Share your musical creations with the world
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/upload">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 text-lg font-medium">
              <Upload className="w-5 h-5 mr-2" />
              Upload Music
            </Button>
          </Link>
          
          <Link href="/browse">
            <Button variant="outline" className="border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-8 py-3 text-lg font-medium">
              <Music className="w-5 h-5 mr-2" />
              Browse Music
            </Button>
          </Link>
        </div>
        
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-indigo-600 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}
