'use server';

/**
 * @fileOverview This file defines a Genkit flow for automatically extracting data from invoices using AI.
 *
 * - extractInvoiceData - A function that handles the invoice data extraction process.
 * - ExtractInvoiceDataInput - The input type for the extractInvoiceData function.
 * - ExtractInvoiceDataOutput - The return type for the extractInvoiceData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractInvoiceDataInputSchema = z.object({
  invoiceDataUri: z
    .string()
    .describe(
      "The invoice, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractInvoiceDataInput = z.infer<typeof ExtractInvoiceDataInputSchema>;

const ExtractInvoiceDataOutputSchema = z.object({
  invoiceNumber: z.string().describe('The invoice number.'),
  vendorName: z.string().describe('The name of the vendor.'),
  date: z.string().describe('The invoice date.'),
  lineItems: z
    .array(
      z.object({
        description: z.string().describe('The description of the line item.'),
        amount: z.number().describe('The amount of the line item.'),
      })
    )
    .describe('The line items in the invoice.'),
  totalAmount: z.number().describe('The total amount of the invoice.'),
  taxInformation: z.string().optional().describe('The tax information, if present.'),
});
export type ExtractInvoiceDataOutput = z.infer<typeof ExtractInvoiceDataOutputSchema>;

export async function extractInvoiceData(input: ExtractInvoiceDataInput): Promise<ExtractInvoiceDataOutput> {
  return extractInvoiceDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractInvoiceDataPrompt',
  input: {schema: ExtractInvoiceDataInputSchema},
  output: {schema: ExtractInvoiceDataOutputSchema},
  prompt: `You are an expert AI assistant specializing in extracting data from invoices. Extract the following information from the invoice:

- Invoice number
- Vendor name
- Date
- Line items (description and amount)
- Total amount
- Tax information (if present)

Invoice: {{media url=invoiceDataUri}}

Return the data in JSON format.`,
});

const extractInvoiceDataFlow = ai.defineFlow(
  {
    name: 'extractInvoiceDataFlow',
    inputSchema: ExtractInvoiceDataInputSchema,
    outputSchema: ExtractInvoiceDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
