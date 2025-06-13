import type { ExtractInvoiceDataOutput } from '@/ai/flows/extract-invoice-data';

export interface InvoiceLineItem {
  description: string;
  amount: number;
}

export interface StoredInvoice {
  id: string; 
  fileName: string;
  uploadDate: string; // ISO string
  status: 'Pending' | 'Processing' | 'Completed' | 'Error';
  extractedData?: ExtractInvoiceDataOutput;
  errorMessage?: string;
}
