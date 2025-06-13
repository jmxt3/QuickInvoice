import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-invoice-corrections.ts';
import '@/ai/flows/extract-invoice-data.ts';