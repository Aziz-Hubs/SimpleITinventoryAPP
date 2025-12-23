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

// Redefine ParsedAsset to match the flat CSV structure, which differs from the nested/relational AssetCreate
export interface ParsedAsset {
  category: string;
  make: string;
  model: string;
  serviceTag: string;
  state: string;
  location: string;
  employee: string;
  warrantyExpiry: string;
  notes: string;
  cpu: string;
  ram: string;
  storage: string;
  dedicatedGpu: string;
  usbAPorts: string;
  usbCPorts: string;
  dimensions: string;
  resolution: string;
  refreshHertz: string;
}

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
              "service tag": "serviceTag",
              "servicetag": "serviceTag",
              "tag": "serviceTag",
              "serial number": "serviceTag",
              "sn": "serviceTag",
              "employee": "employee",
              "assigned to": "employee",
              "user": "employee",
              "state": "state",
              "status": "state",
              "location": "location",
              "warranty": "warrantyExpiry",
              "warranty expiry": "warrantyExpiry",
              "comments": "notes",
              "notes": "notes",
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
               // Map fields
               entry[header] = values[index];
            });
            
            // Basic validation
            if (entry.make || entry.model || entry.serviceTag) {
                const asset: ParsedAsset = {
                    category: entry.category || "Laptop",
                    make: entry.make || "Unknown",
                    model: entry.model || "Unknown",
                    serviceTag: entry.serviceTag || `TAG-${Math.floor(Math.random() * 10000)}`,
                    state: entry.state || "GOOD",
                    location: entry.location || "Office",
                    employee: entry.employee || "",
                    warrantyExpiry: entry.warrantyExpiry || "",
                    notes: entry.notes || "",
                    cpu: entry.cpu || "",
                    ram: entry.ram || "",
                    storage: entry.storage || "",
                    dedicatedGpu: entry.dedicatedgpu || "", // CSV header mapping might return 'dedicatedgpu' (lowercase), verify below
                    usbAPorts: entry["usb-aports"] || "",
                    usbCPorts: entry["usb-cports"] || "",
                    dimensions: "",
                    resolution: "",
                    refreshHertz: ""
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
          
          if (entry.name || entry.make) {
              const model: ParsedModel = {
                  name: entry.name || "Unknown Model",
                  category: entry.category || "Laptop",
                  make: entry.make || "Unknown",
                  specs: {
                    cpu: entry.cpu,
                    ram: entry.ram,
                    storage: entry.storage,
                    dedicatedgpu: entry.dedicatedgpu,
                    "usb-aports": entry["usb-aports"],
                    "usb-cports": entry["usb-cports"],
                    dimensions: entry.dimensions,
                    resolution: entry.resolution,
                    refreshhertz: entry.refreshhertz
                  }
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
