import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ds/primitives/Button';
import { Input } from '@/components/ds/primitives/Input';
import { Avatar } from '@/components/ds/primitives/Avatar';
import { Separator } from '@/components/ds/primitives/Separator';
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
  BookText,
  ShoppingCart,
  LayoutDashboard,
  LogOut,
  Settings,
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

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

  const navLinks = [
    { to: '/courses', label: 'Courses' },
    { to: '/categories', label: 'Categories' },
    { to: '/blog', label: 'Blog' },
    { to: '/check-certificate', label: 'Check Certificate' },
  ];

  const roleMap: Record<string, 'admin' | 'teacher' | 'student'> = {
    ADMIN: 'admin',
    TEACHER: 'teacher',
    STUDENT: 'student',
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-[#0f172a] border-b border-neutral-700">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <span className="font-serif text-xl font-bold text-violet-400">
                CoursePalette
              </span>
            </Link>

            {/* Desktop nav links */}
            {!isMobile && (
              <div className="hidden md:flex items-center gap-1">
                {navLinks.map(({ to, label }) => (
                  <Button key={to} variant="ghost" size="sm" asChild>
                    <Link to={to}>{label}</Link>
                  </Button>
                ))}
              </div>
            )}

            {/* Search */}
            {!isMobile && (
              <div className="hidden md:flex flex-1 max-w-sm">
                <Input
                  variant="search"
                  placeholder="Search courses..."
                  leadingIcon={<Search className="w-4 h-4" />}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter')
                      navigate(`/search?q=${e.currentTarget.value}`);
                  }}
                />
              </div>
            )}

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  {/* Cart */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCartOpen(true)}
                    className="relative"
                    aria-label="Cart"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {items.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-coral-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium">
                        {items.length}
                      </span>
                    )}
                  </Button>

                  {/* User dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="focus-visible:outline-none focus-visible:shadow-glow-violet rounded-full"
                        aria-label="User menu"
                      >
                        <Avatar
                          src={user?.avatar ?? undefined}
                          alt={user?.name ?? ''}
                          fallback={user?.name?.slice(0, 2)}
                          size="sm"
                          role={user?.role ? roleMap[user.role] : undefined}
                        />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-56 bg-[#1e293b] border border-neutral-700 text-neutral-100 rounded-lg shadow-lg p-1"
                    >
                      <div className="px-3 py-2">
                        <p className="text-sm font-medium text-neutral-100">
                          {user?.name}
                        </p>
                        <p className="text-xs text-neutral-400">
                          {user?.email}
                        </p>
                      </div>
                      <Separator className="my-1" />
                      <DropdownMenuItem
                        onClick={() => navigate('/profile')}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-700/50 rounded-md cursor-pointer"
                      >
                        <User className="w-4 h-4" /> Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => navigate('/settings')}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-700/50 rounded-md cursor-pointer"
                      >
                        <Settings className="w-4 h-4" /> Settings
                      </DropdownMenuItem>
                      {isStudent && (
                        <>
                          <DropdownMenuItem
                            onClick={() => navigate('/dashboard')}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-700/50 rounded-md cursor-pointer"
                          >
                            <LayoutDashboard className="w-4 h-4" /> Dashboard
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => navigate('/certificates')}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-700/50 rounded-md cursor-pointer"
                          >
                            <Award className="w-4 h-4" /> Certificates
                          </DropdownMenuItem>
                        </>
                      )}
                      <Separator className="my-1" />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-900/20 rounded-md cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                !isMobile && (
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/login">Log In</Link>
                    </Button>
                    <Button variant="action" size="sm" asChild>
                      <Link to="/register">Sign Up</Link>
                    </Button>
                  </div>
                )
              )}

              {/* Mobile hamburger */}
              {isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(!isOpen)}
                  aria-label="Toggle menu"
                >
                  {isOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Mobile menu */}
          {isMobile && isOpen && (
            <div className="mt-3 pb-3 animate-slide-down border-t border-neutral-700 pt-3">
              <div className="mb-3">
                <Input
                  variant="search"
                  placeholder="Search courses..."
                  leadingIcon={<Search className="w-4 h-4" />}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      navigate(`/search?q=${e.currentTarget.value}`);
                      setIsOpen(false);
                    }
                  }}
                />
              </div>
              <div className="flex flex-col gap-1">
                {navLinks.map(({ to, label }) => (
                  <Button
                    key={to}
                    variant="ghost"
                    size="md"
                    asChild
                    className="justify-start"
                  >
                    <Link to={to} onClick={() => setIsOpen(false)}>
                      {label}
                    </Link>
                  </Button>
                ))}
                {isAuthenticated && (
                  <Button
                    variant="ghost"
                    size="md"
                    className="justify-start"
                    onClick={() => {
                      setIsCartOpen(true);
                      setIsOpen(false);
                    }}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Cart {items.length > 0 && `(${items.length})`}
                  </Button>
                )}
                {!isAuthenticated && (
                  <>
                    <Separator className="my-1" />
                    <Button
                      variant="ghost"
                      size="md"
                      asChild
                      className="justify-start"
                    >
                      <Link to="/login" onClick={() => setIsOpen(false)}>
                        <LogIn className="w-4 h-4 mr-2" />
                        Log In
                      </Link>
                    </Button>
                    <Button variant="action" size="md" asChild>
                      <Link to="/register" onClick={() => setIsOpen(false)}>
                        Sign Up
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Navbar;
