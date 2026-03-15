import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  CalendarCheck,
  LayoutDashboard,
  Menu,
  Users,
  X,
} from "lucide-react";

type LayoutProps = {
  children: ReactNode;
};

type NavItem = {
  label: string;
  to: string;
  icon: ReactNode;
};

const SIDEBAR_WIDTH = 240;

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  useEffect(() => {
    closeSidebar();
  }, [location.pathname, closeSidebar]);

  const navItems: NavItem[] = useMemo(
    () => [
      {
        label: "Dashboard",
        to: "/dashboard",
        icon: <LayoutDashboard className="h-4 w-4" aria-hidden="true" />,
      },
      {
        label: "Employees",
        to: "/employees",
        icon: <Users className="h-4 w-4" aria-hidden="true" />,
      },
      {
        label: "Attendance",
        to: "/attendance",
        icon: <CalendarCheck className="h-4 w-4" aria-hidden="true" />,
      },
    ],
    []
  );

  const pageTitle = useMemo(() => {
    switch (location.pathname) {
      case "/dashboard":
        return "Dashboard";
      case "/employees":
        return "Employees";
      case "/attendance":
        return "Attendance";
      default:
        return "HRMS Lite";
    }
  }, [location.pathname]);

  const renderSidebarContent = () => (
    <div className="flex h-full flex-col bg-white">
      <div className="flex h-16 items-center gap-2 border-b border-gray-100 px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
          <span className="text-sm font-semibold">H</span>
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold text-gray-900">HRMS</span>
          <span className="text-xs font-medium text-gray-400">Lite</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-4">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                isActive
                  ? "border-r-2 border-indigo-500 bg-indigo-50 text-indigo-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-100 px-4 py-3">
        <p className="text-xs text-gray-400">HRMS Lite v1.0</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-full">
      {/* Desktop sidebar */}
      <aside
        className="fixed inset-y-0 left-0 hidden w-[240px] border-r border-gray-100 bg-white md:block"
        aria-label="Sidebar navigation"
      >
        {renderSidebarContent()}
      </aside>

      {/* Mobile sidebar + backdrop */}
      <div
        className={`fixed inset-0 z-40 md:hidden ${
          isSidebarOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!isSidebarOpen}
      >
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity ${
            isSidebarOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeSidebar}
        />
        <aside
          className={`absolute inset-y-0 left-0 w-[240px] transform border-r border-gray-100 bg-white shadow-lg transition-transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <button
            type="button"
            onClick={closeSidebar}
            className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm hover:bg-gray-50"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
          {renderSidebarContent()}
        </aside>
      </div>

      {/* Main content */}
      <div
        className="flex min-h-full flex-1 flex-col bg-gray-50"
        style={{ marginLeft: `min(${SIDEBAR_WIDTH}px, 0px)` }}
      >
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-100 bg-white px-4 md:ml-[240px] md:px-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 md:hidden"
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
            >
              <Menu className="h-4 w-4" aria-hidden="true" />
            </button>
            <h1 className="text-base font-semibold text-gray-900">
              {pageTitle}
            </h1>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-gray-50 md:ml-[240px]">
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

