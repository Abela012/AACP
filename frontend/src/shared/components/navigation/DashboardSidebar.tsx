import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X, Zap, type LucideIcon } from 'lucide-react';
import { cn } from '@/src/shared/utils/cn';

export type SidebarNavItem = {
  name: string;
  icon: LucideIcon;
  path: string;
  badge?: string;
};

export type SidebarSection = {
  label?: string;
  items: SidebarNavItem[];
};

type DashboardSidebarProps = {
  brandHref: string;
  brandTitle?: string;
  brandSubtitle?: string;
  sections: SidebarSection[];
  footer?: ReactNode;
  midSlot?: ReactNode;
  expanded: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
  variant?: 'default' | 'admin';
  wide?: boolean;
};

export default function DashboardSidebar({
  brandHref,
  brandTitle = 'AACP',
  brandSubtitle,
  sections,
  footer,
  midSlot,
  expanded,
  mobileOpen,
  onMobileClose,
  variant = 'default',
  wide = false,
}: DashboardSidebarProps) {
  const location = useLocation();
  const isAdmin = variant === 'admin';
  const expandedWidth = wide ? 'w-72' : 'w-64';

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          onClick={onMobileClose}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          'dashboard-sidebar fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 ease-out',
          expanded ? expandedWidth : 'lg:w-[4.5rem]',
          'w-64',
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0',
          isAdmin
            ? 'bg-white dark:bg-[#0A0A0A] border-r border-[#EFEFEF] dark:border-white/5'
            : 'bg-white dark:bg-[#0a0a0a] border-r border-gray-100 dark:border-white/5'
        )}
        data-collapsed={!expanded}
      >
        <div
          className={cn(
            'flex items-center shrink-0 border-b border-transparent',
            expanded ? (isAdmin ? 'p-8 pb-4 justify-between' : 'p-6 justify-between') : 'lg:p-3 lg:justify-center p-6 justify-between',
            isAdmin && expanded && 'border-[#EFEFEF] dark:border-white/5',
            !isAdmin && expanded && 'border-gray-100 dark:border-white/5'
          )}
        >
          <Link
            to={brandHref}
            className={cn(
              'flex items-center min-w-0',
              expanded ? 'gap-2 lg:gap-3' : 'lg:justify-center'
            )}
            title={brandTitle}
          >
            <div
              className={cn(
                'shrink-0 bg-aacp-olive rounded-full flex items-center justify-center',
                isAdmin ? 'w-10 h-10' : 'w-8 h-8',
                isAdmin && 'shadow-lg shadow-aacp-gold/30 dark:shadow-none'
              )}
            >
              <Zap className={cn('text-white fill-white', isAdmin ? 'w-6 h-6' : 'w-5 h-5')} />
            </div>
            <div
              className={cn(
                'min-w-0 overflow-hidden transition-all duration-300',
                expanded ? 'opacity-100 w-auto' : 'lg:opacity-0 lg:w-0 lg:hidden opacity-100'
              )}
            >
              {isAdmin ? (
                <div>
                  <h1 className="text-sm font-black uppercase tracking-tight text-[#1A1D1F] dark:text-white leading-none truncate">
                    {brandTitle}
                  </h1>
                  {brandSubtitle && (
                    <span className="text-[10px] font-bold text-aacp-olive uppercase tracking-widest leading-none">
                      {brandSubtitle}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-xl font-bold tracking-tighter text-aacp-olive truncate block">
                  {brandTitle}
                </span>
              )}
            </div>
          </Link>
          <button
            type="button"
            className="lg:hidden shrink-0 p-1 text-gray-500"
            onClick={onMobileClose}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div
          className={cn(
            'flex-1 overflow-y-auto overflow-x-hidden',
            expanded ? (isAdmin ? 'px-4 py-8 space-y-6' : 'px-4 py-6 space-y-8') : 'lg:px-2 lg:py-4 px-4 py-6 space-y-4'
          )}
        >
          {sections.map((section, si) => (
            <div key={si}>
              {section.label && expanded && (
                <p
                  className={cn(
                    'text-[10px] font-bold uppercase tracking-widest mb-4 px-2',
                    isAdmin ? 'text-[#9A9FA5]' : 'text-gray-400 dark:text-gray-500'
                  )}
                >
                  {section.label}
                </p>
              )}
              {!expanded && section.label && (
                <div className="hidden lg:block h-px bg-gray-100 dark:bg-white/5 my-3 mx-2" aria-hidden />
              )}
              <nav className="space-y-1">
                {section.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      title={!expanded ? item.name : undefined}
                      onClick={onMobileClose}
                      className={cn(
                        'relative flex items-center rounded-xl text-sm font-medium transition-all group',
                        expanded
                          ? isAdmin
                            ? 'gap-4 px-4 py-3.5 rounded-2xl font-semibold'
                            : 'gap-3 px-3 py-2.5 justify-between'
                          : 'lg:justify-center lg:px-0 lg:py-2.5 px-3 py-2.5 gap-3',
                        isAdmin
                          ? isActive
                            ? 'text-aacp-olive bg-aacp-gold/20 dark:bg-aacp-olive/10'
                            : 'text-[#6F767E] hover:text-[#1A1D1F] dark:hover:text-white'
                          : isActive
                            ? 'bg-aacp-olive/10 text-aacp-olive'
                            : 'text-gray-500 dark:text-gray-400 hover:text-aacp-olive dark:hover:text-aacp-gold hover:bg-gray-50 dark:hover:bg-white/5'
                      )}
                    >
                      {isAdmin && isActive && expanded && (
                        <motion.div
                          layoutId="admin-nav-indicator"
                          className="absolute left-0 w-1 h-6 bg-aacp-olive rounded-r-full"
                        />
                      )}
                      <span className={cn('flex items-center shrink-0', expanded ? 'gap-3' : 'lg:gap-0')}>
                        <Icon
                          size={isAdmin ? 20 : 18}
                          className={cn(
                            isAdmin && !isActive && 'text-[#9A9FA5] group-hover:text-aacp-olive'
                          )}
                        />
                        <span
                          className={cn(
                            'truncate transition-all duration-200',
                            expanded ? 'opacity-100' : 'lg:hidden'
                          )}
                        >
                          {item.name}
                        </span>
                      </span>
                      {item.badge && expanded && (
                        <span className="bg-aacp-olive text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                          {item.badge}
                        </span>
                      )}
                      {item.badge && !expanded && (
                        <span className="hidden lg:flex absolute top-1 right-1 w-2 h-2 bg-aacp-olive rounded-full" />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}

          {midSlot && (
            <div
              className={cn(
                'transition-all duration-300',
                expanded ? '' : 'lg:[&_button]:px-0 lg:[&_button]:justify-center lg:[&_span]:hidden lg:[&_a]:px-0 lg:[&_a]:justify-center'
              )}
            >
              {midSlot}
            </div>
          )}
        </div>

        {footer && (
          <div
            className={cn(
              'mt-auto shrink-0 border-t',
              isAdmin ? 'border-[#EFEFEF] dark:border-white/5 p-4' : 'border-gray-100 dark:border-white/5 p-4',
              !expanded && 'lg:[&_button]:justify-center lg:[&_a]:justify-center lg:[&_span]:hidden'
            )}
          >
            {footer}
          </div>
        )}
      </aside>
    </>
  );
}
