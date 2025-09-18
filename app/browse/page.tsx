"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Play, Pause, Search, Music, User, Clock, Volume2 } from "lucide-react"

interface Track {
  id: number
  songName: string
  userName: string
  duration: string
  uploadDate: string
  fileSize: string
  genre: string
  filePath: string
}

export default function BrowsePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGenre, setSelectedGenre] = useState("all")
  const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)
  const audioRef = useRef<HTMLAudioElement>(null)

  const genres = ["all", "Electronic", "Pop", "Hip-Hop", "Folk", "Ambient", "Jazz"]

  // Fetch tracks from API
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const response = await fetch('/api/tracks')
        const data = await response.json()
        if (data.success) {
          setTracks(data.tracks)
        }
      } catch (error) {
        console.error('Error fetching tracks:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTracks()
  }, [])

  // Filter tracks based on search and genre
  const filteredTracks = tracks.filter(track => {
    const matchesSearch = track.songName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         track.userName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesGenre = selectedGenre === "all" || track.genre === selectedGenre
    return matchesSearch && matchesGenre
  })

  const handlePlayPause = (trackId: number, filePath: string) => {
    if (currentlyPlaying === trackId) {
      if (isPlaying) {
        audioRef.current?.pause()
        setIsPlaying(false)
      } else {
        audioRef.current?.play()
        setIsPlaying(true)
      }
    } else {
      setCurrentlyPlaying(trackId)
      setIsPlaying(true)
      
      // Load and play the audio file
      if (audioRef.current) {
        audioRef.current.src = filePath
        audioRef.current.load()
        audioRef.current.play().catch(error => {
          console.error('Error playing audio:', error)
          setIsPlaying(false)
        })
      }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Browse Music</h1>
          <p className="text-gray-600">Discover amazing music from talented artists</p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search songs or artists..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Genre Filter */}
            <div className="md:w-48">
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {genres.map(genre => (
                  <option key={genre} value={genre}>
                    {genre === "all" ? "All Genres" : genre}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading tracks...</p>
          </div>
        )}

        {/* Music Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTracks.map((track) => (
            <div
              key={track.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              {/* Track Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {track.songName}
                    </h3>
                    <p className="text-gray-600 flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {track.userName}
                    </p>
                  </div>
                  <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                    {track.genre}
                  </span>
                </div>

                {/* Track Details */}
                <div className="space-y-2 text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    {track.duration}
                  </div>
                  <div className="flex items-center">
                    <Volume2 className="w-4 h-4 mr-2" />
                    {track.fileSize}
                  </div>
                  <div>
                    Uploaded: {formatDate(track.uploadDate)}
                  </div>
                </div>

                {/* Play Button */}
                <Button
                  onClick={() => handlePlayPause(track.id, track.filePath)}
                  className={`w-full ${
                    currentlyPlaying === track.id && isPlaying
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  } text-white`}
                >
                  {currentlyPlaying === track.id && isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Play
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
          </div>
        )}

        {/* No Results */}
        {!loading && filteredTracks.length === 0 && (
          <div className="text-center py-12">
            <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tracks found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search terms or genre filter
            </p>
            <Link href="/upload">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Upload Your First Track
              </Button>
            </Link>
          </div>
        )}

        {/* Hidden Audio Element */}
        <audio ref={audioRef} />
      </div>
    </div>
  )
}
