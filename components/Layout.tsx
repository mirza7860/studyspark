import React, { useState } from "react";
import { useNavigate, Outlet, Link } from "react-router-dom";
import { FiSidebar } from "react-icons/fi";

//- A re-usable component for the icons
const Icon = ({ path, className }: { path: string; className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className={`h-5 w-5 ${className}`}
    fill="currentColor"
  >
    <path d={path} />
  </svg>
);

const SideBar = () => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={`bg-gray-100 text-gray-800 ${
        isCollapsed ? "w-20" : "w-64"
      } p-4 flex flex-col sticky top-0 h-screen transition-all duration-300`}
    >
      <div className="flex items-center gap-3 mb-6">
        {!isCollapsed && (
          <Icon
            path="M12 2L2 7l10 5 10-5L12 2zM2 17l10 5 10-5-10-5L2 17z"
            className="h-8 w-8 text-blue-600"
          />
        )}
        {!isCollapsed && <h1 className="text-xl font-bold">StudySpark</h1>}
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="ml-2">
          <FiSidebar className="h-6 w-6" />
        </button>
      </div>

      <button
        onClick={() => navigate("/")}
        className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg w-full mb-6 hover:bg-blue-700 transition-colors"
      >
        {!isCollapsed ? "+ Create Space" : "+"}
      </button>

      <nav className="flex-grow">
        <ul>
          <li className="mb-2">
            <Link
              to={"/dashboard"}
              className="flex items-center p-2 text-base font-normal rounded-lg hover:bg-gray-200"
            >
              <Icon path="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />{" "}
              {!isCollapsed && <span className="ml-3">Spaces</span>}
            </Link>
          </li>
        </ul>
      </nav>
      <div className="mt-auto">
        <a
          href="/profile"
          className="flex items-center p-2 text-base font-normal rounded-lg hover:bg-gray-200"
        >
          <Icon path="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
          {!isCollapsed && <span className="ml-3">Profile & Settings</span>}
        </a>
      </div>
    </div>
  );
};

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <>
      <div className="min-h-screen min-w-screen flex bg-gray-50 font-sans">
        <SideBar />
        <main
          className="flex-1 overflow-auto"
          style={{ scrollbarGutter: "stable" }} // helps prevent layout shift in supporting browsers
        >
          <Outlet />
        </main>
      </div>
    </>
  );
};
