import { shipments, type Shipment, type InsertShipment, type UpdateShipmentStatus, type BulkStatusUpdate } from "@shared/schema";

export interface IStorage {
  // Shipment operations
  getAllShipments(): Promise<Shipment[]>;
  getShipmentById(id: number): Promise<Shipment | undefined>;
  createShipment(shipment: InsertShipment): Promise<Shipment>;
  updateShipmentStatus(id: number, status: UpdateShipmentStatus): Promise<Shipment | undefined>;
  bulkUpdateShipmentStatus(update: BulkStatusUpdate): Promise<Shipment[]>;
  deleteAllShipments(): Promise<void>;
  getShipmentsByStatus(status: string): Promise<Shipment[]>;
  
  // User operations (existing)
  getUser(id: number): Promise<any>;
  getUserByUsername(username: string): Promise<any>;
  createUser(user: any): Promise<any>;
}

export class MemStorage implements IStorage {
  private shipments: Map<number, Shipment>;
  private currentShipmentId: number;
  private users: Map<number, any>;
  currentId: number;

  constructor() {
    this.shipments = new Map();
    this.currentShipmentId = 1;
    this.users = new Map();
    this.currentId = 1;
  }

  // Shipment operations
  async getAllShipments(): Promise<Shipment[]> {
    return Array.from(this.shipments.values()).sort((a, b) => a.id - b.id);
  }

  async getShipmentById(id: number): Promise<Shipment | undefined> {
    return this.shipments.get(id);
  }

  async createShipment(insertShipment: InsertShipment): Promise<Shipment> {
    const id = this.currentShipmentId++;
    const shipment: Shipment = { 
      ...insertShipment, 
      id,
      status: "pending" 
    };
    this.shipments.set(id, shipment);
    return shipment;
  }

  async updateShipmentStatus(id: number, statusUpdate: UpdateShipmentStatus): Promise<Shipment | undefined> {
    const shipment = this.shipments.get(id);
    if (!shipment) return undefined;
    
    const updatedShipment: Shipment = { ...shipment, status: statusUpdate.status };
    this.shipments.set(id, updatedShipment);
    return updatedShipment;
  }

  async bulkUpdateShipmentStatus(update: BulkStatusUpdate): Promise<Shipment[]> {
    const updatedShipments: Shipment[] = [];
    
    for (const id of update.ids) {
      const shipment = this.shipments.get(id);
      if (shipment) {
        const updatedShipment: Shipment = { ...shipment, status: update.status };
        this.shipments.set(id, updatedShipment);
        updatedShipments.push(updatedShipment);
      }
    }
    
    return updatedShipments;
  }

  async deleteAllShipments(): Promise<void> {
    this.shipments.clear();
    this.currentShipmentId = 1;
  }

  async getShipmentsByStatus(status: string): Promise<Shipment[]> {
    return Array.from(this.shipments.values()).filter(s => s.status === status);
  }

  // User operations (existing)
  async getUser(id: number): Promise<any> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<any> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: any): Promise<any> {
    const id = this.currentId++;
    const user: any = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
}

export const storage = new MemStorage();
