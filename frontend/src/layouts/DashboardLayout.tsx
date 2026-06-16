import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Layout/Sidebar';
import { Header } from '../components/Layout/Header';
import { useUiStore } from '../store/uiStore';

export default function DashboardLayout() {
  const { mobileSidebarOpen, setMobileSidebarOpen } = useUiStore();

  return (
    <div className="flex h-screen bg-radial-glow overflow-hidden">
      {/* Mobile Sidebar Backdrop Drawer Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Collapsible & Responsive */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <Header />

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}