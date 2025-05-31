import React from 'react';
import { Link } from 'react-router-dom';
import { X, ShoppingBag, ArrowRight, Trash2, Star, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { items, removeFromCart, total, clearCart } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-course-blue/5 to-purple-50">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-course-blue/10 rounded-lg">
                <ShoppingBag className="h-5 w-5 text-course-blue" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Shopping Cart</h2>
                {items.length > 0 && (
                  <p className="text-sm text-gray-500">
                    {items.length} {items.length === 1 ? 'course' : 'courses'} selected
                  </p>
                )}
              </div>
              {items.length > 0 && (
                <Badge variant="secondary" className="ml-2 bg-course-blue text-white">
                  {items.length}
                </Badge>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-course-blue/10 to-purple-100 rounded-full flex items-center justify-center mb-4">
                  <ShoppingBag className="h-10 w-10 text-course-blue" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-gray-500 mb-6 max-w-sm">
                  Discover our amazing courses and start your learning journey today!
                </p>
                <Link to="/courses" onClick={onClose}>
                  <Button className="bg-course-blue hover:bg-blue-700">
                    Browse Courses
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                {items.map((item, index) => (
                  <div 
                    key={item.id} 
                    className={cn(
                      "bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 hover:border-course-blue/30",
                      "animate-in slide-in-from-right-2 duration-300",
                    )}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Course Image */}
                      <div className="flex-shrink-0 relative">
                        <img
                          src={item.image_url || '/api/placeholder/80/60'}
                          alt={item.title}
                          className="w-20 h-15 object-cover rounded-lg border border-gray-200"
                        />
                        <div className="absolute -top-1 -right-1 bg-course-blue text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          <Star className="w-3 h-3 fill-current" />
                        </div>
                      </div>

                      {/* Course Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                          {item.title}
                        </h4>
                        <p className="text-xs text-gray-500 mb-2 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          <span>Lifetime access</span>
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-course-blue">
                              {formatPrice(item.price)}
                            </span>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
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
            <div className="border-t border-gray-200 bg-gray-50/50 backdrop-blur-sm">
              <div className="p-6 space-y-4">
                {/* Total */}
                <div className="flex items-center justify-between py-2">
                  <span className="text-base font-medium text-gray-900">Total:</span>
                  <span className="text-2xl font-bold text-course-blue">
                    {formatPrice(total)}
                  </span>
                </div>

                <Separator />

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Link to="/checkout" onClick={onClose} className="block">
                    <Button 
                      className="w-full bg-gradient-to-r from-course-blue to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200" 
                      size="lg"
                    >
                      Proceed to Checkout
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  
                  <div className="flex space-x-3">
                    <Link to="/courses" onClick={onClose} className="flex-1">
                      <Button variant="outline" className="w-full border-course-blue text-course-blue hover:bg-course-blue/5">
                        Continue Shopping
                      </Button>
                    </Link>
                    {items.length > 1 && (
                      <Button
                        variant="ghost"
                        onClick={clearCart}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3"
                        title="Clear all items"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Security Note */}
                <div className="text-xs text-gray-500 text-center bg-white/50 p-2 rounded-lg">
                  🔒 Secure checkout with 256-bit SSL encryption
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}; 