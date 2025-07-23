# Deployment Guide for Azure

## Overview
This is a complete guide to deploy your Truck Load Optimization application to Microsoft Azure.

## Getting the Code

### Option 1: Download as ZIP (Recommended)
1. In Replit, click the three dots menu (⋯) next to your project name
2. Select "Download as ZIP"
3. Extract the ZIP file on your local machine

### Option 2: Git Clone (If connected to GitHub)
```bash
git clone <your-repo-url>
cd <project-directory>
```

## Project Structure
```
truck-load-optimization/
├── client/                 # React frontend
│   ├── src/
│   ├── index.html
│   └── package.json
├── server/                 # Express backend
│   ├── index.ts
│   ├── routes.ts
│   └── storage.ts
├── shared/                 # Shared types
│   └── schema.ts
├── package.json           # Root package.json
├── vite.config.ts         # Build configuration
└── drizzle.config.ts      # Database configuration
```

## Azure Deployment Options

### Option 1: Azure App Service (Recommended)

#### Prerequisites
- Azure account
- Azure CLI installed
- Node.js 20+ installed locally

#### Steps

1. **Install Azure CLI** (if not already installed)
   ```bash
   # Windows
   winget install Microsoft.AzureCLI
   
   # macOS
   brew install azure-cli
   
   # Ubuntu/Debian
   curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
   ```

2. **Login to Azure**
   ```bash
   az login
   ```

3. **Create Resource Group**
   ```bash
   az group create --name truck-optimization-rg --location "East US"
   ```

4. **Create App Service Plan**
   ```bash
   az appservice plan create \
     --name truck-optimization-plan \
     --resource-group truck-optimization-rg \
     --sku B1 \
     --is-linux
   ```

5. **Create Web App**
   ```bash
   az webapp create \
     --name truck-optimization-app \
     --resource-group truck-optimization-rg \
     --plan truck-optimization-plan \
     --runtime "NODE:20-lts"
   ```

6. **Configure Environment Variables**
   ```bash
   az webapp config appsettings set \
     --name truck-optimization-app \
     --resource-group truck-optimization-rg \
     --settings NODE_ENV=production
   ```

7. **Deploy the Application**
   ```bash
   # In your project directory
   npm run build
   az webapp deployment source config-zip \
     --name truck-optimization-app \
     --resource-group truck-optimization-rg \
     --src dist.zip
   ```

### Option 2: Azure Container Instances

#### Create Dockerfile
Create this file in your project root:

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
```

#### Deploy Container
```bash
# Build and push to Azure Container Registry
az acr create --name truckoptimizationacr --resource-group truck-optimization-rg --sku Basic
az acr build --registry truckoptimizationacr --image truck-optimization:latest .

# Create container instance
az container create \
  --name truck-optimization-container \
  --resource-group truck-optimization-rg \
  --image truckoptimizationacr.azurecr.io/truck-optimization:latest \
  --dns-name-label truck-optimization \
  --ports 5000
```

### Option 3: Azure Static Web Apps + Azure Functions

This option separates the frontend and backend:

1. **Deploy Frontend to Static Web Apps**
   - Build: `npm run build`
   - Upload the `dist/public` folder to Azure Static Web Apps

2. **Deploy Backend as Azure Functions**
   - Convert Express routes to Azure Functions
   - Deploy using Azure Functions extension

## Database Setup

### Option 1: Azure Database for PostgreSQL
```bash
az postgres server create \
  --name truck-optimization-db \
  --resource-group truck-optimization-rg \
  --location "East US" \
  --admin-user dbadmin \
  --admin-password <your-password> \
  --sku-name B_Gen5_1
```

### Option 2: Continue using Neon (Recommended)
- Keep your existing DATABASE_URL
- No changes needed to the application

## Environment Variables

Set these in your Azure App Service:

```bash
# Required
NODE_ENV=production
DATABASE_URL=<your-database-connection-string>

# Optional (if using session storage)
SESSION_SECRET=<random-secret-key>
```

## Build Script Configuration

Ensure your `package.json` has these scripts:
```json
{
  "scripts": {
    "build": "npm run build:client && npm run build:server",
    "build:client": "vite build",
    "build:server": "esbuild server/index.ts --bundle --platform=node --outfile=dist/index.js --external:pg-native",
    "start": "node dist/index.js"
  }
}
```

## Post-Deployment Steps

1. **Test the Application**
   - Visit your Azure App Service URL
   - Test CSV upload functionality
   - Verify database connectivity

2. **Configure Custom Domain** (Optional)
   ```bash
   az webapp config hostname add \
     --webapp-name truck-optimization-app \
     --resource-group truck-optimization-rg \
     --hostname your-domain.com
   ```

3. **Set up SSL Certificate**
   ```bash
   az webapp config ssl bind \
     --name truck-optimization-app \
     --resource-group truck-optimization-rg \
     --certificate-thumbprint <thumbprint> \
     --ssl-type SNI
   ```

## Monitoring and Logs

1. **Enable Application Insights**
   ```bash
   az monitor app-insights component create \
     --app truck-optimization-insights \
     --location "East US" \
     --resource-group truck-optimization-rg
   ```

2. **View Logs**
   ```bash
   az webapp log tail \
     --name truck-optimization-app \
     --resource-group truck-optimization-rg
   ```

## Cost Optimization

- **Basic App Service Plan (B1)**: ~$13/month
- **Azure Database for PostgreSQL (Basic)**: ~$25/month
- **Storage and bandwidth**: Minimal for this application

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Ensure Node.js 20+ is specified in runtime
   - Check for missing dependencies in package.json

2. **Database Connection Issues**
   - Verify DATABASE_URL is correctly set
   - Check firewall rules for PostgreSQL

3. **File Upload Issues**
   - Ensure proper file size limits in Azure App Service
   - Check for CORS configuration if needed

### Support Commands

```bash
# Check app status
az webapp show --name truck-optimization-app --resource-group truck-optimization-rg

# Restart app
az webapp restart --name truck-optimization-app --resource-group truck-optimization-rg

# View app settings
az webapp config appsettings list --name truck-optimization-app --resource-group truck-optimization-rg
```

## Security Best Practices

1. **Environment Variables**: Never commit sensitive data to git
2. **Database Access**: Use connection strings with proper authentication
3. **HTTPS**: Always enable SSL/TLS for production
4. **Updates**: Keep dependencies updated regularly

## Backup Strategy

1. **Database Backups**: Azure PostgreSQL provides automatic backups
2. **Application Code**: Use Git for version control
3. **Configuration**: Document all environment variables and settings

## Next Steps

After successful deployment:
1. Set up monitoring and alerts
2. Configure automated backups
3. Set up CI/CD pipeline for future updates
4. Consider implementing Redis for session storage in production