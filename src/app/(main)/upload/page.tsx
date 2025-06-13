import { InvoiceUploadClient } from '@/components/features/invoice-upload/InvoiceUploadClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = {
  title: 'Upload Invoices - InvoicePilot',
};

export default function UploadPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upload Invoices</h1>
        <p className="text-muted-foreground">
          Upload PDF or image files of your invoices for AI processing. You can upload multiple files at once.
        </p>
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
