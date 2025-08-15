import { Link, useLocation } from "react-router-dom";
import React from "react";
import { useAuth } from "../../context/AuthContext";
import {
  ChartBarIcon,
  BuildingOfficeIcon,
  CogIcon
} from '@heroicons/react/24/outline';

const SuperAdminSidebar = () => {
  const { pathname } = useLocation();
  const { user } = useAuth();

  // Super Admin specific navigation links
  const navigationLinks = [
    { 
      name: "Cafe Management", 
      path: "/super-admin/cafes", 
      icon: BuildingOfficeIcon,
      description: "Manage all cafes in the system"
    },
    { 
      name: "System Analytics", 
      path: "/super-admin/analytics", 
      icon: ChartBarIcon,
      description: "View system-wide analytics and metrics"
    },
    {
      name: "System Settings",
      path: "/super-admin/settings",
      icon: CogIcon,
      description: "Configure global system settings"
    }
  ];

  const primaryColor = '#3B82F6'; // Default blue for Super Admin

  return (
    <aside className="w-64 bg-white h-screen shadow-md fixed">
      {/* Header with Super Admin branding */}
      <div className="p-4 border-b">
        <div className="flex items-center space-x-3">
          <div 
            className="h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ backgroundColor: primaryColor }}
          >
            SA
          </div>
          <div>
            <div className="font-bold text-sm text-gray-900">DineFlow Super Admin</div>
            {user && (
              <div className="text-xs text-gray-500 capitalize">
                {user.role?.replace('_', ' ')}
                <span className="ml-1 px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded text-xs">
                  SUPER ADMIN
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-4">
        {navigationLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.path;
          
          return (
            <Link
              key={link.name}
              to={link.path}
              className={`flex items-center px-6 py-3 text-sm hover:bg-gray-100 transition-colors ${
                isActive 
                  ? "border-r-2 font-medium text-gray-900 bg-gray-50" 
                  : "text-gray-700"
              }`}
              style={{
                borderRightColor: isActive ? primaryColor : 'transparent'
              }}
              title={link.description}
            >
              <Icon className="h-5 w-5 mr-3" />
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* Super Admin Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="text-xs text-gray-600">
          <div className="flex items-center justify-between mb-1">
            <span>System Access:</span>
            <span className="font-semibold text-purple-600">Full</span>
          </div>
          <div className="text-xs text-gray-500">
            Super Admin • Complete System Control
          </div>
        </div>
      </div>
    </aside>
  );
};

export default SuperAdminSidebar;
