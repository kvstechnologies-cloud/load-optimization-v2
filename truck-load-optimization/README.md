# Truck Load Optimization Application

A modern full-stack web application for managing truck load optimization and shipment approvals.

## Features

- 📊 **Dashboard**: Real-time overview of shipments with summary cards
- 📋 **Shipment Management**: View, sort, filter, and group shipment data
- ✅ **Approval Workflow**: Accept/reject shipments individually or in bulk
- 📤 **CSV Upload**: Upload shipment data via drag-and-drop interface
- 📥 **Export**: Download accepted shipments as CSV
- 🔍 **Search & Filter**: Find shipments by plant, mill, SKU, or truck number
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling and development
- **TanStack Query** for server state management
- **Radix UI + shadcn/ui** for accessible components
- **Tailwind CSS** for styling
- **Wouter** for client-side routing

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **Drizzle ORM** for database operations
- **Zod** for schema validation
- **Multer** for file uploads
- **csv-parse** for CSV processing

### Database
- **PostgreSQL** (Neon serverless recommended)
- **In-memory storage** for development

## Quick Start

### Prerequisites
- Node.js 20 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/kvstechnologies-cloud/load-optimization-v2.git
cd load-optimization-v2
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database URL and other settings
```

4. Start the development server:
```bash
npm run dev
```

5. Open http://localhost:5000 in your browser

## Project Structure

```
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utilities and configurations
│   └── index.html
├── server/                 # Express backend application
│   ├── index.ts            # Server entry point
│   ├── routes.ts           # API route definitions
│   ├── storage.ts          # Data storage interface
│   └── vite.ts             # Vite integration
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Database schema and validation
└── package.json            # Project dependencies and scripts
```

## Usage

### Uploading Shipment Data

1. Click **"Upload CSV"** to open the upload dialog
2. Choose between:
   - **"Upload Only"**: Validate CSV format without processing
   - **"Upload & Process"**: Upload and immediately load data
3. Or use **"Generate Shipment Details"** for sample data

### Expected CSV Format

Your CSV file should include these columns:
- `Plant` - Plant identifier
- `Mill` - Mill identifier  
- `Date` - Shipment date (YYYY-MM-DD)
- `DayOfWeek` - Day of the week
- `TruckNumber` - Truck identifier
- `SKU` - Stock Keeping Unit
- `NumberOfRolls` - Number of rolls
- `Tons` - Weight in tons

### Managing Shipments

- **View**: Browse shipments in an interactive table
- **Group**: Organize by Plant, Mill, SKU, or Truck
- **Search**: Filter shipments using the search bar
- **Select**: Choose multiple shipments for bulk actions
- **Approve/Reject**: Update shipment status individually or in bulk
- **Export**: Download accepted shipments as CSV

## Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run check        # Type check TypeScript
npm run db:push      # Push database schema changes
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions for various platforms including Azure, AWS, and others.

### Environment Variables

Required environment variables:

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:port/database
PORT=5000
```

Optional:
```env
SESSION_SECRET=your-secret-key-here
```

## API Endpoints

- `GET /api/shipments` - Fetch all shipments
- `GET /api/shipments/:id` - Fetch single shipment
- `POST /api/shipments` - Create new shipment
- `PATCH /api/shipments/:id/status` - Update shipment status
- `PATCH /api/shipments/bulk-status` - Bulk status updates
- `POST /api/csv/upload` - Upload CSV file for validation
- `POST /api/optimization/run` - Process CSV data and load into system
- `GET /api/shipments/export` - Export accepted shipments as CSV

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and add tests
4. Commit your changes: `git commit -m 'Add feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please contact KVS Technologies or create an issue in this repository.