import { Link, useLocation } from "react-router-dom";
import React from "react";
import { useAuth } from "../context/AuthContext";
import { FeatureToggle } from "../components/Common/FeatureGate";
import {
  ChartBarIcon,
  Squares2X2Icon,
  TagIcon,
  TableCellsIcon,
  ClipboardDocumentListIcon,
  CreditCardIcon,
  BuildingOfficeIcon,
  CogIcon
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const { pathname } = useLocation();
  const { user, cafe, isSuperAdmin, hasPermission, hasFeature } = useAuth();

  // Define navigation links based on user role and permissions
  const getNavigationLinks = () => {
    const links = [];

    // Super Admin links
    if (isSuperAdmin()) {
      links.push(
        { name: "Cafe Management", path: "/super-admin/cafes", icon: BuildingOfficeIcon, permission: null },
        { name: "System Analytics", path: "/super-admin/analytics", icon: ChartBarIcon, permission: null }
      );
      return links;
    }

    // Regular admin/cafe links
    if (hasPermission('canViewAnalytics')) {
      links.push({ name: "Analytics", path: "/admin/analytics", icon: ChartBarIcon, permission: 'canViewAnalytics' });
    }

    if (hasPermission('canManageMenu')) {
      links.push(
        { name: "Menu", path: "/admin/menu", icon: Squares2X2Icon, permission: 'canManageMenu' },
        { name: "Categories", path: "/admin/categories", icon: TagIcon, permission: 'canManageMenu' }
      );
    }

    if (hasPermission('canManageTables')) {
      links.push({ name: "Tables", path: "/admin/tables", icon: TableCellsIcon, permission: 'canManageTables' });
    }

    if (hasPermission('canManageOrders')) {
      links.push({ name: "Orders", path: "/admin/orders", icon: ClipboardDocumentListIcon, permission: 'canManageOrders' });
    }

    // Payment management - only show if cafe has online payments feature
    if (hasPermission('canManageOrders') && hasFeature('onlinePayments')) {
      links.push(
        { name: "Payment", path: "/admin/payment", icon: CreditCardIcon, feature: 'onlinePayments' },
        { name: "Payment Settings", path: "/admin/payment-settings", icon: CogIcon, feature: 'onlinePayments' }
      );
    }

    // Settings for cafe admins
    if (hasPermission('canManageSettings')) {
      links.push({ name: "Settings", path: "/admin/settings", icon: CogIcon, permission: 'canManageSettings' });
    }

    return links;
  };

  const navigationLinks = getNavigationLinks();

  // Get cafe branding
  const getBrandingName = () => {
    if (isSuperAdmin()) {
      return "DineFlow Super Admin";
    }
    
    if (cafe?.features?.whiteLabel && cafe?.name) {
      return `${cafe.name} Admin`;
    }
    
    return "DineFlow Admin";
  };

  const getBrandingLogo = () => {
    if (cafe?.features?.customBranding && cafe?.theme?.logoUrl) {
      return cafe.theme.logoUrl;
    }
    return null;
  };

  const primaryColor = cafe?.theme?.primaryColor || '#3B82F6';

  return (
    <aside className="w-64 bg-white h-screen shadow-md fixed">
      {/* Header with branding */}
      <div className="p-4 border-b">
        <div className="flex items-center space-x-3">
          {getBrandingLogo() ? (
            <img 
              src={getBrandingLogo()} 
              alt="Logo" 
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div 
              className="h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: primaryColor }}
            >
              {isSuperAdmin() ? 'SA' : (cafe?.name ? cafe.name[0] : 'D')}
            </div>
          )}
          <div>
            <div className="font-bold text-sm text-gray-900">{getBrandingName()}</div>
            {user && (
              <div className="text-xs text-gray-500 capitalize">
                {user.role?.replace('_', ' ')}
                {cafe?.subscription?.planType && (
                  <span className="ml-1 px-1.5 py-0.5 bg-gray-100 rounded text-xs">
                    {cafe.subscription.planType.toUpperCase()}
                  </span>
                )}
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
          
          // Wrap feature-gated items
          const linkContent = (
            <Link
              key={link.name}
              to={link.path}
              className={`flex items-center px-6 py-3 text-sm hover:bg-gray-100 transition-colors ${
                isActive 
                  ? "border-r-2 font-medium text-gray-900" 
                  : "text-gray-700"
              }`}
              style={{
                borderRightColor: isActive ? primaryColor : 'transparent'
              }}
            >
              <Icon className="h-5 w-5 mr-3" />
              {link.name}
            </Link>
          );

          // If the link has a feature requirement, wrap it with FeatureToggle
          if (link.feature) {
            return (
              <FeatureToggle key={link.name} feature={link.feature}>
                {linkContent}
              </FeatureToggle>
            );
          }

          return linkContent;
        })}
      </nav>

      {/* Footer with plan info (for non-super admins) */}
      {!isSuperAdmin() && cafe && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-gray-50">
          <div className="text-xs text-gray-600">
            <div className="flex items-center justify-between mb-1">
              <span>Current Plan:</span>
              <span className="font-semibold capitalize">
                {cafe.subscription?.planType || 'Basic'}
              </span>
            </div>
            {cafe.subscription?.planType === 'basic' && (
              <button 
                className="w-full text-xs text-blue-600 hover:text-blue-800 font-medium"
                onClick={() => {
                  // Handle upgrade click - could open a modal or redirect
                  console.log('Upgrade to Pro clicked');
                }}
              >
                Upgrade to Pro →
              </button>
            )}
            {cafe.subscription?.endDate && (
              <div className="text-xs text-gray-500 mt-1">
                Expires: {new Date(cafe.subscription.endDate).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
