import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InvoiceTable, Invoice } from '@/components/invoices/InvoiceTable';
import { invoiceApi } from '@/services/api/invoice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { Loader2 } from 'lucide-react';
import { PaginationMeta } from '@/services/pagination/PaginationService';
import { useToast } from '@/components/ui/use-toast';
import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '@/components';

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
};

const TeacherInvoicesPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [meta, setMeta] = useState<PaginationMeta>({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0
  });
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery<Invoice[]>({
    queryKey: ['teacherInvoices', selectedStatus, dateRange, meta.current_page, meta.per_page],
    queryFn: async () => {
      const filters: any = {
        page: meta.current_page,
        per_page: meta.per_page
      };

      if (selectedStatus !== 'all') {
        filters.status = selectedStatus;
      }

      if (dateRange?.from) {
        filters.from = dateRange.from.toISOString();
      }

      if (dateRange?.to) {
        filters.to = dateRange.to.toISOString();
      }

      const response = await invoiceApi.getTeacherInvoices(filters);
      setMeta(response.meta);
      return response.invoices;
    }
  });

  const calculateRevenue = () => {
    if (!data) return 0;
    return data.reduce((total, invoice) => {
      if (invoice.status === 'PAID') {
        const amount = typeof invoice.total === 'string' ? parseFloat(invoice.total) : invoice.total;
        return total + amount;
      }
      return total;
    }, 0);
  };

  const handleViewDetails = (invoiceId: string) => {
    navigate(`/teacher/invoices/${invoiceId}`);
  };

  const handlePrint = async (invoiceId: string) => {
    try {
      await invoiceApi.printInvoice(invoiceId);
    } catch (error) {
      console.error('Error printing invoice:', error);
     
    }
  };

  const handlePageChange = (page: number) => {
    setMeta(prev => ({ ...prev, current_page: page }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    setMeta(prev => ({ ...prev, per_page: pageSize, current_page: 1 }));
  };

  return (
   <AdminLayout>
     <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Invoices</h1>
        
        {/* Revenue Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-600">Total Revenue</h3>
            <p className="text-3xl font-bold text-green-600">
              ${calculateRevenue().toFixed(2)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-600">Total Invoices</h3>
            <p className="text-3xl font-bold text-blue-600">{meta.total}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-600">Paid Invoices</h3>
            <p className="text-3xl font-bold text-purple-600">
              {data?.filter(inv => inv.status === 'PAID').length || 0}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="w-full md:w-64">
            <DateRangePicker
              date={dateRange}
              onDateChange={setDateRange}
            />
          </div>
          <div className="w-full md:w-48">
            <Select
              value={selectedStatus}
              onValueChange={setSelectedStatus}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="REFUNDED">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Invoice Table */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">Failed to load invoices</p>
          </div>
        ) : !data?.length ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No invoices found</p>
          </div>
        ) : (
          <InvoiceTable
            invoices={data}
            meta={meta}
            onViewDetails={handleViewDetails}
            onPrint={handlePrint}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </div>
    </div>
   </AdminLayout>
  );
};

export default TeacherInvoicesPage; 