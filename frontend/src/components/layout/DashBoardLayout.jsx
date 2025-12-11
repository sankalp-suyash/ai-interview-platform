import { useState, useEffect } from "react";
import { Code, Mic, FileText, LogOut, Menu, X, User, Crown, Zap, Star } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ProfileDropdown from "./ProfileDropdown";

const NavigationItem = ({ item, isActive, onClick, isCollapsed }) => {
  const Icon = item.icon;

  return (
    <button
      onClick={() => onClick(item.path)}
      className={`
          w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group ${
            isActive
              ? " bg-blue-100 text-blue-900 font-bold hover:bg-blue-200 hover:text-blue-950 shadow-sm shadow-blue-200"
              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          }`}
    >
      <Icon
        className={`w-5 h-5 flex-shrink-0 ${
          isActive ? "text-blue-900" : "text-gray-600"
        }`}
      />
      {!isCollapsed && <span className="ml-3 truncate">{item.name}</span>}
      {item.premium && !isCollapsed && (
        <Crown className="w-4 h-4 ml-auto text-amber-500" />
      )}
    </button>
  );
};

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState("/dashboard");
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const NAVIGATION_MENU = [
    { id: "dashboard", name: "Dashboard", icon: FileText, path: "/dashboard" },
    { id: "coding", name: "Coding Interviews", icon: Code, path: "/coding" },
    { id: "behavioral", name: "Behavioral Interviews", icon: Mic, path: "/behavioral" },
    { id: "profile", name: "Profile", icon: User, path: "/profile" },
  ];

  // Free user features (2 per week)
  const freeUserFeatures = [
    { name: "Coding Interviews", used: 0, total: 2, icon: Code },
    { name: "Behavioral Interviews", used: 0, total: 2, icon: Mic }
  ];

  // Sync activeNavItem with current route
  useEffect(() => {
    const currentPath = location.pathname;
    setActiveNavItem(currentPath);
  }, [location.pathname]);

  // Responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleNavigation = (path) => {
    setActiveNavItem(path);
    navigate(path);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const sidebarCollapsed = !isMobile && false;

  const handleGoPremium = () => {
    console.log("Go Premium clicked");
    navigate("/premium");
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const isFreeUser = true; // You can replace this with actual user tier check

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 transform ${
          isMobile
            ? sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
            : "translate-x-0"
        } ${
          sidebarCollapsed ? "w-16" : "w-64"
        } bg-white border-r border-gray-200 flex flex-col`}
      >
        {/* Company logo */}
        <div className="flex items-center h-16 border-b border-gray-200 px-6">
          <Link
            className="flex items-center space-x-3"
            to="/dashboard"
            onClick={() => setActiveNavItem("/dashboard")}
          >
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
              <Code className="w-5 h-5 text-black" />
            </div>
            {!sidebarCollapsed && (
              <span className="text-gray-900 text-xl font-bold">
                MIND<span className="text-amber-500">MOCK</span>
              </span>
            )}
          </Link>
        </div>

        {/* Weekly Usage Stats for Free Users */}
        {isFreeUser && !sidebarCollapsed && (
          <div className="p-4 border-b border-gray-200">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                <Zap className="w-4 h-4 mr-2 text-amber-500" />
                Weekly Practice
              </h3>
              <p className="text-xs text-gray-600 mb-3">
                {2 - 0} interviews remaining this week
              </p>
            </div>
            <div className="space-y-2">
              {freeUserFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <div className="flex items-center">
                      <Icon className="w-3 h-3 mr-2 text-gray-500" />
                      <span className="text-gray-700">{feature.name}</span>
                    </div>
                    <span className="text-gray-900 font-medium">
                      {feature.used}/{feature.total}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="p-4 space-y-2 flex-1">
          {NAVIGATION_MENU.map((item) => (
            <NavigationItem
              key={item.id}
              item={item}
              isActive={activeNavItem === item.path}
              onClick={handleNavigation}
              isCollapsed={sidebarCollapsed}
            />
          ))}
        </nav>

        {/* Upgrade Banner for Free Users */}
        {isFreeUser && !sidebarCollapsed && (
          <div className="p-4 border-t border-gray-200">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg p-4 text-white text-center">
              <Crown className="w-6 h-6 mx-auto mb-2" />
              <h4 className="font-semibold text-sm mb-1">Unlock Unlimited</h4>
              <p className="text-xs text-amber-100 mb-3">
                Get unlimited AI interviews + human practice
              </p>
              <button
                onClick={handleGoPremium}
                className="w-full bg-white text-amber-600 py-2 px-3 rounded text-xs font-semibold hover:bg-gray-100 transition-colors"
              >
                Go Premium
              </button>
            </div>
          </div>
        )}

        {/* Go Premium Button for non-free users or collapsed sidebar */}
        {(!isFreeUser || sidebarCollapsed) && (
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleGoPremium}
              className="w-full flex items-center justify-center px-3 py-2.5 text-sm font-medium rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Crown className="w-5 h-5 mr-2" />
              {!sidebarCollapsed && (
                <span className="font-bold">Go Premium</span>
              )}
            </button>
          </div>
        )}

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={logout}
            className="w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors"
          >
            <LogOut className="w-5 h-5 text-gray-700 flex-shrink-0" />
            {!sidebarCollapsed && (
              <span className="ml-2 font-medium">Logout</span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/10 z-40 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isMobile ? "ml-0" : sidebarCollapsed ? "ml-16" : "ml-64"
        }`}
      >
        {/* Top Bar */}
        <header className="bg-white backdrop-blur-sm border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            {isMobile && (
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-xl hover:bg-gray-100"
              >
                {sidebarOpen ? (
                  <X className="w-5 h-5 text-gray-700" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-700" />
                )}
              </button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user?.name}!
              </h1>
              {isFreeUser && (
                <p className="text-sm text-gray-600">
                  <Star className="w-4 h-4 inline mr-1 text-amber-500" />
                  Free Plan - {2 - 0} interviews remaining this week
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Go Premium Button in Header */}
            {isFreeUser && (
              <button
                onClick={handleGoPremium}
                className="hidden md:flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Crown className="w-4 h-4 mr-2" />
                Go Premium
              </button>
            )}

            {/* Profile Dropdown */}
            <ProfileDropdown
              isOpen={profileDropdownOpen}
              onToggle={(e) => {
                e.stopPropagation();
                setProfileDropdownOpen(!profileDropdownOpen);
              }}
              user={user}
              onLogout={logout}
            />
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 bg-gray-50 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;