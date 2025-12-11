import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { TrendingUp, BookOpen, Activity, Home, Settings } from 'lucide-react';
import { APP_NAME } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: '概览', icon: <Home size={18} /> },
    { path: '/learn', label: '核心课程', icon: <BookOpen size={18} /> },
    { path: '/simulator', label: '实战模拟', icon: <Activity size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      
      {/* Sidebar Navigation (Desktop) */}
      <nav className="hidden md:flex flex-col w-72 bg-white border-r border-gray-200 h-screen sticky top-0 z-50">
        <div className="p-6">
          <Link to="/" className="flex items-center space-x-3 mb-8">
            <div className="w-8 h-8 bg-brand-600 text-white flex items-center justify-center rounded-lg shadow-sm">
              <TrendingUp size={18} strokeWidth={3} />
            </div>
            <span className="font-bold text-lg text-gray-900 tracking-tight">{APP_NAME}</span>
          </Link>

          <div className="space-y-1">
            <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Platform</p>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-gray-100 text-gray-900' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                  `}
                >
                  <span className={isActive ? 'text-brand-600' : 'text-gray-500'}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
        
        <div className="mt-auto p-6 border-t border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xs">
              P
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Pro Account</p>
              <p className="text-xs text-gray-500">Unlimited Access</p>
            </div>
            <Settings size={16} className="ml-auto text-gray-400 cursor-pointer hover:text-gray-600" />
          </div>
        </div>
      </nav>

      {/* Mobile Header */}
      <div className="md:hidden bg-white/80 backdrop-blur-md border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-50">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-brand-600 text-white flex items-center justify-center rounded-lg">
             <TrendingUp size={18} />
          </div>
          <span className="font-bold text-lg text-gray-900">{APP_NAME}</span>
        </Link>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-50 pb-safe safe-area-bottom">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center space-y-1 w-full h-full ${
                   isActive ? 'text-brand-600' : 'text-gray-500'
                }`}
              >
                {item.icon}
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-screen-2xl mx-auto px-4 md:px-8 py-8 md:py-12 pb-24 md:pb-12 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
};

export default Layout;