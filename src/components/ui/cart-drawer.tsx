import React from 'react';
import { Link } from 'react-router-dom';
import { X, ShoppingBag, ArrowRight, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ds/primitives/Button';
import { Badge } from '@/components/ds/primitives/Badge';
import { Separator } from '@/components/ds/primitives/Separator';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { items, removeFromCart, total, clearCart } = useCart();

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/60 z-40 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed right-0 top-0 h-full w-full max-w-md z-50 transform transition-transform duration-300 ease-in-out',
          'bg-[#1e293b] border-l border-neutral-700 shadow-2xl',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-600/10 rounded-lg">
                <ShoppingBag className="h-5 w-5 text-violet-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-neutral-50">
                  Shopping Cart
                </h2>
                {items.length > 0 && (
                  <p className="text-sm text-neutral-400">
                    {items.length} {items.length === 1 ? 'course' : 'courses'}{' '}
                    selected
                  </p>
                )}
              </div>
              {items.length > 0 && (
                <Badge variant="primary" size="sm">
                  {items.length}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              aria-label="Close cart"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="w-20 h-20 bg-violet-600/10 rounded-full flex items-center justify-center mb-4">
                  <ShoppingBag className="h-10 w-10 text-violet-400" />
                </div>
                <h3 className="text-lg font-medium text-neutral-100 mb-2">
                  Your cart is empty
                </h3>
                <p className="text-neutral-400 mb-6 max-w-sm text-sm">
                  Discover our amazing courses and start your learning journey
                  today!
                </p>
                <Button variant="action" asChild>
                  <Link to="/courses" onClick={onClose}>
                    Browse Courses <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#0f172a] border border-neutral-700 rounded-xl p-4 hover:border-violet-500/50 transition-all duration-200"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <img
                          src={item.image_url || '/placeholder.svg'}
                          alt={item.title}
                          className="w-16 h-12 object-cover rounded-lg border border-neutral-700"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-neutral-100 line-clamp-2 mb-1">
                          {item.title}
                        </h4>
                        <p className="text-xs text-neutral-500 mb-2 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Lifetime access
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-base font-bold text-amber-400">
                            {formatPrice(item.price)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20 h-7 w-7 p-0"
                            aria-label="Remove item"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-neutral-700 bg-[#0f172a]/50">
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between py-1">
                  <span className="text-base font-medium text-neutral-200">
                    Total:
                  </span>
                  <span className="text-2xl font-bold text-amber-400">
                    {formatPrice(total)}
                  </span>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Button variant="action" size="lg" className="w-full" asChild>
                    <Link to="/checkout" onClick={onClose}>
                      Proceed to Checkout{' '}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="md"
                      className="flex-1"
                      asChild
                    >
                      <Link to="/courses" onClick={onClose}>
                        Continue Shopping
                      </Link>
                    </Button>
                    {items.length > 1 && (
                      <Button
                        variant="ghost"
                        size="md"
                        onClick={clearCart}
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20 px-3"
                        aria-label="Clear cart"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-neutral-500 text-center">
                  🔒 Secure checkout with 256-bit SSL encryption
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
