# Shipment Management Dashboard

## Overview

This is a full-stack shipment management application built with a modern TypeScript stack. The application provides a dashboard for viewing, managing, and processing shipment data with features like bulk operations, filtering, and status updates.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Style**: RESTful API endpoints
- **Development**: Hot reload with Vite integration

### Data Storage Solutions
- **Database**: PostgreSQL with Neon serverless driver
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations
- **Session Storage**: PostgreSQL-based sessions with connect-pg-simple

## Key Components

### Database Schema
- **Shipments Table**: Contains plant, mill, date, truck number, SKU, rolls count, tonnage, and status
- **Status Field**: Enum values (pending, accepted, rejected)
- **Validation**: Zod schemas for runtime validation

### API Endpoints
- `GET /api/shipments` - Fetch all shipments
- `GET /api/shipments/:id` - Fetch single shipment
- `POST /api/shipments` - Create new shipment
- `PATCH /api/shipments/:id/status` - Update shipment status
- `POST /api/shipments/bulk-status` - Bulk status updates
- `POST /api/csv/upload` - Upload CSV file for validation only
- `POST /api/optimization/run` - Process CSV data and load into system

### Frontend Components
- **Dashboard**: Main application view with summary cards and data table
- **ShipmentTable**: Sortable, filterable table with grouping capabilities
- **ControlPanel**: Search, filtering, and bulk action controls
- **SummaryCards**: Key metrics display (trucks, tons, rolls, accepted count)
- **UploadDialog**: CSV file upload interface with drag-and-drop and dual options

### Storage Layer
- **Interface-based Design**: IStorage interface for data operations
- **Dual Implementation**: MemStorage for development, database storage for production
- **Type Safety**: Full TypeScript coverage for data operations

## Data Flow

1. **Client Requests**: React components use TanStack Query for data fetching
2. **API Layer**: Express routes handle HTTP requests with validation
3. **Business Logic**: Storage layer abstracts database operations
4. **Database**: Drizzle ORM manages PostgreSQL interactions
5. **Response**: Type-safe data flows back through the stack

### State Management
- **Server State**: TanStack Query with automatic caching and invalidation
- **UI State**: React hooks for local component state
- **Form State**: React Hook Form for complex form handling

## Recent Changes

### CSV Upload Functionality (January 2025)
- Added CSV file upload with drag-and-drop interface
- Implemented dual upload options: "Upload Only" for validation and "Upload & Process" for immediate data loading
- Added file validation (CSV format, 5MB size limit)
- Supports flexible column naming (uppercase/lowercase)
- Renamed "Load Sample Data" to "Generate Shipment Details" for better UX
- Created separate API endpoint for upload-only operations

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless connection
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI primitives
- **zod**: Schema validation and type inference

### Development Tools
- **Vite**: Build tool and development server
- **tsx**: TypeScript execution for development
- **esbuild**: Production build bundling
- **tailwindcss**: Utility-first CSS framework

### UI Components
- Comprehensive shadcn/ui component library
- Radix UI primitives for accessibility
- Lucide React icons
- Class variance authority for component variants

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite builds React app to `dist/public`
2. **Backend Build**: esbuild bundles server to `dist/index.js`
3. **Database**: Drizzle migrations applied via `db:push` command

### Environment Configuration
- **Development**: `NODE_ENV=development` with hot reload
- **Production**: `NODE_ENV=production` with optimized builds
- **Database**: `DATABASE_URL` environment variable required

### Scripts
- `dev`: Development server with hot reload
- `build`: Production build for both frontend and backend
- `start`: Production server startup
- `check`: TypeScript type checking
- `db:push`: Database schema deployment

### Architectural Decisions

**Monorepo Structure**: Single repository with shared types between client and server for better type safety and code reuse.

**Drizzle ORM Choice**: Selected for excellent TypeScript integration, lightweight footprint, and direct SQL generation without heavy abstractions.

**TanStack Query**: Chosen for sophisticated server state management with caching, background updates, and optimistic updates.

**Radix UI + shadcn/ui**: Provides accessible, customizable components with consistent design system and excellent developer experience.

**Storage Interface Pattern**: Abstracts data layer to support both in-memory development and production database implementations.