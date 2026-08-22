'use client'

import React, { useEffect, useRef } from 'react'

interface ModelViewerProps {
  src: string
  alt: string
  autoRotate?: boolean
  cameraControls?: boolean
  ar?: boolean
  className?: string
}

export function ModelViewer({
  src,
  alt,
  autoRotate = true,
  cameraControls = true,
  ar = true,
  className = "w-full h-full min-h-[400px] rounded-xl overflow-hidden bg-muted/20"
}: ModelViewerProps) {
  
  useEffect(() => {
    import('@google/model-viewer')
  }, [])

  return (
    <div className={className}>
      {/* @ts-ignore - custom element */}
      <model-viewer
        src={src}
        alt={alt}
        auto-rotate={autoRotate ? "true" : undefined}
        camera-controls={cameraControls ? "true" : undefined}
        ar={ar ? "true" : undefined}
        ar-modes="webxr scene-viewer quick-look"
        shadow-intensity="1"
        environment-image="neutral"
        exposure="1"
        style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
      >
        <div slot="poster" className="absolute inset-0 flex items-center justify-center bg-muted/20 animate-pulse">
          <span className="text-muted-foreground text-sm font-medium">Loading 3D Model...</span>
        </div>
      {/* @ts-ignore */}
      </model-viewer>
    </div>
  )
}
