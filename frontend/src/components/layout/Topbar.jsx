import { Search, Bell, Menu } from 'lucide-react';

const Topbar = ({ onMenuClick, isCollapsed }) => {
  let user = { full_name: 'Admin' };
  try { user = JSON.parse(localStorage.getItem('payroll_user') || '{"full_name": "Admin"}'); } catch {}
  const role = localStorage.getItem('payroll_role');

  return (
    <header className="h-[64px] bg-white border-b border-border flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Left: Hamburger (Mobile) + Path */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden text-text-muted hover:text-text-primary transition-colors"
        >
          <Menu size={20} />
        </button>
        
        <div className="hidden sm:flex items-center text-sm font-medium">
          <span className="text-text-secondary capitalize">{role || 'Admin'}</span>
          <span className="text-text-muted mx-2">/</span>
          <span className="text-text-primary capitalize">{window.location.pathname.split('/').pop().replace(/-/g, ' ') || 'Dashboard'}</span>
        </div>
      </div>

      {/* Right: Search, Notifications, Profile */}
      <div className="flex items-center gap-6">
        <div className="relative group hidden md:block">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search..."
            className="w-64 bg-surface border border-border focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary rounded-input py-1.5 pl-9 pr-3 text-sm outline-none transition-all placeholder:text-text-muted"
          />
        </div>

        <button className="text-text-muted hover:text-primary relative transition-colors">
          <Bell size={18} />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-status-danger-text rounded-full border-2 border-white"></span>
        </button>

        <div className="flex items-center gap-3 pl-6 border-l border-border">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-text-primary leading-tight">{user.full_name}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold">
            {(user.full_name || 'A').charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
