import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  Heart, ChevronDown, Home, Users, Clipboard, Database, 
  FilePlus, FileText, LogOut, Menu, X
} from 'lucide-react';

function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const getNavItems = () => {
    switch (user?.role) {
      case 'admin':
        return [
          { name: 'Dashboard', icon: <Home size={20} />, href: '/admin' },
          { name: 'Staff Management', icon: <Users size={20} />, href: '/admin/staff' },
          { name: 'Add New Patient', icon: <FilePlus size={20} />, href: '/admin/patients/new' },
        ];
      case 'doctor':
      case 'staff':
        return [
          { name: 'Dashboard', icon: <Home size={20} />, href: '/doctor' },
          { name: 'Patient Records', icon: <Clipboard size={20} />, href: '/doctor' },
        ];
      case 'researcher':
        return [
          { name: 'Dashboard', icon: <Home size={20} />, href: '/researcher' },
          { name: 'Data Analysis', icon: <Database size={20} />, href: '/researcher' },
          { name: 'Research Data', icon: <FileText size={20} />, href: '/researcher' },
        ];
      default:
        return [{ name: 'Home', icon: <Home size={20} />, href: '/' }];
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white shadow-sm z-10">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center lg:hidden">
                <button
                  onClick={toggleSidebar}
                  className="text-gray-600 hover:text-gray-900 focus:outline-none"
                >
                  {isSidebarOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </button>
              </div>
              <div className="flex-shrink-0 flex items-center ml-4 lg:ml-0">
                <Link to="/" className="flex items-center">
                  <Heart className="h-8 w-8 text-primary-600" />
                  <span className="ml-2 text-xl font-semibold text-gray-900 hidden md:inline-block">ShieldCloud</span>
                </Link>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="ml-3 relative">
                <div>
                  <button
                    type="button"
                    className="flex items-center space-x-2 text-sm rounded-full focus:outline-none"
                    id="user-menu"
                    aria-expanded="false"
                    aria-haspopup="true"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="hidden md:block text-left">
                      <div className="text-sm font-medium text-gray-700">{user?.name}</div>
                      <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="ml-4 px-3 py-1 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <span className="hidden md:inline-block">Logout</span>
                <LogOut className="h-5 w-5 md:hidden" />
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <div className="flex-grow flex">
        {/* Sidebar for large screens */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 border-r border-gray-200 bg-white">
          <div className="flex-grow flex flex-col pt-5 overflow-y-auto">
            <nav className="flex-1 px-2 space-y-1">
              {getNavItems().map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                  <div className="mr-3 text-gray-500">{item.icon}</div>
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </aside>
        
        {/* Mobile sidebar */}
        {isSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            <div
              className="fixed inset-0 bg-gray-600 bg-opacity-75"
              aria-hidden="true"
              onClick={toggleSidebar}
            ></div>
            
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
              <div className="flex-grow flex flex-col pt-5 pb-4 overflow-y-auto">
                <nav className="mt-5 flex-1 px-2 space-y-1">
                  {getNavItems().map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      onClick={toggleSidebar}
                    >
                      <div className="mr-4 text-gray-500">{item.icon}</div>
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}
        
        {/* Main content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;