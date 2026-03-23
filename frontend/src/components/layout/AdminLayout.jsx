import { useState, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import ChatbotWidget from '../ui/ChatbotWidget';

const AdminLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#F5F7FA] overflow-hidden font-sans">
      {/* Sidebar - Desktop */}
      <aside 
        className={`hidden lg:block transition-all duration-300 border-r border-gray-200 z-50
          ${isSidebarCollapsed ? 'w-24' : 'w-72'}
        `}
      >
        <Sidebar 
          isCollapsed={isSidebarCollapsed} 
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
        />
      </aside>

      {/* Sidebar - Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-[60] transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      <aside 
        className={`lg:hidden fixed inset-y-0 left-0 w-72 bg-[#2563EB] z-[70] transition-transform duration-300 transform
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar onMenuClick={() => setIsMobileMenuOpen(true)} isCollapsed={isSidebarCollapsed} />
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-surface">
          <div className="w-full max-w-[1440px] mx-auto px-6 py-6 lg:px-8 lg:py-8">
            <Suspense fallback={
              <div className="flex items-center justify-center h-full">
                <div className="w-10 h-10 border-4 border-[#1677FF] border-t-transparent rounded-full animate-spin"></div>
              </div>
            }>
              <Outlet />
            </Suspense>
          </div>
          
          {/* Footer */}
          <footer className="mt-12 pt-8 border-t border-gray-200 text-center text-[13px] text-gray-400 pb-8">
            © 2026 PAYROLLPRO • ENTERPRISE SALARY MANAGEMENT SYSTEM
          </footer>
        </main>
      </div>
      <ChatbotWidget />
    </div>
  );
};

export default AdminLayout;
