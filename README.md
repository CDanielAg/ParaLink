# ParaLink

ParaLink is a comprehensive web application designed to assist in various aspects of link analysis and optimization, likely within the telecommunications, networking, or geographic information systems (GIS) domain. It provides tools for calculating line-of-sight, optimizing parameters, visualizing satellite data, and performing other related utilities. The application aims to offer an intuitive interface for complex technical calculations and data visualization.

## Features

ParaLink is structured into several key modules, each serving a specific purpose:

### Modules/Pages:

*   **Calculator (`app/calculator/page.tsx`)**: Provides general calculation tools. This module likely includes various formulas or interactive calculators relevant to link analysis, such as signal strength, path loss, or other propagation models.
*   **Line of Sight (`app/line-of-sight/page.tsx`)**: Offers functionality to determine the direct visibility between two points. This is crucial for planning wireless links, antenna placement, and understanding terrain interference. It likely integrates mapping features (`components/map-container.tsx`, `leaflet`) and terrain profile visualization (`components/terrain-profile-chart.tsx`).
*   **Optimization (`app/optimization/page.tsx`)**: Focuses on finding optimal parameters or configurations for a given link or system. This could involve optimizing antenna angles, power levels, or other variables to achieve desired performance.
*   **Satellite (`app/satellite/page.tsx`)**: Displays and analyzes satellite-related data. This might include satellite positions, coverage areas, orbital parameters, or tools for planning satellite communication links using `lib/satellite-data.ts`.
*   **Theory (`app/theory/page.tsx`)**: Contains educational content or theoretical explanations related to link analysis principles, propagation models, and relevant physics.
*   **Utilities (`app/utilities/page.tsx`)**: A collection of miscellaneous helpful tools that support the primary modules, such as unit converters, data formatters, or other helper functions.

### Core Components & Functionality:

*   **PDF Export (`app/api/export-pdf/route.ts`, `hooks/use-pdf-export.ts`)**: Allows users to export reports or visualizations generated within the application as PDF documents, utilizing `@sparticuz/chromium` and `puppeteer-core`.
*   **Mapping (`components/map-container.tsx`, `leaflet`)**: Integrates interactive maps for geographical context, essential for line-of-sight and potentially satellite tracking.
*   **Charting (`components/terrain-profile-chart.tsx`, `components/signal-quality-gauge.tsx`, `recharts`)**: Visualizes data effectively, such as terrain profiles, signal quality metrics, and other analytical results.
*   **Responsive UI**: Utilizes `@radix-ui` components and Tailwind CSS for a modern, accessible, and responsive user interface across various devices.

## Technologies Used

*   **Framework**: Next.js (React Framework)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **UI Components**: Radix UI (various packages like `@radix-ui/react-dialog`, `@radix-ui/react-slider`, etc.)
*   **Mapping**: Leaflet (`leaflet`)
*   **Charting**: Recharts (`recharts`)
*   **Form Handling**: React Hook Form (`react-hook-form`) with Zod (`zod`) resolvers
*   **PDF Generation**: Puppeteer Core (`puppeteer-core`) with Chromium (`@sparticuz/chromium`) for server-side rendering/export.
*   **Utilities**: `clsx`, `tailwind-merge`, `date-fns`, etc.

## Getting Started

Follow these instructions to set up the project locally and run it.

### Prerequisites

Make sure you have the following installed on your machine:

*   Node.js (LTS version recommended)
*   pnpm (or npm/yarn, but `pnpm-lock.yaml` suggests pnpm is preferred)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/ParaLink.git # Replace with actual repository URL
    cd ParaLink
    ```

2.  **Install dependencies:**
    If using pnpm:
    ```bash
    pnpm install
    ```
    If using npm:
    ```bash
    npm install
    ```
    If using yarn:
    ```bash
    yarn install
    ```

### Running the Development Server

To start the development server:

```bash
pnpm run dev
# or npm run dev
# or yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The application will automatically reload if you make changes to the source code.

### Building for Production

To build the application for production:

```bash
pnpm run build
# or npm run build
# or yarn build
```

This will create an optimized build of your application in the `.next` folder.

### Starting the Production Server

To run the built application in production mode:

```bash
pnpm run start
# or npm run start
# or yarn start
```

Make sure you have built the project first using `pnpm run build`.

### Linting

To run the linter and check for code style issues:

```bash
pnpm run lint
# or npm run lint
# or yarn lint
```

## Project Structure

Here's a brief overview of the main directories and their contents:

*   `app/`: Contains the Next.js pages and API routes. Each subdirectory typically represents a main section or feature of the application.
    *   `app/api/`: Next.js API routes (e.g., `export-pdf` for server-side PDF generation).
*   `components/`: Houses reusable React components, including UI elements (`components/ui`) and specific application components (e.g., `map-container.tsx`, `terrain-profile-chart.tsx`).
*   `hooks/`: Custom React hooks to encapsulate reusable logic (e.g., `use-pdf-export.ts`).
*   `lib/`: Contains utility functions and business logic (e.g., `calculations.ts`, `satellite-data.ts`).
*   `public/`: Static assets (images, fonts, etc.).
*   `styles/`: Global CSS or Tailwind CSS configurations.

---

This `README.md` provides a detailed overview of the project, its modules, technologies, and how to get started.
