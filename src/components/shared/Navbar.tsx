// src/components/shared/Navbar.tsx
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ds/primitives/Button';
import { Input } from '@/components/ds/primitives/Input';
import { Separator } from '@/components/ds/primitives/Separator';
import { UserMenu } from './UserMenu';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { Search, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const isMobile = useIsMobile();

  const navLinks = [
    { to: '/courses', label: 'Courses' },
    { to: '/categories', label: 'Categories' },
    { to: '/blog', label: 'Blog' },
    { to: '/check-certificate', label: 'Check Certificate' },
  ];

  return (
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
                  if (e.key === 'Enter') {
                    navigate(`/search?q=${e.currentTarget.value}`);
                  }
                }}
              />
            </div>
          )}

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <div className="flex items-center gap-2">
                {!isMobile && (
                  <>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/login">Log In</Link>
                    </Button>
                    <Button variant="action" size="sm" asChild>
                      <Link to="/register">Sign Up</Link>
                    </Button>
                  </>
                )}
              </div>
            )}

            {/* Mobile menu */}
            {isMobile && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" aria-label="Open menu">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="bg-[#0f172a] border-neutral-700 text-neutral-100 w-72"
                >
                  <div className="flex flex-col gap-4 mt-6">
                    <Input
                      variant="search"
                      placeholder="Search courses..."
                      leadingIcon={<Search className="w-4 h-4" />}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          navigate(`/search?q=${e.currentTarget.value}`);
                        }
                      }}
                    />
                    <Separator />
                    <div className="flex flex-col gap-1">
                      {navLinks.map(({ to, label }) => (
                        <Button
                          key={to}
                          variant="ghost"
                          size="md"
                          asChild
                          className="justify-start"
                        >
                          <Link to={to}>{label}</Link>
                        </Button>
                      ))}
                    </div>
                    {!isAuthenticated && (
                      <>
                        <Separator />
                        <Button
                          variant="ghost"
                          size="md"
                          asChild
                          className="justify-start"
                        >
                          <Link to="/login">Log In</Link>
                        </Button>
                        <Button variant="action" size="md" asChild>
                          <Link to="/register">Sign Up</Link>
                        </Button>
                      </>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
