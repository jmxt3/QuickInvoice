import { InvoiceViewClient } from '@/components/features/invoice-view/InvoiceViewClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Invoice Details - InvoicePilot',
};

interface InvoiceDetailsPageProps {
  params: {
    id: string;
  };
}

export default function InvoiceDetailsPage({ params }: InvoiceDetailsPageProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/dashboard" passHref>
            <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
          <CardDescription>Review and edit the extracted invoice information. Click "Save Changes" to update or "Export to JSON" for QuickBooks.</CardDescription>
        </CardHeader>
        <CardContent>
          <InvoiceViewClient invoiceId={params.id} />
        </CardContent>
      </Card>
    </div>
  );
}
