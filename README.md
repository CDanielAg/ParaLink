# ParaLink

ParaLink es una aplicación web integral diseñada para asistir en varios aspectos del análisis y la optimización de enlaces, probablemente dentro del dominio de las telecomunicaciones, redes o sistemas de información geográfica (SIG). Proporciona herramientas para calcular línea de vista, optimizar parámetros, visualizar datos satelitales y realizar otras utilidades relacionadas. La aplicación tiene como objetivo ofrecer una interfaz intuitiva para cálculos técnicos complejos y visualización de datos.

## Características

ParaLink está estructurado en varios módulos clave, cada uno con un propósito específico y una lógica subyacente detallada:

### Módulos/Páginas:

*   **Calculadora (`app/calculator/page.tsx`)**:
    *   **Función**: Proporciona herramientas de cálculo general para enlaces.
    *   **Lógica**: Al seleccionar dos puntos en el mapa, calcula la distancia utilizando la fórmula de Haversine, el azimut y el ángulo de elevación entre ellos. Integra la API de OpenElevation para obtener datos precisos de altitud de los puntos y la API de Open-Meteo para las condiciones meteorológicas locales del punto A. Adicionalmente, sugiere el diámetro de antena óptimo y estima un margen de error para el enlace.
    *   **Componentes Clave**: Utiliza `MapContainer` para la selección y visualización de puntos, `lib/calculations.ts` para las operaciones matemáticas fundamentales y `ExportModal` junto con `app/api/export-pdf/route.ts` y `puppeteer-core` para la generación y descarga de informes PDF detallados.
*   **Línea de Vista (`app/line-of-sight/page.tsx`)**:
    *   **Función**: Ofrece la funcionalidad para determinar la visibilidad directa entre dos puntos geográficos.
    *   **Lógica**: Crucial para la planificación de enlaces inalámbricos y la ubicación de antenas. Este módulo probablemente recupera perfiles de elevación a lo largo de una trayectoria definida por dos puntos para identificar posibles obstrucciones del terreno, garantizando una comunicación ininterrumpida.
    *   **Componentes Clave**: Se basa en `MapContainer` para la entrada geográfica y `TerrainProfileChart` para la visualización interactiva de los datos de elevación del terreno.
*   **Optimización (`app/optimization/page.tsx`)**:
    *   **Función**: Se centra en encontrar los parámetros o configuraciones óptimos para un enlace o sistema dado.
    *   **Lógica**: Este módulo proporcionaría herramientas para optimizar variables como los ángulos de la antena, los niveles de potencia o la selección de frecuencia. Podría emplear algoritmos iterativos o simulaciones para lograr el mejor rendimiento posible o el cumplimiento de las regulaciones específicas. (Nota: La implementación detallada de la lógica de optimización se añadiría en futuras iteraciones).
*   **Orientador Satelital (`app/satellite/page.tsx`)**:
    *   **Función**: Muestra y analiza datos relacionados con satélites.
    *   **Lógica**: Podría incluir la visualización de posiciones satelitales, áreas de cobertura y parámetros orbitales en tiempo real o proyectados. Permite a los usuarios rastrear satélites específicos, calcular ángulos de apuntamiento de antenas terrestres o planificar enlaces de comunicación satelital utilizando datos gestionados por `lib/satellite-data.ts`.
    *   **Componentes Clave**: Probablemente utiliza `MapContainer` para mostrar las posiciones de los satélites en relación con las estaciones terrestres y podría integrar gráficos para visualizar datos orbitales.
*   **Teoría (`app/theory/page.tsx`)**:
    *   **Función**: Contiene contenido educativo o explicaciones teóricas.
    *   **Lógica**: Proporciona recursos de aprendizaje sobre principios fundamentales de la propagación de radio, análisis de presupuesto de enlace, teoría de antenas y otros temas relevantes para mejorar la comprensión del usuario sobre los conceptos subyacentes.
*   **Utilidades (`app/utilities/page.tsx`)**:
    *   **Función**: Una colección de herramientas misceláneas útiles que complementan los módulos principales.
    *   **Lógica**: Ofrece convertidores rápidos para unidades comunes en telecomunicaciones (metros a kilómetros, dBm a mW, grados a radianes, frecuencia a longitud de onda). Las conversiones se realizan en el lado del cliente con actualizaciones en tiempo real a medida que el usuario escribe. También incluye un comprobador de estado para las APIs externas utilizadas por la aplicación.
    *   **Componentes Clave**: Campos de entrada simples con lógica de conversión en tiempo real y componentes para mostrar el estado de las APIs.

### Componentes y Funcionalidades Principales:

