import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertShipmentSchema, updateShipmentStatusSchema, bulkStatusUpdateSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import { parse } from "csv-parse/sync";

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure multer for file uploads
  const upload = multer({ 
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
      if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
        cb(null, true);
      } else {
        cb(new Error('Only CSV files are allowed'));
      }
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
  });
  
  // Get all shipments
  app.get("/api/shipments", async (req, res) => {
    try {
      const shipments = await storage.getAllShipments();
      res.json(shipments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch shipments" });
    }
  });

  // Get shipment by ID
  app.get("/api/shipments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const shipment = await storage.getShipmentById(id);
      
      if (!shipment) {
        return res.status(404).json({ message: "Shipment not found" });
      }
      
      res.json(shipment);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch shipment" });
    }
  });

  // Create shipment
  app.post("/api/shipments", async (req, res) => {
    try {
      const validatedData = insertShipmentSchema.parse(req.body);
      const shipment = await storage.createShipment(validatedData);
      res.status(201).json(shipment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid shipment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create shipment" });
    }
  });

  // Update shipment status
  app.patch("/api/shipments/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = updateShipmentStatusSchema.parse(req.body);
      
      const updatedShipment = await storage.updateShipmentStatus(id, validatedData);
      
      if (!updatedShipment) {
        return res.status(404).json({ message: "Shipment not found" });
      }
      
      res.json(updatedShipment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid status data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update shipment status" });
    }
  });

  // Bulk update shipment status
  app.patch("/api/shipments/bulk-status", async (req, res) => {
    try {
      const validatedData = bulkStatusUpdateSchema.parse(req.body);
      const updatedShipments = await storage.bulkUpdateShipmentStatus(validatedData);
      res.json(updatedShipments);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid bulk update data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to bulk update shipments" });
    }
  });

  // Upload CSV file only
  app.post("/api/csv/upload", upload.single('csvFile'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Just validate the CSV format without processing
      const csvContent = req.file.buffer.toString();
      const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });

      res.json({ 
        message: "CSV file uploaded successfully", 
        rowCount: records.length,
        filename: req.file.originalname
      });
    } catch (error) {
      console.error('CSV upload error:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to upload CSV file" 
      });
    }
  });

  // Run optimization (load CSV data)
  app.post("/api/optimization/run", upload.single('csvFile'), async (req, res) => {
    try {
      // Clear existing shipments
      await storage.deleteAllShipments();
      
      let csvData = [];
      
      if (req.file) {
        // Parse uploaded CSV file
        const csvContent = req.file.buffer.toString();
        const records = parse(csvContent, {
          columns: true,
          skip_empty_lines: true,
          trim: true
        });
        
        // Transform CSV records to match our schema
        csvData = records.map((record: any) => ({
          plant: record.Plant || record.plant,
          mill: record.Mill || record.mill,
          date: record.Date || record.date,
          dayOfWeek: record.DayOfWeek || record.dayOfWeek,
          truckNumber: record.TruckNumber || record.truckNumber,
          sku: record.SKU || record.sku,
          numberOfRolls: parseInt(record.NumberOfRolls || record.numberOfRolls || '0'),
          tons: parseInt(record.Tons || record.tons || '0')
        }));
      } else {
        // Use sample data if no file uploaded
        csvData = [
          { plant: "Plant_12d99b28", mill: "Mill_e272ad6a", date: "2025-07-03", dayOfWeek: "Thursday", truckNumber: "Truck_6b86b273", sku: "SKU_c154e723", numberOfRolls: 2, tons: 6 },
          { plant: "Plant_12d99b28", mill: "Mill_e272ad6a", date: "2025-07-03", dayOfWeek: "Thursday", truckNumber: "Truck_6b86b273", sku: "SKU_57458d38", numberOfRolls: 3, tons: 9 },
          { plant: "Plant_12d99b28", mill: "Mill_e272ad6a", date: "2025-07-03", dayOfWeek: "Thursday", truckNumber: "Truck_6b86b273", sku: "SKU_22be846e", numberOfRolls: 2, tons: 6 },
          { plant: "Plant_12d99b28", mill: "Mill_e272ad6a", date: "2025-07-03", dayOfWeek: "Thursday", truckNumber: "Truck_d4735e3a", sku: "SKU_3cc82521", numberOfRolls: 5, tons: 15 },
          { plant: "Plant_12d99b28", mill: "Mill_e272ad6a", date: "2025-07-03", dayOfWeek: "Thursday", truckNumber: "Truck_d4735e3a", sku: "SKU_fa4ad148", numberOfRolls: 3, tons: 9 },
          { plant: "Plant_12d99b28", mill: "Mill_e272ad6a", date: "2025-07-03", dayOfWeek: "Thursday", truckNumber: "Truck_4e074085", sku: "SKU_c154e723", numberOfRolls: 2, tons: 6 },
          { plant: "Plant_12d99b28", mill: "Mill_e272ad6a", date: "2025-07-03", dayOfWeek: "Thursday", truckNumber: "Truck_4e074085", sku: "SKU_57458d38", numberOfRolls: 3, tons: 9 },
          { plant: "Plant_12d99b28", mill: "Mill_e272ad6a", date: "2025-07-03", dayOfWeek: "Thursday", truckNumber: "Truck_4e074085", sku: "SKU_22be846e", numberOfRolls: 2, tons: 6 },
          { plant: "Plant_12d99b28", mill: "Mill_e272ad6a", date: "2025-07-03", dayOfWeek: "Thursday", truckNumber: "Truck_4b227777", sku: "SKU_3cc82521", numberOfRolls: 3, tons: 9 },
          { plant: "Plant_12d99b28", mill: "Mill_e272ad6a", date: "2025-07-03", dayOfWeek: "Thursday", truckNumber: "Truck_4b227777", sku: "SKU_fa4ad148", numberOfRolls: 5, tons: 15 },
        ];
      }
      
      // Create shipments from CSV data
      const shipments = [];
      for (const row of csvData) {
        const shipment = await storage.createShipment(row);
        shipments.push(shipment);
      }
      
      res.json({ 
        message: req.file ? "CSV file uploaded and processed successfully" : "Sample data loaded successfully", 
        shipmentsCount: shipments.length, 
        shipments 
      });
    } catch (error) {
      console.error('Optimization error:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to run optimization" 
      });
    }
  });

  // Export accepted shipments as CSV
  app.get("/api/shipments/export", async (req, res) => {
    try {
      const acceptedShipments = await storage.getShipmentsByStatus("accepted");
      
      if (acceptedShipments.length === 0) {
        return res.status(404).json({ message: "No accepted shipments to export" });
      }
      
      // Generate CSV
      const headers = ["Plant", "Mill", "Date", "DayOfWeek", "TruckNumber", "SKU", "NumberOfRolls", "Tons"];
      const csvRows = acceptedShipments.map(shipment => [
        shipment.plant,
        shipment.mill,
        shipment.date,
        shipment.dayOfWeek,
        shipment.truckNumber,
        shipment.sku,
        shipment.numberOfRolls,
        shipment.tons
      ]);
      
      const csvContent = [headers, ...csvRows].map(row => row.join(",")).join("\n");
      
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=accepted_shipments.csv");
      res.send(csvContent);
    } catch (error) {
      res.status(500).json({ message: "Failed to export shipments" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
