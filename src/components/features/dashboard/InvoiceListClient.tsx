'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getInvoices, deleteInvoice as deleteInvoiceFromStore } from '@/lib/invoice-store';
import type { StoredInvoice } from '@/types/invoice';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { MoreHorizontal, Edit3, Trash2, Eye } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export function InvoiceListClient() {
  const [invoices, setInvoices] = useState<StoredInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setInvoices(getInvoices());
    setIsLoading(false);
  }, []);

  const handleDelete = (id: string) => {
    deleteInvoiceFromStore(id);
    setInvoices(getInvoices()); // Refresh list
    toast({
      title: "Invoice Deleted",
      description: "The invoice has been successfully deleted.",
    });
  };

  if (isLoading) {
    return <p>Loading invoices...</p>;
  }

  if (invoices.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No invoices found. <Link href="/upload" className="text-primary hover:underline">Upload your first invoice</Link> to get started.</p>;
  }

  const getStatusVariant = (status: StoredInvoice['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Completed':
        return 'default'; // Will use primary color
      case 'Processing':
      case 'Pending':
        return 'secondary';
      case 'Error':
        return 'destructive';
      default:
        return 'outline';
    }
  };


  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>File Name</TableHead>
            <TableHead>Upload Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Vendor</TableHead>
            <TableHead>Total</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className="font-medium">{invoice.fileName}</TableCell>
              <TableCell>{format(new Date(invoice.uploadDate), 'PPp')}</TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(invoice.status)}>{invoice.status}</Badge>
              </TableCell>
              <TableCell>{invoice.extractedData?.vendorName || 'N/A'}</TableCell>
              <TableCell>
                {invoice.extractedData?.totalAmount !== undefined 
                  ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(invoice.extractedData.totalAmount) 
                  : 'N/A'}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push(`/invoices/${invoice.id}`)}>
                      <Eye className="mr-2 h-4 w-4" /> View / Edit
                    </DropdownMenuItem>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <Trash2 className="mr-2 h-4 w-4 text-destructive" /> Delete
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the invoice
                            and its extracted data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(invoice.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
