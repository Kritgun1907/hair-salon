/**
 * @file AppLayout.tsx
 * @description Shared layout shell for all pages (except PaymentStatus).
 *
 * Provides a sticky header with logo, navigation links, and an optional
 * subtitle. Wraps page content in a max-width container.
 */

import { Scissors } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface AppLayoutProps {
  children: React.ReactNode;
  subtitle?: string;
}

export default function AppLayout({ children, subtitle }: AppLayoutProps) {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: "#f5f0e8" }}>
      {/* Sticky header */}
      <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-stone-900 group-hover:bg-stone-700 transition-colors">
              <Scissors className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-stone-900 leading-none">
                Hair Salon
              </h1>
              {subtitle && (
                <p className="text-xs text-stone-500 mt-0.5">{subtitle}</p>
              )}
            </div>
          </Link>

          {/* Nav links */}
          <nav className="flex items-center gap-1">
            <NavLink to="/booking" current={pathname} label="Book Appointment" />
            <NavLink to="/analytics" current={pathname} label="Analytics" />
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">{children}</main>
    </div>
  );
}

function NavLink({
  to,
  current,
  label,
}: {
  to: string;
  current: string;
  label: string;
}) {
  const isActive = current === to;
  return (
    <Link
      to={to}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? "bg-stone-900 text-white"
          : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
      }`}
    >
      {label}
    </Link>
  );
}
