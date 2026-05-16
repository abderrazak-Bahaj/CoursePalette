import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ds/primitives/Button';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import MainLayout from '@/components/layout/MainLayout';
import { useMutation } from '@tanstack/react-query';
import { paymentService } from '@/services/api';
import { useEffect } from 'react';

const CartPage = () => {
  const { items, removeFromCart, total, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);

  const paymentMutation = useMutation({
    retry: false,
    mutationFn: (data: { course_ids: string[]; payment_method?: string }) =>
      paymentService.processEnrollment(data),
    onSuccess: (response) => {
      if (response.approval_url) {
        // Redirect to PayPal for payment
        window.location.href = response.approval_url;
      } else {
        toast({
          title: 'Payment Error',
          description: 'No approval URL received from server',
          variant: 'destructive',
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Payment Processing Failed',
        description: 'There was an error processing your payment',
        variant: 'destructive',
      });
    },
  });

  const capturePaymentMutation = useMutation({
    retry: false,
    mutationFn: (data: { order_id: string; invoice_id: string }) =>
      paymentService.capturePayment(data),
    onSuccess: (response) => {
      clearCart();
      toast({
        title: 'Payment Successful',
        description: 'Your courses have been enrolled successfully',
      });
      navigate('/dashboard');
    },
    onError: (error) => {
      toast({
        title: 'Payment Failed',
        description: 'There was an error processing your payment',
        variant: 'destructive',
      });
    },
  });

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to complete your purchase',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    // Process payment for courses
    paymentMutation.mutate({
      course_ids: items.map((item) => item.id),
      payment_method: 'paypal',
    });
  };

  // Check if we're returning from PayPal
  useEffect(() => {
    const token = urlParams.get('token');
    const status = urlParams.get('status');
    const invoiceId = urlParams.get('invoice_id');

    console.log(token, status, invoiceId);

    if (token && invoiceId && status === 'success') {
      capturePaymentMutation.mutate({
        order_id: token,
        invoice_id: invoiceId,
      });
    }
  }, []);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="font-serif text-3xl font-bold text-neutral-50 mb-8">
          Shopping Cart
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="font-serif text-xl font-semibold text-neutral-100 mb-4">
              Your cart is empty
            </h2>
            <Button onClick={() => navigate('/courses')} variant="action">
              Browse Courses
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border-b border-neutral-700"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div>
                      <h3 className="font-semibold text-neutral-100">
                        {item.title}
                      </h3>
                      <p className="text-neutral-400">
                        {item.price === 0 ? 'Free' : `$${item.price}`}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>

            <div className="bg-[#1e293b] border border-neutral-700 p-6 rounded-xl">
              <h2 className="font-serif text-xl font-semibold text-neutral-50 mb-4">
                Order Summary
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-neutral-300">Subtotal</span>
                  <span className="text-amber-400">${total}</span>
                </div>
                <div className="border-t border-neutral-700 pt-4">
                  <div className="flex justify-between font-semibold">
                    <span className="font-semibold text-neutral-100">
                      Total
                    </span>
                    <span className="text-amber-400">${total}</span>
                  </div>
                </div>
                <Button
                  variant="action"
                  className="w-full"
                  onClick={handleCheckout}
                  disabled={
                    paymentMutation.isPending ||
                    capturePaymentMutation.isPending
                  }
                >
                  Proceed to Payment
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default CartPage;
