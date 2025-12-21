/**
 * @file csv-parser.ts
 * @description Client-side CSV parsing utilities for importing employees, inventory, and models via file upload.
 * Provides typed parsers with header mapping and validation for each entity type.
 * @path /lib/csv-parser.ts
 */

import { Employee, AssetCreate, ModelCreate } from "@/lib/types";

export type ParsedModel = ModelCreate;

export interface ParsedEmployee extends Omit<Employee, "id"> {
  id?: string;
}

export type ParsedAsset = AssetCreate;

export async function parseEmployeesCsv(file: File): Promise<ParsedEmployee[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) {
          resolve([]);
          return;
        }

        const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");
        if (lines.length < 2) {
          reject(new Error("CSV file is empty or missing headers"));
          return;
        }

        // naive CSV parsing assuming standard format (comma separated, no quoted commas yet)
        // For a more robust solution, a library like papaparse is recommended, but we'll stick to simple split for now as per instructions (no new deps unless needed)
        const headers = lines[0].split(",").map((h) => h.trim());
        
        // Expected headers mapping
        const headerMap: Record<string, string> = {
            "fullname": "fullName",
            "full name": "fullName",
            "name": "fullName",
            "email": "email",
            "department": "department",
            "position": "position",
            "role": "position",
            "job title": "position"
        };

        const mappedHeaders = headers.map(h => headerMap[h.toLowerCase()] || h);

        const result: ParsedEmployee[] = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(",").map((v) => v.trim());
          if (values.length !== headers.length) continue; // Skip malformed lines

          const entry: Partial<ParsedEmployee> = {};
          mappedHeaders.forEach((header, index) => {
             // Only map known fields
             if (["fullName", "email", "department", "position"].includes(header)) {
                 (entry as Record<string, string>)[header] = values[index];
             }
          });
          
          if (entry.fullName && entry.email) {
            result.push(entry as ParsedEmployee);
          }
        }

        resolve(result);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsText(file);
  });
}

export async function parseInventoryCsv(file: File): Promise<ParsedAsset[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
  
      reader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          if (!text) {
            resolve([]);
            return;
          }
  
          const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");
          if (lines.length < 2) {
            reject(new Error("CSV file is empty or missing headers"));
            return;
          }
  
          const headers = lines[0].split(",").map((h) => h.trim());
          
          // Expected headers mapping
          const headerMap: Record<string, string> = {
              "category": "category",
              "make": "make",
              "brand": "make",
              "model": "model",
              "service tag": "servicetag",
              "servicetag": "servicetag",
              "tag": "servicetag",
              "serial number": "servicetag",
              "sn": "servicetag",
              "employee": "employee",
              "assigned to": "employee",
              "user": "employee",
              "state": "state",
              "status": "state",
              "location": "location",
              "warranty": "warrantyexpiry",
              "warranty expiry": "warrantyexpiry",
              "comments": "additionalcomments",
              "notes": "additionalcomments",
              "cpu": "cpu",
              "processor": "cpu",
              "ram": "ram",
              "memory": "ram",
              "storage": "storage",
              "disk": "storage"
          };
  
          const mappedHeaders = headers.map(h => headerMap[h.toLowerCase()] || h.toLowerCase().replace(/ /g, ""));
  
          const result: ParsedAsset[] = [];
  
          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(",").map((v) => v.trim());
            if (values.length !== headers.length) continue; 
  
            const entry: Record<string, string> = {};
            mappedHeaders.forEach((header, index) => {
               // Only map known fields
               if (["category", "make", "model", "servicetag", "employee", "state", "location", "warrantyexpiry", "additionalcomments", "cpu", "ram", "storage"].includes(header)) {
                   entry[header] = values[index];
               }
            });
            
            // Basic validation: ensure required fields have at least default values or are present
            if (entry.make || entry.model || entry.servicetag) {
                // Apply defaults for missing required fields
                const asset: ParsedAsset = {
                    category: entry.category || "Laptop",
                    make: entry.make || "Unknown",
                    model: entry.model || "Unknown",
                    servicetag: entry.servicetag || `TAG-${Math.floor(Math.random() * 10000)}`,
                    state: entry.state || "GOOD",
                    location: entry.location || "Office",
                    employee: entry.employee || "",
                    warrantyexpiry: entry.warrantyexpiry || "",
                    additionalcomments: entry.additionalcomments || "",
                    cpu: entry.cpu || "",
                    ram: entry.ram || "",
                    storage: entry.storage || "",
                    dedicatedgpu: entry.dedicatedgpu || "",
                    "usb-aports": entry["usb-aports"] || "",
                    "usb-cports": entry["usb-cports"] || "",
                    dimensions: "",
                    resolution: "",
                    refreshhertz: ""
                };
                result.push(asset);
            }
          }
  
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
  
      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };
  
      reader.readAsText(file);
    });
  }

export async function parseModelsCsv(file: File): Promise<ParsedModel[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) {
          resolve([]);
          return;
        }

        const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");
        if (lines.length < 2) {
          reject(new Error("CSV file is empty or missing headers"));
          return;
        }

        const headers = lines[0].split(",").map((h) => h.trim());
        
        // Expected headers mapping
        const headerMap: Record<string, string> = {
            "name": "name",
            "model name": "name",
            "model": "name",
            "category": "category",
            "type": "category",
            "make": "make",
            "brand": "make",
            "manufacturer": "make",
            "cpu": "cpu",
            "processor": "cpu",
            "ram": "ram",
            "memory": "ram",
            "storage": "storage",
            "disk": "storage",
            "ssd": "storage",
            "hdd": "storage",
            "dedicated gpu": "dedicatedgpu",
            "dedicatedgpu": "dedicatedgpu",
            "gpu": "dedicatedgpu",
            "graphics": "dedicatedgpu",
            "usb-a ports": "usb-aports",
            "usb-aports": "usb-aports",
            "usb a": "usb-aports",
            "usb-c ports": "usb-cports",
            "usb-cports": "usb-cports",
            "usb c": "usb-cports",
            "dimensions": "dimensions",
            "size": "dimensions",
            "resolution": "resolution",
            "display": "resolution",
            "refresh rate": "refreshhertz",
            "refreshhertz": "refreshhertz",
            "hz": "refreshhertz"
        };

        const mappedHeaders = headers.map(h => headerMap[h.toLowerCase()] || h.toLowerCase().replace(/ /g, ""));

        const result: ParsedModel[] = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(",").map((v) => v.trim());
          if (values.length !== headers.length) continue; 

          const entry: Record<string, string> = {};
          mappedHeaders.forEach((header, index) => {
             // Only map known fields
             if (["name", "category", "make", "cpu", "ram", "storage", "dedicatedgpu", "usb-aports", "usb-cports", "dimensions", "resolution", "refreshhertz"].includes(header)) {
                 entry[header] = values[index];
             }
          });
          
          // Basic validation: ensure required fields have at least default values or are present
          if (entry.name || entry.make) {
              // Apply defaults for missing required fields
              const model: ParsedModel = {
                  name: entry.name || "Unknown Model",
                  category: entry.category || "Laptop",
                  make: entry.make || "Unknown",
                  cpu: entry.cpu || "",
                  ram: entry.ram || "",
                  storage: entry.storage || "",
                  dedicatedgpu: entry.dedicatedgpu || "",
                  "usb-aports": entry["usb-aports"] || "",
                  "usb-cports": entry["usb-cports"] || "",
                  dimensions: entry.dimensions || "",
                  resolution: entry.resolution || "",
                  refreshhertz: entry.refreshhertz || ""
              };
              result.push(model);
          }
        }

        resolve(result);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsText(file);
  });
}
