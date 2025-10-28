import Navbar from "./Navbar.jsx";
import { Outlet } from "react-router-dom";
import LeftNavigation from "./LeftNavigation.jsx";

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navbar - Full Width */}
      <Navbar />
      
      <div className="flex">
        {/* Left Navigation Panel - Below Navbar */}
        <LeftNavigation />

        {/* Main Content Area */}
        <div className="lg:ml-64 flex-1 pt-16">
          {/* Main Content */}
          <main className="pt-4">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
