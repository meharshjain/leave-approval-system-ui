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
      icon: <LayoutDashboard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
      roles: ['employee', 'manager', 'coordinator', 'admin', 'doctor'],
    },
    {
      label: 'Leave Request',
      href: '/leave-request',
      icon: <FileText className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
      roles: ['employee', 'manager', 'coordinator', 'admin', 'doctor'],
    },
    {
      label: 'Instant Leave',
      href: '/instant-leave',
      icon: <Zap className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
      roles: ['employee', 'manager', 'coordinator', 'admin', 'doctor'],
    },
    {
      label: 'Leave Approval',
      href: '/leave-approval',
      icon: <CheckCircle2 className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
      roles: ['manager', 'coordinator', 'admin'],
    },
    {
      label: 'Medical Review',
      href: '/medical-review',
      icon: <Stethoscope className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
      roles: ['doctor', 'admin'],
    },
    {
      label: 'Appointments',
      href: '/appointments',
      icon: <Calendar className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
      roles: ['doctor', 'manager', 'admin'],
    },
    {
      label: 'Leave Records',
      href: '/leave-records',
      icon: <History className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
      roles: ['employee', 'manager', 'coordinator', 'admin', 'doctor'],
    },
    {
      label: 'User Management',
      href: '/users',
      icon: <Users className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
      roles: ['admin', 'manager', 'coordinator'],
    },
    {
      label: 'Department Management',
      href: '/departments',
      icon: <Building2 className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
      roles: ['admin'],
    },
  ];

  return baseItems.filter(item => !userRole || item.roles.includes(userRole));
};

const Logo = () => {
  return (
    <Link
      to="/dashboard"
      className="font-normal flex space-x-2 items-center text-sm text-black dark:text-white py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-black dark:text-white whitespace-pre"
      >
        Leave Management
      </motion.span>
    </Link>
  );
};

const LogoIcon = () => {
  return (
    <Link
      to="/dashboard"
      className="font-normal flex space-x-2 items-center text-sm text-black dark:text-white py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
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
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {sidebarOpen ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {menuItems.map((item, idx) => (
                <SidebarLink
                  key={idx}
                  link={item}
                  className={cn(
                    "px-2 rounded-md transition-colors",
                    location.pathname === item.href
                      ? 'bg-neutral-200 dark:bg-neutral-700'
                      : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  )}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <SidebarLink
              link={{
                label: user?.name || 'Profile',
                href: '/profile',
                icon: user?.name ? (
                  <div className="h-7 w-7 flex-shrink-0 rounded-full bg-blue-500 dark:bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                ) : (
                  <UserCircle className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
                ),
            }}
              className={cn(
                "px-2 rounded-md transition-colors",
                location.pathname === '/profile'
                  ? 'bg-neutral-200 dark:bg-neutral-700'
                  : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
              )}
            />
            <SidebarLink
              link={{
                label: 'Logout',
                href: '#',
                icon: <LogOut className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
              }}
              onClick={handleLogout}
              className="px-2 rounded-md transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
            />
          </div>
        </SidebarBody>
      </Sidebar>
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700 flex items-center px-6 flex-shrink-0">
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">
            {getCurrentPageTitle()}
          </h1>
        </header>
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-neutral-950 p-0 m-0">
          <div className="p-0 m-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
