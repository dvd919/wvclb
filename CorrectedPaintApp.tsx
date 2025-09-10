"use client"

import type React from "react"
import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

const colors = [
  "#000000",
  "#808080",
  "#800000",
  "#808000",
  "#008000",
  "#008080",
  "#000080",
  "#800080",
  "#808040",
  "#004040",
  "#0080FF",
  "#004080",
  "#8000FF",
  "#804000",
  "#FFFFFF",
  "#C0C0C0",
  "#FF0000",
  "#FFFF00",
  "#00FF00",
  "#00FFFF",
  "#0000FF",
  "#FF00FF",
  "#FFFF80",
  "#00FF80",
  "#80FFFF",
  "#8080FF",
  "#FF0080",
  "#FF8040",
]

export default function Component() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const paletteCanvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState("#000000")
  const [tool, setTool] = useState("brush")
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [hoveredColor, setHoveredColor] = useState<string | null>(null)
  const [showPalette, setShowPalette] = useState(false)
  const [isDraggingPalette, setIsDraggingPalette] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext("2d")
    if (context && canvas) {
      // Set canvas size to match container
      const container = canvas.parentElement
      if (container) {
        const rect = container.getBoundingClientRect()
        canvas.width = Math.max(600, rect.width)
        canvas.height = Math.max(400, rect.height)
      }

      // Fill with white background
      context.fillStyle = "#FFFFFF"
      context.fillRect(0, 0, canvas.width, canvas.height)

      // Set default drawing properties
      context.lineCap = "round"
      context.lineJoin = "round"
    }
  }, [])

  useEffect(() => {
    if (showPalette) {
      const canvas = paletteCanvasRef.current
      const context = canvas?.getContext("2d")
      if (context && canvas) {
        const gradient = context.createLinearGradient(0, 0, canvas.width, 0)
        gradient.addColorStop(0, "#FF0000")
        gradient.addColorStop(0.17, "#FFFF00")
        gradient.addColorStop(0.33, "#00FF00")
        gradient.addColorStop(0.5, "#00FFFF")
        gradient.addColorStop(0.67, "#0000FF")
        gradient.addColorStop(0.83, "#FF00FF")
        gradient.addColorStop(1, "#FF0000")

        context.fillStyle = gradient
        context.fillRect(0, 0, canvas.width, canvas.height)
      }
    }
  }, [showPalette])

  const getEventCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    let clientX, clientY

    if ("touches" in e) {
      const touch = e.touches[0] || e.changedTouches[0]
      if (!touch) return { x: 0, y: 0 }
      clientX = touch.clientX
      clientY = touch.clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    // Calculate coordinates with proper scaling
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const canvas = canvasRef.current
    const context = canvas?.getContext("2d")
    if (context) {
      const { x, y } = getEventCoordinates(e)
      context.beginPath()
      context.moveTo(x, y)
      setIsDrawing(true)
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    if (!isDrawing) return
    const canvas = canvasRef.current
    const context = canvas?.getContext("2d")
    if (context) {
      const { x, y } = getEventCoordinates(e)
      context.lineTo(x, y)
      context.strokeStyle = tool === "eraser" ? "#FFFFFF" : color
      context.lineWidth = tool === "eraser" ? 20 : 2
      context.stroke()
    }
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const getColorFromPalette = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = paletteCanvasRef.current
    const context = canvas?.getContext("2d")
    if (context && canvas) {
      const rect = canvas.getBoundingClientRect()
      let clientX, clientY

      if ("touches" in e) {
        clientX = e.touches[0]?.clientX || e.changedTouches[0]?.clientX || 0
        clientY = e.touches[0]?.clientY || e.changedTouches[0]?.clientY || 0
      } else {
        clientX = e.clientX
        clientY = e.clientY
      }

      const x = clientX - rect.left
      const y = clientY - rect.top

      const imageData = context.getImageData(x, y, 1, 1)
      const [r, g, b] = imageData.data
      const hex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
      setColor(hex.toUpperCase())
    }
  }

  const startPaletteDrag = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    setIsDraggingPalette(true)
    getColorFromPalette(e)
  }

  const dragPalette = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    if (isDraggingPalette) {
      getColorFromPalette(e)
    }
  }

  const stopPaletteDrag = () => {
    setIsDraggingPalette(false)
  }

  const startDragging = (e: React.MouseEvent<HTMLDivElement>) => {
    setDragging(true)
    setPosition({
      x: e.clientX - (containerRef.current?.offsetLeft || 0),
      y: e.clientY - (containerRef.current?.offsetTop || 0),
    })
  }

  const onDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragging) {
      const left = e.clientX - position.x
      const top = e.clientY - position.y
      if (containerRef.current) {
        containerRef.current.style.left = `${left}px`
        containerRef.current.style.top = `${top}px`
      }
    }
  }

  const stopDragging = () => {
    setDragging(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const context = canvas?.getContext("2d")
    if (context && canvas) {
      context.fillStyle = "#FFFFFF"
      context.fillRect(0, 0, canvas.width, canvas.height)
    }
  }

  return (
    <div className="min-h-screen overflow-hidden relative" style={{ backgroundColor: "#001B3D" }}>
      <style jsx>{`
        .diagonal-wave-bg::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: url('/wave.png');
          background-repeat: repeat;
          background-size: 100px 100px;
          transform: rotate(45deg);
          transform-origin: center;
          width: 200%;
          height: 200%;
          top: -50%;
          left: -50%;
          z-index: 0;
        }
      `}</style>
      <div className="diagonal-wave-bg fixed inset-0">
        <div
          ref={containerRef}
          className="absolute border-2 border-white shadow-md z-10 flex flex-col"
          style={{
            width: "min(800px, 95vw)",
            height: "min(600px, 90vh)",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "#F8FAFC",
          }}
        >
          <div
            className="text-white px-2 py-1 flex justify-between items-center cursor-move text-sm flex-shrink-0"
            style={{ backgroundColor: "#001B3D" }}
            onMouseDown={startDragging}
            onMouseMove={onDrag}
            onMouseUp={stopDragging}
            onMouseLeave={stopDragging}
          >
            <span className="truncate">untitled - wvclb</span>
            <div className="flex gap-1 flex-shrink-0">
              <Button
                variant="ghost"
                className="h-5 w-5 p-0 min-w-0 text-white hover:bg-white/20 text-xs"
                style={{
                  backgroundColor: "#001B3D",
                  color: "#FFFFFF",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#003366")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#001B3D")}
              >
                _
              </Button>
              <Button
                variant="ghost"
                className="h-5 w-5 p-0 min-w-0 text-white hover:bg-white/20 text-xs"
                style={{
                  backgroundColor: "#001B3D",
                  color: "#FFFFFF",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#003366")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#001B3D")}
              >
                □
              </Button>
              <Button
                variant="ghost"
                className="h-5 w-5 p-0 min-w-0 text-white hover:bg-white/20 text-xs"
                style={{
                  backgroundColor: "#001B3D",
                  color: "#FFFFFF",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#003366")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#001B3D")}
              >
                ×
              </Button>
            </div>
          </div>

          <div
            className="px-2 py-1 text-xs md:text-sm overflow-x-auto whitespace-nowrap flex-shrink-0"
            style={{ backgroundColor: "#E6F2FF", color: "#001B3D" }}
          >
            <span className="mr-4">file</span>
            <span className="mr-4">edit</span>
            <span className="mr-4">view</span>
            <span className="mr-4">image</span>
            <span className="mr-4">options</span>
            <span>help</span>
          </div>

          <div className="flex flex-col md:flex-row flex-1 min-h-0">
            <div
              className="flex md:flex-col md:w-8 p-0.5 border-r md:border-r md:border-b-0 border-b flex-shrink-0"
              style={{ backgroundColor: "#E6F2FF", borderColor: "#CBD5E1" }}
            >
              <Button
                variant="ghost"
                className={`w-7 h-7 p-0 min-w-0 mb-0.5 mr-0.5 md:mr-0 ${tool === "brush" ? "shadow-inner" : ""}`}
                style={{
                  backgroundColor: tool === "brush" ? "#CBD5E1" : "transparent",
                  borderColor: tool === "brush" ? "#001B3D" : "transparent",
                  borderWidth: tool === "brush" ? "1px" : "0",
                }}
                onClick={() => setTool("brush")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 md:w-5 md:h-5"
                  style={{ color: "#001B3D" }}
                >
                  <path d="M18 12l-8-8-6 6c-2 2-2 5 0 7s5 2 7 0l7-7" />
                  <path d="M17 7l3 3" />
                </svg>
              </Button>
              <Button
                variant="ghost"
                className={`w-7 h-7 p-0 min-w-0 mb-0.5 mr-0.5 md:mr-0 ${tool === "eraser" ? "shadow-inner" : ""}`}
                style={{
                  backgroundColor: tool === "eraser" ? "#CBD5E1" : "transparent",
                  borderColor: tool === "eraser" ? "#001B3D" : "transparent",
                  borderWidth: tool === "eraser" ? "1px" : "0",
                }}
                onClick={() => setTool("eraser")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 md:w-5 md:h-5"
                  style={{ color: "#001B3D" }}
                >
                  <path d="M20 20H7L3 16C2 15 2 13 3 12L13 2L22 11L20 20Z" />
                  <path d="M17 17L7 7" />
                </svg>
              </Button>
              <Button
                variant="ghost"
                className={`w-7 h-7 p-0 min-w-0 mb-0.5 mr-0.5 md:mr-0 ${showPalette ? "shadow-inner" : ""}`}
                style={{
                  backgroundColor: showPalette ? "#CBD5E1" : "transparent",
                  borderColor: showPalette ? "#001B3D" : "transparent",
                  borderWidth: showPalette ? "1px" : "0",
                }}
                onClick={() => setShowPalette(!showPalette)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 md:w-5 md:h-5"
                  style={{ color: "#001B3D" }}
                >
                  <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
                  <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
                  <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
                  <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
                </svg>
              </Button>
              <Button
                variant="ghost"
                className="w-7 h-7 p-0 min-w-0 mb-0.5 mr-0.5 md:mr-0"
                style={{
                  backgroundColor: "transparent",
                  borderColor: "transparent",
                  borderWidth: "0",
                }}
                onClick={clearCanvas}
                title="Erase All (Reset)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 md:w-5 md:h-5"
                  style={{ color: "#001B3D" }}
                >
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
              </Button>
            </div>

            <div
              className="flex-1 overflow-hidden border-0 touch-none flex flex-col"
              style={{
                borderColor: "#CBD5E1",
              }}
            >
              <canvas
                ref={canvasRef}
                className="w-full flex-1 touch-none block"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                style={{
                  touchAction: "none",
                  display: "block",
                  minHeight: "200px",
                }}
              />
            </div>
          </div>

          <div
            className="flex p-1 border-t relative flex-shrink-0"
            style={{ backgroundColor: "#E6F2FF", borderColor: "#CBD5E1" }}
          >
            <div className="flex flex-wrap gap-0.5 md:gap-1 overflow-x-auto">
              {colors.map((c) => (
                <Button
                  key={c}
                  variant="ghost"
                  className={`w-4 h-4 md:w-6 md:h-6 p-0 min-w-0 flex-shrink-0 ${color === c ? "ring-2" : ""}`}
                  style={
                    {
                      backgroundColor: c,
                      "--tw-ring-color": "#001B3D",
                    } as React.CSSProperties
                  }
                  onClick={() => setColor(c)}
                  onMouseEnter={() => setHoveredColor(c)}
                  onMouseLeave={() => setHoveredColor(null)}
                />
              ))}
            </div>
            {hoveredColor && (
              <div
                className="absolute bottom-full mb-1 px-2 py-1 text-xs rounded shadow-lg pointer-events-none z-10"
                style={{
                  backgroundColor: "#001B3D",
                  color: "#FFFFFF",
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              >
                {hoveredColor.toUpperCase()}
                <div
                  className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0"
                  style={{
                    borderLeft: "4px solid transparent",
                    borderRight: "4px solid transparent",
                    borderTop: "4px solid #001B3D",
                  }}
                />
              </div>
            )}
            {showPalette && (
              <div
                className="absolute bottom-full mb-2 left-2 border-2 shadow-lg z-20"
                style={{
                  backgroundColor: "#F8FAFC",
                  borderColor: "#001B3D",
                  width: "min(220px, 90vw)",
                }}
              >
                <div
                  className="px-2 py-1 text-xs font-medium border-b cursor-move"
                  style={{
                    backgroundColor: "#001B3D",
                    color: "#FFFFFF",
                    borderColor: "#CBD5E1",
                  }}
                >
                  Color Palette
                </div>
                <div className="p-2">
                  <canvas
                    ref={paletteCanvasRef}
                    width={200}
                    height={30}
                    className="cursor-crosshair border w-full touch-none"
                    style={{ borderColor: "#CBD5E1", touchAction: "none" }}
                    onMouseDown={startPaletteDrag}
                    onMouseMove={dragPalette}
                    onMouseUp={stopPaletteDrag}
                    onMouseLeave={stopPaletteDrag}
                    onTouchStart={startPaletteDrag}
                    onTouchMove={dragPalette}
                    onTouchEnd={stopPaletteDrag}
                  />
                  <div className="mt-2 text-xs text-center" style={{ color: "#001B3D" }}>
                    Click or drag to select color
                  </div>
                </div>
              </div>
            )}
          </div>

          <div
            className="px-2 py-1 text-xs border-t truncate flex-shrink-0"
            style={{ backgroundColor: "#E6F2FF", borderColor: "#CBD5E1", color: "#001B3D" }}
          >
            wvclb.com @2025 all rights reserved
          </div>
        </div>
      </div>
    </div>
  )
}
