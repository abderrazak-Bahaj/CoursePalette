import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ds/primitives/Button';
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
  Award,
  ShoppingCart,
  LayoutDashboard,
  LogOut,
  Settings,
  BookOpen,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const navLinks = [
  { to: '/courses', label: 'Courses', icon: BookOpen },
  { to: '/categories', label: 'Categories', icon: Sparkles },
  { to: '/blog', label: 'Blog', icon: null },
  { to: '/check-certificate', label: 'Certificates', icon: Award },
];

const roleMap: Record<string, 'admin' | 'teacher' | 'student'> = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated, logout, isStudent } = useAuth();
  const { items } = useCart();

  // Scroll detection for glass effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const handleLogout = () => {
    logout();
    toast({
      title: 'Logged out successfully',
      description: 'You have been logged out of your account',
    });
    navigate('/');
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchValue.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`);
      setSearchOpen(false);
      setSearchValue('');
    }
    if (e.key === 'Escape') {
      setSearchOpen(false);
      setSearchValue('');
    }
  };

  const isActive = (to: string) =>
    location.pathname === to || location.pathname.startsWith(to + '/');

  return (
    <>
      <style>{`
        @keyframes navSlideDown {
          from { opacity: 0; transform: translateY(-100%); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes mobileMenuSlide {
          from { opacity: 0; transform: translateY(-12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes searchExpand {
          from { width: 0; opacity: 0; }
          to { width: 100%; opacity: 1; }
        }
        @keyframes logoShimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .nav-root {
          animation: navSlideDown 0.4s cubic-bezier(0.34,1.2,0.64,1) forwards;
        }
        .nav-link {
          position: relative;
          transition: color 0.2s ease;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 50%;
          right: 50%;
          height: 2px;
          background: linear-gradient(90deg, #8b5cf6, #a78bfa);
          border-radius: 2px;
          transition: left 0.25s ease, right 0.25s ease;
        }
        .nav-link:hover::after,
        .nav-link.active::after {
          left: 0;
          right: 0;
        }
        .nav-link.active {
          color: #a78bfa;
        }
        .logo-text {
          background: linear-gradient(90deg, #a78bfa 0%, #c4b5fd 40%, #fbbf24 70%, #a78bfa 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: logoShimmer 6s linear infinite;
        }
        .cart-badge {
          animation: none;
        }
        .cart-badge.has-items {
          animation: pulse 2s ease-in-out infinite;
        }
        .mobile-menu {
          animation: mobileMenuSlide 0.25s ease forwards;
        }
        .search-input-wrap {
          animation: searchExpand 0.25s ease forwards;
        }
        .user-avatar-btn {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .nav-action-btn {
          transition: all 0.2s ease;
        }
        .nav-action-btn:hover {
          transform: scale(1.05);
        }
        .nav-action-btn:active {
          transform: scale(0.95);
        }
      `}</style>

      <nav
        className={cn(
          'nav-root sticky top-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-[#060b18]/90 backdrop-blur-xl border-b border-white/8 shadow-[0_4px_30px_rgba(0,0,0,0.4)]'
            : 'bg-[#0f172a] border-b border-neutral-800/60'
        )}
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link
              to="/"
              className="flex-shrink-0 flex items-center gap-2 group"
            >
              <img
                src="/logo-skillorai-light.svg"
                alt="skillorai"
                width={200}
              />
            </Link>

            {/* Desktop nav links */}
            {!isMobile && (
              <div className="hidden md:flex items-center gap-1">
                {navLinks.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className={cn(
                      'nav-link px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                      isActive(to)
                        ? 'active text-violet-400 bg-violet-500/8'
                        : 'text-neutral-400 hover:text-neutral-100 hover:bg-white/[0.04]'
                    )}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            )}

            {/* Right actions */}
            <div className="flex items-center gap-1.5">
              {/* Search toggle */}
              {!isMobile && (
                <div className="relative flex items-center">
                  {searchOpen ? (
                    <div className="search-input-wrap flex items-center gap-2 bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2">
                      <Search className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                      <input
                        ref={searchRef}
                        type="text"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onKeyDown={handleSearch}
                        placeholder="Search courses..."
                        className="bg-transparent text-sm text-neutral-100 placeholder-neutral-500 outline-none w-48"
                      />
                      <button
                        onClick={() => {
                          setSearchOpen(false);
                          setSearchValue('');
                        }}
                        className="text-neutral-500 hover:text-neutral-300 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSearchOpen(true)}
                      className="nav-action-btn w-9 h-9 rounded-xl flex items-center justify-center text-neutral-400 hover:text-neutral-100 hover:bg-white/[0.06] transition-colors"
                      aria-label="Search"
                    >
                      <Search className="w-4.5 h-4.5" />
                    </button>
                  )}
                </div>
              )}

              {isAuthenticated ? (
                <>
                  {/* Cart */}
                  <button
                    onClick={() => setIsCartOpen(true)}
                    className="nav-action-btn relative w-9 h-9 rounded-xl flex items-center justify-center text-neutral-400 hover:text-neutral-100 hover:bg-white/[0.06] transition-colors"
                    aria-label="Cart"
                  >
                    <ShoppingCart className="w-4.5 h-4.5" />
                    {items.length > 0 && (
                      <span className="cart-badge has-items absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold leading-none">
                        {items.length > 9 ? '9+' : items.length}
                      </span>
                    )}
                  </button>

                  {/* User dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="user-avatar-btn flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-xl hover:bg-white/[0.05] transition-colors focus-visible:outline-none"
                        aria-label="User menu"
                      >
                        <Avatar
                          src={user?.avatar ?? undefined}
                          alt={user?.name ?? ''}
                          fallback={user?.name?.slice(0, 2)}
                          size="sm"
                          role={user?.role ? roleMap[user.role] : undefined}
                        />
                        <ChevronDown className="w-3 h-3 text-neutral-500" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-60 bg-[#0d1220]/95 backdrop-blur-xl border border-white/10 text-neutral-100 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] p-2 mt-2"
                    >
                      {/* User info header */}
                      <div className="px-3 py-3 mb-1">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={user?.avatar ?? undefined}
                            alt={user?.name ?? ''}
                            fallback={user?.name?.slice(0, 2)}
                            size="md"
                            role={user?.role ? roleMap[user.role] : undefined}
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-neutral-100 truncate">
                              {user?.name}
                            </p>
                            <p className="text-xs text-neutral-500 truncate">
                              {user?.email}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 px-1 py-0.5 rounded-md bg-violet-500/10 border border-violet-500/15 inline-block">
                          <span className="text-[10px] text-violet-400 font-semibold uppercase tracking-wider">
                            {user?.role}
                          </span>
                        </div>
                      </div>

                      <Separator className="bg-white/8 mb-1" />

                      {[
                        {
                          label: 'Profile',
                          icon: User,
                          action: () => navigate('/profile'),
                        },

                        ...(isStudent
                          ? [
                              {
                                label: 'Dashboard',
                                icon: LayoutDashboard,
                                action: () => navigate('/dashboard'),
                              },
                              {
                                label: 'My Certificates',
                                icon: Award,
                                action: () => navigate('/certificates'),
                              },
                            ]
                          : []),
                      ].map(({ label, icon: Icon, action }) => (
                        <DropdownMenuItem
                          key={label}
                          onClick={action}
                          className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-neutral-300 hover:text-neutral-100 hover:bg-white/[0.06] rounded-xl cursor-pointer transition-colors focus:bg-white/[0.06] focus:text-neutral-100"
                        >
                          <Icon className="w-4 h-4 text-neutral-500" />
                          {label}
                        </DropdownMenuItem>
                      ))}

                      <Separator className="bg-white/8 my-1" />

                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl cursor-pointer transition-colors focus:bg-rose-500/10 focus:text-rose-300"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                !isMobile && (
                  <div className="flex items-center gap-2 ml-1">
                    <Button variant="ghost" size="sm" asChild>
                      <Link
                        to="/login"
                        className="flex items-center gap-1.5 text-neutral-400 hover:text-neutral-100"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        Log In
                      </Link>
                    </Button>
                    <Button variant="action" size="sm" asChild>
                      <Link to="/register" className="px-4">
                        Sign Up
                      </Link>
                    </Button>
                  </div>
                )
              )}

              {/* Mobile hamburger */}
              {isMobile && (
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="nav-action-btn w-9 h-9 rounded-xl flex items-center justify-center text-neutral-400 hover:text-neutral-100 hover:bg-white/[0.06] transition-colors"
                  aria-label="Toggle menu"
                >
                  {isOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Mobile menu */}
          {isMobile && isOpen && (
            <div className="mobile-menu pb-4 border-t border-white/8 pt-4">
              {/* Mobile search */}
              <div className="flex items-center gap-2 bg-white/[0.04] border border-white/8 rounded-xl px-3 py-2.5 mb-4">
                <Search className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={handleSearch}
                  placeholder="Search courses..."
                  className="bg-transparent text-sm text-neutral-100 placeholder-neutral-500 outline-none flex-1"
                />
              </div>

              {/* Mobile nav links */}
              <div className="flex flex-col gap-1 mb-4">
                {navLinks.map(({ to, label, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                      isActive(to)
                        ? 'text-violet-400 bg-violet-500/10 border border-violet-500/15'
                        : 'text-neutral-400 hover:text-neutral-100 hover:bg-white/[0.04]'
                    )}
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    {label}
                  </Link>
                ))}
              </div>

              {isAuthenticated ? (
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => {
                      setIsCartOpen(true);
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-neutral-400 hover:text-neutral-100 hover:bg-white/[0.04] transition-colors"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Cart{' '}
                    {items.length > 0 && (
                      <span className="ml-auto bg-rose-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {items.length}
                      </span>
                    )}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 pt-2 border-t border-white/8">
                  <Button
                    variant="ghost"
                    size="md"
                    asChild
                    className="justify-start"
                  >
                    <Link to="/login" onClick={() => setIsOpen(false)}>
                      <LogIn className="w-4 h-4 mr-2" /> Log In
                    </Link>
                  </Button>
                  <Button variant="action" size="md" asChild>
                    <Link to="/register" onClick={() => setIsOpen(false)}>
                      Sign Up Free
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Navbar;
