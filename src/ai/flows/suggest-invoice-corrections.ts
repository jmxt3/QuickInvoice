// src/ai/flows/suggest-invoice-corrections.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting corrections to extracted invoice data.
 *
 * - suggestInvoiceCorrections - An async function that takes extracted invoice data as input and returns suggested corrections.
 * - SuggestInvoiceCorrectionsInput - The input type for the suggestInvoiceCorrections function.
 * - SuggestInvoiceCorrectionsOutput - The return type for the suggestInvoiceCorrections function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestInvoiceCorrectionsInputSchema = z.object({
  invoiceData: z.record(z.any()).describe('The extracted invoice data to be validated and corrected.'),
});
export type SuggestInvoiceCorrectionsInput = z.infer<typeof SuggestInvoiceCorrectionsInputSchema>;

const SuggestInvoiceCorrectionsOutputSchema = z.object({
  correctedData: z.record(z.any()).describe('The invoice data with suggested corrections.'),
  confidence: z.number().describe('A confidence score for the suggested corrections (0-1).'),
});
export type SuggestInvoiceCorrectionsOutput = z.infer<typeof SuggestInvoiceCorrectionsOutputSchema>;

export async function suggestInvoiceCorrections(input: SuggestInvoiceCorrectionsInput): Promise<SuggestInvoiceCorrectionsOutput> {
  return suggestInvoiceCorrectionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestInvoiceCorrectionsPrompt',
  input: {schema: SuggestInvoiceCorrectionsInputSchema},
  output: {schema: SuggestInvoiceCorrectionsOutputSchema},
  prompt: `You are an AI assistant specialized in reviewing extracted invoice data and suggesting corrections.
  Review the following extracted invoice data and provide suggestions for corrections, if any. Return the corrected data and a confidence score (0-1) for your suggestions.

  Extracted Invoice Data: {{{invoiceData}}}
  `,
});

const suggestInvoiceCorrectionsFlow = ai.defineFlow(
  {
    name: 'suggestInvoiceCorrectionsFlow',
    inputSchema: SuggestInvoiceCorrectionsInputSchema,
    outputSchema: SuggestInvoiceCorrectionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
