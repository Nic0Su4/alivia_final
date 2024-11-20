import React from 'react'

export default function ElegantLoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-full bg-white">
      <div className="relative w-64 h-64 mb-8">
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#e6f3f5" strokeWidth="8" />
          <circle cx="50" cy="50" r="45" fill="none" stroke="#005c7a" strokeWidth="8" strokeDasharray="283" strokeDashoffset="283">
            <animate
              attributeName="stroke-dashoffset"
              values="283;0"
              dur="2s"
              repeatCount="indefinite"
              calcMode="linear"
            />
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 50 50"
              to="360 50 50"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="50" cy="50" r="20" fill="#008b74" opacity="0.2">
            <animate
              attributeName="r"
              values="20;22;20"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="50" cy="50" r="10" fill="#00d9b2">
            <animate
              attributeName="r"
              values="10;12;10"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>
      </div>
      <p className="text-lg text-[#005c7a]">Cargando :D ...</p>
    </div>
  )
}