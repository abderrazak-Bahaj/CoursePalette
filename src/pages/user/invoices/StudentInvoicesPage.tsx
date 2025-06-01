import React, { useState } from 'react';
import { InvoiceTable } from '@/components/invoices/InvoiceTable';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { invoiceApi, Invoice, InvoiceFilters } from '@/services/api/invoice';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

export default function StudentInvoicesPage() {
  const [status, setStatus] = useState<string>('all');
  const { toast } = useToast();
  const navigate = useNavigate();

  const {
    data: invoices,
    isLoading,
    error,
  } = useQuery<Invoice[]>({
    queryKey: ['studentInvoices', status],
    queryFn: async () => {
      const filters: InvoiceFilters = {
        status: status === 'all' ? undefined : status,
      };
      const response = await invoiceApi.getInvoices(filters);
      return response.invoices;
    },
  });

  const handlePrint = async (invoiceId: string) => {
    try {
      await invoiceApi.printInvoice(invoiceId);
    } catch (error) {
      console.log('error', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  console.log('invoices', invoices && !isLoading, invoices);

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Invoices</h1>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="PAID">Paid</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
            <SelectItem value="REFUNDED">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!invoices && !isLoading ? (
        <div className="text-center py-8">
          <p className="text-red-500">Failed to load invoices</p>
        </div>
      ) : !invoices?.length ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No invoices found</p>
        </div>
      ) : (
        <InvoiceTable
          invoices={invoices}
          meta={{
            current_page: 1,
            last_page: 1,
            per_page: invoices.length,
            total: invoices.length,
          }}
          onViewDetails={() => {}}
          onPrint={handlePrint}
          onPageChange={() => {}}
          onPageSizeChange={() => {}}
        />
      )}
    </div>
  );
}
