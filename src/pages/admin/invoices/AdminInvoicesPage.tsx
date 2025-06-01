import React, { useState } from 'react';
import { InvoiceTable } from '@/components/invoices/InvoiceTable';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { addDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { invoiceApi, Invoice, InvoiceFilters } from '@/services/api/invoice';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { AdminLayout } from '@/components';
import WrapperLoading from '@/components/ui/wrapper-loading';

export default function AdminInvoicesPage() {
  const [status, setStatus] = useState<string>('ALL');
  const [dateRange, setDateRange] = useState({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const { toast } = useToast();

  const {
    data: invoices,
    isLoading,
    error,
  } = useQuery<Invoice[]>({
    queryKey: ['adminInvoices', status, dateRange],
    retry: false,
    queryFn: async () => {
      const filters: InvoiceFilters = {
        status: status === 'ALL' ? undefined : status,
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString(),
      };
      const response = await invoiceApi.getAdminInvoices(filters);
      return response.invoices;
    },
  });

  const calculateTotalRevenue = () => {
    if (!invoices) return 0;
    return invoices
      .filter((invoice) => invoice.status === 'PAID')
      .reduce((sum, invoice) => {
        const amount =
          typeof invoice.total === 'string'
            ? parseFloat(invoice.total)
            : invoice.total;
        return sum + amount;
      }, 0);
  };

  const handleExportCSV = () => {
    if (!invoices) return;

    // Define CSV headers
    const headers = [
      'Invoice Number',
      'Date',
      'Customer',
      'Status',
      'Subtotal',
      'Tax',
      'Total',
    ];

    // Convert invoices to CSV rows
    const rows = invoices.map((invoice) => [
      invoice.invoice_number,
      new Date(invoice.created_at).toLocaleDateString(),
      invoice.user?.name || 'N/A',
      invoice.status,
      invoice.subtotal,
      invoice.tax,
      invoice.total,
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `invoices-${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handlePrint = async (invoiceId: string) => {
    try {
      await invoiceApi.printInvoice(invoiceId);
    } catch (error) {
      console.error('Error printing invoice:', error);
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">All Invoices</h1>
          <div className="flex items-center space-x-4">
            <DateRangePicker date={dateRange} onDateChange={setDateRange} />
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="REFUNDED">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleExportCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
        <WrapperLoading isLoading={isLoading} skeletonCount={2}>
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-2">Total Revenue</h2>
                <p className="text-2xl font-bold text-green-600">
                  ${calculateTotalRevenue().toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">From paid invoices</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-2">Pending Invoices</h2>
                <p className="text-2xl font-bold text-yellow-600">
                  {invoices?.filter((i) => i.status === 'PENDING').length || 0}
                </p>
                <p className="text-sm text-gray-500">Awaiting payment</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-2">Failed Invoices</h2>
                <p className="text-2xl font-bold text-red-600">
                  {invoices?.filter((i) => i.status === 'FAILED').length || 0}
                </p>
                <p className="text-sm text-gray-500">Payment failed</p>
              </div>
            </div>

            {error ? (
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
          </>
        </WrapperLoading>
      </div>
    </AdminLayout>
  );
}
