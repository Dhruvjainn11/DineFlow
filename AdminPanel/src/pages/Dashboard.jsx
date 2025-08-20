import RoleBasedLayout from "../layouts/RoleBasedLayout";
import React from "react";
import { useAuth } from "../context/AuthContext";
import RealtimeTestPanel from "../components/RealtimeTestPanel";

const Dashboard = () => {
  const { isSuperAdmin } = useAuth();
  
  return (
    <RoleBasedLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {isSuperAdmin() ? 'Super Admin Dashboard' : 'Cafe Admin Dashboard'}
          </h1>
          <p className="text-gray-600">
            {isSuperAdmin() 
              ? 'Welcome to the DineFlow Super Admin panel. You have complete control over the system.' 
              : 'Welcome to your cafe management dashboard. Manage your cafe operations from here.'}
          </p>
        </div>
        
        {/* Dashboard content will be added here */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Real-time Test Panel - for development/testing */}
          {process.env.NODE_ENV === 'development' && (
            <RealtimeTestPanel />
          )}
          {/* Dashboard cards/widgets can be added here */}
        </div>
      </div>
    </RoleBasedLayout>
  );
};

export default Dashboard;
