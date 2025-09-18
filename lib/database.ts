import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'

const dbPath = join(process.cwd(), 'data', 'tracks.json')

// Ensure data directory exists
const dataDir = join(process.cwd(), 'data')
import { mkdir } from 'fs/promises'
import { existsSync } from 'fs'

// Initialize data directory
async function ensureDataDir() {
  if (!existsSync(dataDir)) {
    await mkdir(dataDir, { recursive: true })
  }
}

// Call this function when the module is loaded
ensureDataDir()

export interface Track {
  id: number
  songName: string
  userName: string
  fileName: string
  filePath: string
  fileSize: string
  duration: string
  uploadDate: string
  genre: string
}

// Mock data for demo purposes
const mockTracks: Track[] = [
  {
    id: 1,
    songName: "Midnight Dreams",
    userName: "Alex Johnson",
    fileName: "midnight_dreams.mp3",
    filePath: "/uploads/midnight_dreams.mp3",
    fileSize: "8.2 MB",
    duration: "3:45",
    uploadDate: "2024-01-15",
    genre: "Electronic"
  },
  {
    id: 2,
    songName: "Summer Vibes",
    userName: "Sarah Chen",
    fileName: "summer_vibes.mp3",
    filePath: "/uploads/summer_vibes.mp3",
    fileSize: "9.8 MB",
    duration: "4:12",
    uploadDate: "2024-01-14",
    genre: "Pop"
  },
  {
    id: 3,
    songName: "Urban Beat",
    userName: "Mike Rodriguez",
    fileName: "urban_beat.mp3",
    filePath: "/uploads/urban_beat.mp3",
    fileSize: "6.5 MB",
    duration: "2:58",
    uploadDate: "2024-01-13",
    genre: "Hip-Hop"
  },
  {
    id: 4,
    songName: "Acoustic Memories",
    userName: "Emma Wilson",
    fileName: "acoustic_memories.mp3",
    filePath: "/uploads/acoustic_memories.mp3",
    fileSize: "12.1 MB",
    duration: "5:23",
    uploadDate: "2024-01-12",
    genre: "Folk"
  },
  {
    id: 5,
    songName: "Digital Waves",
    userName: "David Kim",
    fileName: "digital_waves.mp3",
    filePath: "/uploads/digital_waves.mp3",
    fileSize: "7.4 MB",
    duration: "3:30",
    uploadDate: "2024-01-11",
    genre: "Ambient"
  },
  {
    id: 6,
    songName: "Jazz Fusion",
    userName: "Lisa Brown",
    fileName: "jazz_fusion.mp3",
    filePath: "/uploads/jazz_fusion.mp3",
    fileSize: "14.2 MB",
    duration: "6:15",
    uploadDate: "2024-01-10",
    genre: "Jazz"
  }
]

export async function getAllTracks(): Promise<Track[]> {
  try {
    const data = await readFile(dbPath, 'utf-8')
    const tracks = JSON.parse(data)
    return [...mockTracks, ...tracks]
  } catch (error) {
    // If file doesn't exist, return just mock data
    return mockTracks
  }
}

export async function addTrack(track: Track): Promise<void> {
  try {
    const existingTracks = await getAllTracks()
    const uploadedTracks = existingTracks.filter(t => !mockTracks.some(mt => mt.id === t.id))
    uploadedTracks.push(track)
    
    await writeFile(dbPath, JSON.stringify(uploadedTracks, null, 2))
  } catch (error) {
    console.error('Error saving track:', error)
    throw error
  }
}
