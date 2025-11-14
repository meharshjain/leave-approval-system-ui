import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar, SidebarBody, SidebarLink } from './ui/sidebar';
import {
  LayoutDashboard,
  FileText,
  Zap,
  CheckCircle2,
  Stethoscope,
  Calendar,
  History,
  Users,
  Building2,
  UserCircle,
  LogOut,
  Menu,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const getMenuItems = (userRole?: string) => {
  const baseItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: <LayoutDashboard className="text-neutral-200 h-5 w-5 flex-shrink-0" />,
      roles: ['employee', 'manager', 'coordinator', 'admin', 'doctor'],
    },
    {
      label: 'Leave Request',
      href: '/leave-request',
      icon: <FileText className="text-neutral-200 h-5 w-5 flex-shrink-0" />,
      roles: ['employee', 'manager', 'coordinator', 'admin', 'doctor'],
    },
    {
      label: 'Instant Leave',
      href: '/instant-leave',
      icon: <Zap className="text-neutral-200 h-5 w-5 flex-shrink-0" />,
      roles: ['employee', 'manager', 'coordinator', 'admin', 'doctor'],
    },
    {
      label: 'Leave Approval',
      href: '/leave-approval',
      icon: <CheckCircle2 className="text-neutral-200 h-5 w-5 flex-shrink-0" />,
      roles: ['manager', 'coordinator', 'admin'],
    },
    {
      label: 'Medical Review',
      href: '/medical-review',
      icon: <Stethoscope className="text-neutral-200 h-5 w-5 flex-shrink-0" />,
      roles: ['doctor', 'admin'],
    },
    {
      label: 'Appointments',
      href: '/appointments',
      icon: <Calendar className="text-neutral-200 h-5 w-5 flex-shrink-0" />,
      roles: ['doctor', 'manager', 'admin'],
    },
    {
      label: 'Leave Records',
      href: '/leave-records',
      icon: <History className="text-neutral-200 h-5 w-5 flex-shrink-0" />,
      roles: ['employee', 'manager', 'coordinator', 'admin', 'doctor'],
    },
    {
      label: 'User Management',
      href: '/users',
      icon: <Users className="text-neutral-200 h-5 w-5 flex-shrink-0" />,
      roles: ['admin', 'manager', 'coordinator'],
    },
    {
      label: 'Department Management',
      href: '/departments',
      icon: <Building2 className="text-neutral-200 h-5 w-5 flex-shrink-0" />,
      roles: ['admin'],
    },
  ];

  return baseItems.filter(item => !userRole || item.roles.includes(userRole));
};

const Logo = () => {
  return (
    <span className="font-medium text-white whitespace-nowrap">
      Leave Management
    </span>
  );
};

const LogoIcon = () => {
  return (
    <Link
      to="/dashboard"
      className="font-normal flex space-x-2 items-center text-sm text-white py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
    </Link>
  );
};

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = getMenuItems(user?.role);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getCurrentPageTitle = () => {
    return menuItems.find(item => item.href === location.pathname)?.label || 'Dashboard';
  };

  // Close mobile sidebar when route changes
  React.useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
        <SidebarBody className="flex flex-col min-h-screen">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden min-h-0">
            <SidebarLink
              link={{
                label: 'Leave Management',
                href: '/dashboard',
                icon: <div className="h-5 w-6 bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />,
              }}
              className="px-1 mb-4"
            />
            <div className="mt-8 flex flex-col gap-2">
              {menuItems.map((item, idx) => (
                <SidebarLink
                  key={idx}
                  link={item}
                  className={cn(
                    "px-1 rounded-md transition-colors",
                    location.pathname === item.href
                      ? 'bg-neutral-700'
                      : 'hover:bg-neutral-800'
                  )}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2 mt-auto pt-4 flex-shrink-0">
            <SidebarLink
              link={{
                label: user?.name || 'Profile',
                href: '/profile',
                icon: user?.name ? (
                  <div className="h-7 w-7 flex-shrink-0 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                ) : (
                  <UserCircle className="text-neutral-200 h-5 w-5 flex-shrink-0" />
                ),
            }}
              className={cn(
                "px-1 rounded-md transition-colors",
                location.pathname === '/profile'
                  ? 'bg-neutral-700'
                  : 'hover:bg-neutral-800'
              )}
            />
            <SidebarLink
              link={{
                label: 'Logout',
                href: '#',
                icon: <LogOut className="text-neutral-200 h-5 w-5 flex-shrink-0" />,
              }}
              onClick={handleLogout}
              className="px-2 rounded-md transition-colors hover:bg-neutral-800"
            />
          </div>
        </SidebarBody>
      </Sidebar>
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <header className="h-16 bg-neutral-900 border-b border-neutral-700 flex items-center px-4 md:px-6 flex-shrink-0">
          <Menu
            className="text-neutral-200 cursor-pointer mr-3 md:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          />
          <h1 className="text-lg md:text-xl font-semibold text-white truncate">
            {getCurrentPageTitle()}
          </h1>
        </header>
        {/* Main Content */}
        <main className="flex-1 bg-neutral-950 overflow-y-auto overflow-x-hidden">
          <div className="w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
