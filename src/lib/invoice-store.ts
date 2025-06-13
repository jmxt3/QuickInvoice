'use client';

import type { StoredInvoice } from '@/types/invoice';

const INVOICES_STORAGE_KEY = 'invoicepilot_invoices';

export function getInvoices(): StoredInvoice[] {
  if (typeof window === 'undefined') {
    return [];
  }
  const storedInvoices = localStorage.getItem(INVOICES_STORAGE_KEY);
  return storedInvoices ? JSON.parse(storedInvoices) : [];
}

export function saveInvoices(invoices: StoredInvoice[]): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(invoices));
}

export function addInvoice(invoice: StoredInvoice): void {
  const invoices = getInvoices();
  saveInvoices([invoice, ...invoices]);
}

export function updateInvoice(updatedInvoice: StoredInvoice): void {
  const invoices = getInvoices();
  const invoiceIndex = invoices.findIndex((inv) => inv.id === updatedInvoice.id);
  if (invoiceIndex > -1) {
    invoices[invoiceIndex] = updatedInvoice;
    saveInvoices(invoices);
  }
}

export function getInvoiceById(id: string): StoredInvoice | undefined {
  const invoices = getInvoices();
  return invoices.find((invoice) => invoice.id === id);
}

export function deleteInvoice(id: string): void {
  let invoices = getInvoices();
  invoices = invoices.filter(invoice => invoice.id !== id);
  saveInvoices(invoices);
}