*   **Exportación a PDF (`app/api/export-pdf/route.ts`, `hooks/use-pdf-export.ts`)**: Permite a los usuarios exportar informes o visualizaciones generadas dentro de la aplicación como documentos PDF, utilizando `@sparticuz/chromium` y `puppeteer-core` para el renderizado del lado del servidor.
*   **Cartografía (`components/map-container.tsx`, `leaflet`)**: Integra mapas interactivos para proporcionar contexto geográfico, esencial para la línea de vista y el seguimiento satelital.
*   **Gráficos (`components/terrain-profile-chart.tsx`, `components/signal-quality-gauge.tsx`, `recharts`)**: Visualiza datos de manera efectiva, como perfiles de terreno, métricas de calidad de señal y otros resultados analíticos.
*   **Interfaz de Usuario Responsiva**: Utiliza componentes `@radix-ui` y Tailwind CSS para una interfaz de usuario moderna, accesible y que se adapta a diferentes dispositivos.

## Tecnologías Utilizadas

*   **Framework**: Next.js (Marco de trabajo de React)
*   **Lenguaje**: TypeScript
*   **Estilos**: Tailwind CSS
*   **Componentes UI**: Radix UI (varios paquetes como `@radix-ui/react-dialog`, `@radix-ui/react-slider`, etc.)
*   **Cartografía**: Leaflet (`leaflet`)
*   **Gráficos**: Recharts (`recharts`)
*   **Manejo de Formularios**: React Hook Form (`react-hook-form`) con validación Zod (`zod`)
*   **Generación de PDF**: Puppeteer Core (`puppeteer-core`) con Chromium (`@sparticuz/chromium`) para el renderizado/exportación del lado del servidor.
*   **Utilidades**: `clsx`, `tailwind-merge`, `date-fns`, etc.

## Comenzando

Sigue estas instrucciones para configurar el proyecto localmente y ejecutarlo.

### Prerrequisitos

Asegúrate de tener lo siguiente instalado en tu máquina:

*   Node.js (se recomienda la versión LTS)
*   pnpm (o npm/yarn, pero `pnpm-lock.yaml` sugiere que se prefiere pnpm)

### Instalación

1.  **Clona el repositorio:**
    ```bash
    git clone https://github.com/your-username/ParaLink.git # Reemplaza con la URL real del repositorio
    cd ParaLink
    ```

2.  **Instala las dependencias:**
    Si usas pnpm:
    ```bash
    pnpm install
    ```
    Si usas npm:
    ```bash
    npm install
    ```
    Si usas yarn:
    ```bash
    yarn install
    ```

### Ejecutando el Servidor de Desarrollo

Para iniciar el servidor de desarrollo:

```bash
pnpm run dev
# o npm run dev
# o yarn dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver el resultado.

La aplicación se recargará automáticamente si realizas cambios en el código fuente.

### Construyendo para Producción

Para construir la aplicación para producción:

```bash
pnpm run build
# o npm run build
# o yarn build
```

Esto creará una versión optimizada de tu aplicación en la carpeta `.next`.

### Iniciando el Servidor de Producción

Para ejecutar la aplicación construida en modo de producción:

```bash
pnpm run start
# o npm run start
# o yarn start
```

Asegúrate de haber construido el proyecto primero usando `pnpm run build`.

### Linting

Para ejecutar el linter y verificar problemas de estilo de código:

```bash
pnpm run lint
# o npm run lint
# o yarn lint
```

## Estructura del Proyecto

Aquí tienes una breve descripción de los directorios principales y su contenido:

*   `app/`: Contiene las páginas y rutas API de Next.js. Cada subdirectorio suele representar una sección principal o característica de la aplicación.
    *   `app/api/`: Rutas API de Next.js (por ejemplo, `export-pdf` para la generación de PDF del lado del servidor).
*   `components/`: Aloja componentes React reutilizables, incluidos elementos UI (`components/ui`) y componentes específicos de la aplicación (por ejemplo, `map-container.tsx`, `terrain-profile-chart.tsx`).
*   `hooks/`: Hooks de React personalizados para encapsular lógica reutilizable (por ejemplo, `use-pdf-export.ts`).
*   `lib/`: Contiene funciones de utilidad y lógica de negocio (por ejemplo, `calculations.ts`, `satellite-data.ts`).
*   `public/`: Activos estáticos (imágenes, fuentes, etc.).
*   `styles/`: Configuraciones globales de CSS o Tailwind CSS.

---

Este `README.md` proporciona una visión detallada del proyecto, sus módulos, tecnologías y cómo empezar.