'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { getInvoiceById, updateInvoice } from '@/lib/invoice-store';
import type { StoredInvoice } from '@/types/invoice';
import type { ExtractInvoiceDataOutput } from '@/ai/flows/extract-invoice-data';
import { Download, Save, Trash2, PlusCircle, Loader2 } from 'lucide-react';

const lineItemSchema = z.object({
  description: z.string().min(1, 'Description is required.'),
  amount: z.number().positive('Amount must be positive.'),
});

const invoiceFormSchema = z.object({
  invoiceNumber: z.string().min(1, 'Invoice number is required.'),
  vendorName: z.string().min(1, 'Vendor name is required.'),
  date: z.string().min(1, 'Date is required.'), // Consider date validation/parsing
  lineItems: z.array(lineItemSchema).min(1, 'At least one line item is required.'),
  totalAmount: z.number().positive('Total amount must be positive.'),
  taxInformation: z.string().optional(),
});

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

interface InvoiceViewClientProps {
  invoiceId: string;
}

export function InvoiceViewClient({ invoiceId }: InvoiceViewClientProps) {
  const [invoice, setInvoice] = useState<StoredInvoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      invoiceNumber: '',
      vendorName: '',
      date: '',
      lineItems: [{ description: '', amount: 0 }],
      totalAmount: 0,
      taxInformation: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'lineItems',
  });

  useEffect(() => {
    const fetchedInvoice = getInvoiceById(invoiceId);
    if (fetchedInvoice) {
      setInvoice(fetchedInvoice);
      if (fetchedInvoice.extractedData) {
        // Format date for input type="date" if needed, assuming YYYY-MM-DD from AI
        let displayDate = fetchedInvoice.extractedData.date;
        try {
          const parsedDate = new Date(fetchedInvoice.extractedData.date);
          if (!isNaN(parsedDate.getTime())) {
             // Check if it's a valid date string that new Date() can parse
             // and convert to YYYY-MM-DD for <input type="date">
             const year = parsedDate.getFullYear();
             const month = (parsedDate.getMonth() + 1).toString().padStart(2, '0');
             const day = parsedDate.getDate().toString().padStart(2, '0');
             displayDate = `${year}-${month}-${day}`;
          } else {
            // If AI output is not a parsable date string, keep it as is, or clear it.
            // For simplicity, we keep it. User might need to correct it.
          }
        } catch (e) {
          // Date parsing failed, keep original
        }

        form.reset({
          ...fetchedInvoice.extractedData,
          date: displayDate, 
          lineItems: fetchedInvoice.extractedData.lineItems?.length > 0 
            ? fetchedInvoice.extractedData.lineItems 
            : [{ description: '', amount: 0 }], // Ensure at least one line item for the form
        });
      }
    } else {
      toast({
        title: 'Error',
        description: 'Invoice not found.',
        variant: 'destructive',
      });
      router.push('/dashboard');
    }
    setIsLoading(false);
  }, [invoiceId, form, router, toast]);

  const handleSaveChanges: SubmitHandler<InvoiceFormValues> = (data) => {
    if (!invoice) return;
    setIsSaving(true);

    const updatedInvoiceData: ExtractInvoiceDataOutput = {
      ...data,
      // Potentially reformat date back to AI's original format if needed, or keep YYYY-MM-DD
      date: data.date, 
    };

    const updatedStoredInvoice: StoredInvoice = {
      ...invoice,
      extractedData: updatedInvoiceData,
      status: 'Completed', // Assuming editing means it's verified/completed
    };
    updateInvoice(updatedStoredInvoice);
    setInvoice(updatedStoredInvoice); // Update local state
    setIsSaving(false);
    toast({
      title: 'Changes Saved',
      description: 'Invoice details have been updated.',
    });
  };

  const handleExportJson = () => {
    if (!invoice?.extractedData) {
      toast({ title: 'Error', description: 'No data to export.', variant: 'destructive' });
      return;
    }
    const jsonData = JSON.stringify(form.getValues(), null, 2); // Export current form values
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${invoice.fileName.split('.')[0]}_quickbooks.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: 'Export Successful', description: 'Invoice data exported as JSON.' });
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /> <span className="ml-2">Loading invoice data...</span></div>;
  }

  if (!invoice) {
    return <p>Invoice not found.</p>;
  }
  
  if (invoice.status === 'Error') {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Processing Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>There was an error processing this invoice: <span className="font-medium">{invoice.errorMessage}</span></p>
          <p className="mt-2">Please try uploading the file again or check the file format.</p>
        </CardContent>
      </Card>
    );
  }

  if (!invoice.extractedData && invoice.status !== 'Error') {
     return <p>No extracted data available for this invoice. It might still be processing or encountered an issue.</p>;
  }


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSaveChanges)} className="space-y-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <FormField
            control={form.control}
            name="invoiceNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Invoice Number</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="vendorName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vendor Name</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Invoice Date</FormLabel>
                <FormControl><Input type="date" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        <div>
          <h3 className="text-xl font-semibold mb-4">Line Items</h3>
          {fields.map((item, index) => (
            <div key={item.id} className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-4 mb-4 p-4 border rounded-md items-end">
              <FormField
                control={form.control}
                name={`lineItems.${index}.description`}
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormLabel>Description</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`lineItems.${index}.amount`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl><Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} aria-label="Remove line item" className="text-destructive hover:bg-destructive/10">
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => append({ description: '', amount: 0 })}
            className="mt-2"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Add Line Item
          </Button>
        </div>

        <Separator />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="totalAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Amount</FormLabel>
                <FormControl><Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="taxInformation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tax Information (Optional)</FormLabel>
                <FormControl><Textarea {...field} placeholder="e.g., VAT 20%, Sales Tax $10.00" /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 justify-end pt-4">
          <Button type="button" variant="outline" onClick={handleExportJson} disabled={isSaving}>
            <Download className="mr-2 h-4 w-4" /> Export to JSON
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  );
}
