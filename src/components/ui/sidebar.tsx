import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import React, { useState, createContext, useContext, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

interface Links {
  label: string;
  href: string;
  icon: React.JSX.Element | React.ReactNode;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
  isExpanded: boolean;
  setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate, isExpanded, setIsExpanded }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <>
      <DesktopSidebar className={className}>{children}</DesktopSidebar>
      <MobileSidebar className={className}>{children}</MobileSidebar>
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  const { isExpanded, setIsExpanded } = useSidebar();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isHoveringRef = useRef(false);

  const clearCloseTimeout = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  const handleMouseEnter = useCallback(() => {
    clearCloseTimeout();
    isHoveringRef.current = true;
    setIsExpanded(true);
  }, [setIsExpanded, clearCloseTimeout]);

  const handleMouseLeave = useCallback((e: React.MouseEvent) => {
    isHoveringRef.current = false;
    
    // Check if mouse is moving to a child element
    const relatedTarget = e.relatedTarget as HTMLElement | null;
    if (relatedTarget && sidebarRef.current && sidebarRef.current?.contains(relatedTarget)) {
      return;
    }

    // Delay closing to prevent flickering
    clearCloseTimeout();
    closeTimeoutRef.current = setTimeout(() => {
      if (!isHoveringRef.current) {
        setIsExpanded(false);
      }
    }, 250);
  }, [setIsExpanded, clearCloseTimeout]);

  // Keep sidebar open while mouse is moving inside
  const handleMouseMove = useCallback(() => {
    if (!isHoveringRef.current) {
      isHoveringRef.current = true;
      setIsExpanded(true);
    }
    clearCloseTimeout();
  }, [setIsExpanded, clearCloseTimeout]);

  useEffect(() => {
    return () => {
      clearCloseTimeout();
    };
  }, [clearCloseTimeout]);

  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Don't render on mobile
  if (isMobile) {
    return null;
  }

  return (
    <motion.div
      ref={sidebarRef}
      className={cn(
        "px-4 py-4 hidden md:flex md:flex-col bg-neutral-800 flex-shrink-0 relative",
        className
      )}
      animate={{
        width: isExpanded ? "300px" : "60px",
      }}
      transition={{
        duration: 0.2,
        ease: "easeInOut",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  );
};

export const MobileSidebar = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  const { open, setOpen } = useSidebar();
  
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ x: "-100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "-100%", opacity: 0 }}
          transition={{
            duration: 0.3,
            ease: "easeInOut",
          }}
          className={cn(
            "fixed h-full w-full inset-0 bg-neutral-900 p-10 z-[100] flex flex-col justify-between",
            className
          )}
        >
          <div
            className="absolute right-10 top-10 z-50 text-neutral-200 cursor-pointer"
            onClick={() => setOpen(false)}
          >
            <X className="h-6 w-6" />
          </div>
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const SidebarLink = ({
  link,
  className,
  onClick,
  ...props
}: {
  link: Links;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
} & Omit<React.ComponentProps<typeof Link>, 'to' | 'onClick'>) => {
  const { open, animate, isExpanded } = useSidebar();
  const [isMobile, setIsMobile] = React.useState(false);

  // Detect if we're on mobile
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // On mobile (when sidebar is open), always show text
  // On desktop, show text when expanded
  const shouldShowText = isMobile ? open : isExpanded;

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (onClick) {
      onClick(e);
    }
  };

  const linkContent = (
    <>
      {link.icon}
      <motion.span
        animate={{
          opacity: shouldShowText ? 1 : 0,
          width: shouldShowText ? "auto" : 0,
        }}
        transition={{ duration: 0.2 }}
        className="text-neutral-200 text-sm whitespace-nowrap overflow-hidden inline-block"
      >
        {link.label}
      </motion.span>
    </>
  );

  // If href is "#" or onClick is provided, render as button
  if (link.href === "#" || onClick) {
    return (
      <button
        onClick={handleClick}
        className={cn(
          "flex items-center justify-start gap-3 py-2 w-full text-left",
          className
        )}
        {...(props as any)}
      >
        {linkContent}
      </button>
    );
  }

  // Otherwise, render as Link
  return (
    <Link
      to={link.href}
      className={cn(
        "flex items-center justify-start gap-3 py-2",
        className
      )}
      {...props}
    >
      {linkContent}
    </Link>
  );
};
