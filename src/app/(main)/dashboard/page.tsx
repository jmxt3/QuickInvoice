
import { InvoiceListClient } from '@/components/features/dashboard/InvoiceListClient';
import { DashboardSummary } from '@/components/features/dashboard/DashboardSummary';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';

export const metadata = {
  title: 'Dashboard - InvoicePilot',
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your processed invoices.</p>
        </div>
        <Link href="/upload" passHref>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Upload New Invoice
          </Button>
        </Link>
      </div>

      <DashboardSummary />
      
      <Card>
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
          <CardDescription>View and manage your uploaded invoices.</CardDescription>
        </CardHeader>
        <CardContent>
          <InvoiceListClient />
        </CardContent>
      </Card>
    </div>
  );
}
