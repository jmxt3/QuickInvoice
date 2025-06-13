
import { InvoiceUploadClient } from '@/components/features/invoice-upload/InvoiceUploadClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Upload Invoices - InvoicePilot',
};

export default function UploadPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Upload Invoices</h1>
          <p className="text-muted-foreground">
            Upload PDF or image files of your invoices for AI processing. You can upload multiple files at once.
          </p>
        </div>
        <Link href="/dashboard" passHref>
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>New Invoice Upload</CardTitle>
          <CardDescription>Select invoice files (PDF, PNG, JPG) to extract data.</CardDescription>
        </CardHeader>
        <CardContent>
          <InvoiceUploadClient />
        </CardContent>
      </Card>
    </div>
  );
}
