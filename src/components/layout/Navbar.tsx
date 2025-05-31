import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { CartDrawer } from '@/components/ui/cart-drawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Menu,
  X,
  LogIn,
  User,
  BookOpen,
  Award,
  Home,
  Users,
  PieChart,
  BookText,
  ShoppingCart,
  LayoutDashboard,
  Receipt,
  Settings,
  LogOut,
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/contexts/CartContext';
import { Separator } from '@/components/ui/separator';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated, logout, isAdmin, isStudent, isTeacher } =
    useAuth();
  const { items } = useCart();

  const handleLogout = () => {
    logout();
    toast({
      title: 'Logged out successfully',
      description: 'You have been logged out of your account',
    });
    navigate('/');
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const UserMenuContent = () => {
    if (!user) return null;

    return (
      <div className="w-56">
        <div className="px-4 py-2">
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs text-gray-500">{user.email}</p>
        </div>
        <Separator />
        <div className="py-2">
          <DropdownMenuItem onClick={() => navigate('/profile')}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          {user.role === 'STUDENT' && (
            <>
              <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/certificates')}>
                <Award className="mr-2 h-4 w-4" />
                <span>Certificates</span>
              </DropdownMenuItem>
            </>
          )}
        </div>
        <Separator />
        <div className="py-2">
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </div>
      </div>
    );
  };

  return (
    <>
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-course-blue">
                CoursePalette
              </span>
            </Link>

            {!isMobile && (
              <div className="hidden md:flex space-x-4 ml-6">
                <Link
                  to="/courses"
                  className="text-gray-700 hover:text-course-blue transition-colors"
                >
                  Courses
                </Link>
                <Link
                  to="/categories"
                  className="text-gray-700 hover:text-course-blue transition-colors"
                >
                  Categories
                </Link>
                <Link
                  to="/blog"
                  className="text-gray-700 hover:text-course-blue transition-colors"
                >
                  Blog
                </Link>
                <Link
                  to="/check-certificate"
                  className="text-gray-700 hover:text-course-blue transition-colors"
                >
                  Check Certificate
                </Link>
              </div>
            )}
          </div>

          {!isMobile && (
            <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <Input
                  placeholder="Search for courses..."
                  className="pl-10 w-full"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      navigate(`/search?q=${e.currentTarget.value}`);
                    }
                  }}
                />
              </div>
            </div>
          )}

            <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                  {/* Cart Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleCart}
                    className="relative hover:bg-gray-100"
                  >
                  <ShoppingCart className="h-6 w-6" />
                  {items.length > 0 && (
                      <span className="absolute -top-2 -right-2 bg-course-blue text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium">
                      {items.length}
                    </span>
                  )}
                  </Button>

                  {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="cursor-pointer">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback className="bg-course-blue text-white">
                        {user?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <UserMenuContent />
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                {!isMobile && (
                  <>
                    <Link to="/login">
                      <Button variant="outline">Log In</Button>
                    </Link>
                    <Link to="/register">
                      <Button>Sign Up</Button>
                    </Link>
                  </>
                )}
              </div>
            )}
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMenu}
                aria-label="Toggle menu"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </Button>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {isMobile && isOpen && (
          <div className="md:hidden mt-3 pb-3 animate-fade-in">
            <div className="relative w-full mb-4">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <Input
                placeholder="Search for courses..."
                className="pl-10 w-full"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    navigate(`/search?q=${e.currentTarget.value}`);
                    setIsOpen(false);
                  }
                }}
              />
            </div>
            <div className="flex flex-col space-y-3">
              <Link
                to="/"
                className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                <Home size={20} className="mr-2" />
                Home
              </Link>
              <Link
                to="/courses"
                className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                <BookOpen size={20} className="mr-2" />
                Courses
              </Link>
              <Link
                to="/categories"
                className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                <BookText size={20} className="mr-2" />
                Categories
              </Link>
              <Link
                to="/blog"
                className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                <BookText size={20} className="mr-2" />
                Blog
              </Link>
              <Link
                to="/check-certificate"
                className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                <Award size={20} className="mr-2" />
                Check Certificate
              </Link>
                {isAuthenticated && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      toggleCart();
                      setIsOpen(false);
                    }}
                    className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md justify-start"
                  >
                    <ShoppingCart size={20} className="mr-2" />
                    Cart {items.length > 0 && `(${items.length})`}
                  </Button>
                )}
              {!isAuthenticated && (
                <>
                  <Link
                    to="/login"
                    className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                    onClick={() => setIsOpen(false)}
                  >
                    <LogIn size={20} className="mr-2" />
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                    onClick={() => setIsOpen(false)}
                  >
                    <User size={20} className="mr-2" />
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Navbar;
