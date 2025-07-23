import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const shipments = pgTable("shipments", {
  id: serial("id").primaryKey(),
  plant: text("plant").notNull(),
  mill: text("mill").notNull(),
  date: text("date").notNull(),
  dayOfWeek: text("day_of_week").notNull(),
  truckNumber: text("truck_number").notNull(),
  sku: text("sku").notNull(),
  numberOfRolls: integer("number_of_rolls").notNull(),
  tons: integer("tons").notNull(),
  status: text("status").notNull().default("pending"), // pending, accepted, rejected
});

export const insertShipmentSchema = createInsertSchema(shipments).omit({
  id: true,
  status: true,
});

export const updateShipmentStatusSchema = z.object({
  status: z.enum(["pending", "accepted", "rejected"]),
});

export type InsertShipment = z.infer<typeof insertShipmentSchema>;
export type Shipment = typeof shipments.$inferSelect;
export type UpdateShipmentStatus = z.infer<typeof updateShipmentStatusSchema>;

// For bulk operations
export const bulkStatusUpdateSchema = z.object({
  ids: z.array(z.number()),
  status: z.enum(["accepted", "rejected"]),
});

export type BulkStatusUpdate = z.infer<typeof bulkStatusUpdateSchema>;
