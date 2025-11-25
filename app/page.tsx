"use client"

import { Github, ArrowRight, Satellite, TrendingUp, Wind, Calculator, FileText, MapPin } from "lucide-react"
import Link from "next/link"

export default function Home() {
  const features = [
    {
      icon: Satellite,
      title: "Cálculo de Antena",
      description: "Calcula parámetros precisos para antenas parabólicas",
    },
    {
      icon: TrendingUp,
      title: "Línea de Vista",
      description: "Analiza visibilidad directa entre dos puntos",
    },
    {
      icon: Wind,
      title: "Optimización Climática",
      description: "Ajusta cálculos según condiciones atmosféricas",
    },
    {
      icon: Calculator,
      title: "Cálculos Físicos",
      description: "Realiza conversiones y cálculos especializados",
    },
    {
      icon: FileText,
      title: "Exportación",
      description: "Genera reportes en PDF con tus resultados",
    },
    {
      icon: MapPin,
      title: "Análisis Geoespacial",
      description: "Visualiza datos sobre mapas interactivos",
    },
  ]

  const actions = [
    { label: "Iniciar Cálculo", href: "/calculator", primary: true },
    { label: "Analizar Terreno", href: "/line-of-sight", primary: false },
    { label: "Buscar Satélite", href: "/satellite", primary: false },
  ]

  return (
    <main className="pt-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-card via-background to-background min-h-screen flex items-center">
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(14, 165, 233, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(14, 165, 233, 0.1) 1px, transparent 1px)",
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          {/* Logo Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
            <Satellite className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Herramienta de Análisis Avanzado</span>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 text-balance">
            <span className="text-foreground">Análisis Parabólico y</span>
            <br />
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Geoespacial Inteligente
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 text-balance">
            Visualiza, calcula y optimiza parámetros de antenas parabólicas con precisión profesional. Análisis en
            tiempo real con datos geoespaciales precisos.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            {actions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={`px-8 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                  action.primary
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
                    : "bg-muted text-foreground hover:bg-muted/80 hover:shadow-lg"
                }`}
              >
                {action.label}
                <ArrowRight className="w-4 h-4" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Funcionalidades Principales</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Herramientas completas para análisis profesional de antenas parabólicas y parámetros geoespaciales
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all group"
              >
                <div className="mb-4 p-3 w-fit rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4">Sobre ParaLink</h4>
              <p className="text-sm text-muted-foreground">
                Herramienta de análisis geoespacial para profesionales en telecomunicaciones y astronomía.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">APIs</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>OpenStreetMap</li>
                <li>OpenWeather</li>
                <li>OpenElevation</li>
                <li>SatNOGS</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Enlaces</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/" className="text-primary hover:text-primary/80">
                    Inicio
                  </Link>
                </li>
                <li>
                  <Link href="/theory" className="text-primary hover:text-primary/80">
                    Teoría
                  </Link>
                </li>
                <li>
                  <Link href="/utilities" className="text-primary hover:text-primary/80">
                    Utilidades
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Información</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Versión 1.0.0
                <br />© 2025 ParaLink
              </p>
              
              {/* Botón de GitHub añadido */}
              <a 
                href="https://github.com/CDanielAg/ParaLink" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="w-5 h-5" />
                <span>Repositorio</span>
              </a>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>Desarrollado para análisis profesional de antenas parabólicas y parámetros geoespaciales</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
