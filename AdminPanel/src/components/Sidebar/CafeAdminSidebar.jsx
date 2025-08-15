import { Link, useLocation } from "react-router-dom";
import React from "react";
import { useAuth } from "../../context/AuthContext";
import { FeatureToggle } from "../Common/FeatureGate";
import {
  ChartBarIcon,
  Squares2X2Icon,
  TagIcon,
  TableCellsIcon,
  ClipboardDocumentListIcon,
  CreditCardIcon,
  CogIcon
} from '@heroicons/react/24/outline';

const CafeAdminSidebar = () => {
  const { pathname } = useLocation();
  const { user, cafe, hasPermission, hasFeature } = useAuth();

  // Cafe Admin specific navigation links based on permissions
  const getNavigationLinks = () => {
    const links = [];

    // Analytics - permission-based
    if (hasPermission('canViewAnalytics')) {
      links.push({ 
        name: "Analytics", 
        path: "/admin/analytics", 
        icon: ChartBarIcon, 
        permission: 'canViewAnalytics',
        description: "View cafe analytics and insights"
      });
    }

    // Menu management - permission-based
    if (hasPermission('canManageMenu')) {
      links.push(
        { 
          name: "Menu", 
          path: "/admin/menu", 
          icon: Squares2X2Icon, 
          permission: 'canManageMenu',
          description: "Manage menu items and pricing"
        },
        { 
          name: "Categories", 
          path: "/admin/categories", 
          icon: TagIcon, 
          permission: 'canManageMenu',
          description: "Organize menu categories"
        }
      );
    }

    // Table management - permission-based
    if (hasPermission('canManageTables')) {
      links.push({ 
        name: "Tables", 
        path: "/admin/tables", 
        icon: TableCellsIcon, 
        permission: 'canManageTables',
        description: "Manage cafe tables and QR codes"
      });
    }

    // Order management - permission-based
    if (hasPermission('canManageOrders')) {
      links.push({ 
        name: "Orders", 
        path: "/admin/orders", 
        icon: ClipboardDocumentListIcon, 
        permission: 'canManageOrders',
        description: "View and manage customer orders"
      });
    }

    // Payment management - both permission and feature-based
    if (hasPermission('canManageOrders') && hasFeature('onlinePayments')) {
      links.push(
        { 
          name: "Payment", 
          path: "/admin/payment", 
          icon: CreditCardIcon, 
          feature: 'onlinePayments',
          description: "Manage payments and transactions"
        },
        { 
          name: "Payment Settings", 
          path: "/admin/payment-settings", 
          icon: CogIcon, 
          feature: 'onlinePayments',
          description: "Configure payment gateway settings"
        }
      );
    }

    // Settings for cafe admins - permission-based
    if (hasPermission('canManageSettings')) {
      links.push({ 
        name: "Settings", 
        path: "/admin/settings", 
        icon: CogIcon, 
        permission: 'canManageSettings',
        description: "Manage cafe settings and configuration"
      });
    }

    return links;
  };

  const navigationLinks = getNavigationLinks();

  // Get cafe branding
  const getBrandingName = () => {
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

  // Show loading state if user exists but cafe data is still loading
  if (user && user.cafeId && !cafe) {
    return (
      <aside className="w-64 bg-white h-screen shadow-md fixed flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading cafe data...</p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 bg-white h-screen shadow-md fixed">
      {/* Header with Cafe branding */}
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
              {cafe?.name ? cafe.name[0].toUpperCase() : 'D'}
            </div>
          )}
          <div>
            <div className="font-bold text-sm text-gray-900">{getBrandingName()}</div>
            {user && (
              <div className="text-xs text-gray-500 capitalize">
                {user.role?.replace('_', ' ')}
                {cafe?.subscription?.planType && (
                  <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
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
          
          // Create the link content
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
              title={link.description}
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

      {/* Footer with plan info */}
      {cafe && (
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

export default CafeAdminSidebar;
