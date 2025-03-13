export interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  
  // Company Information
  companyName: string;
  companyAddress: string;
  companyEmail: string;
  companyPhone: string;
  
  // Client Information
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  
  items: InvoiceItem[];
  subtotal?: number;
  tax?: number;
  total?: number;
  notes?: string;
  terms?: string;
} 