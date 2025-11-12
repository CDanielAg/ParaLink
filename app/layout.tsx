import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import Navbar from "@/components/navbar"
import EventShims from "@/components/event-shims"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "GeoParábola - Análisis Parabólico y Geoespacial",
  description:
    "Herramienta profesional para análisis de antenas parabólicas, orientación satelital y visualización de terreno",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <head>
        {/* Ejecutar shims temprano para evitar warnings de propiedades obsoletas */}
        <script dangerouslySetInnerHTML={{ __html: `try{if(typeof MouseEvent!=='undefined'&&typeof MouseEvent.prototype.mozPressure==='undefined'){Object.defineProperty(MouseEvent.prototype,'mozPressure',{get:function(){return this.pressure??0},configurable:true})}if(typeof MouseEvent!=='undefined'&&typeof MouseEvent.prototype.mozInputSource==='undefined'){Object.defineProperty(MouseEvent.prototype,'mozInputSource',{get:function(){const pt=this.pointerType;return pt==='mouse'?1:pt==='pen'?2:pt==='touch'?3:0},configurable:true})}}catch(e){};` }} />
      </head>
      <body className={`${inter.className} antialiased`}>
        <Navbar />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
