import React, { useState, } from 'react';
import RoleBasedLayout from "../layouts/RoleBasedLayout";
import ThemeSettings from '../components/Settings/ThemeSettings';
import GSTSettings from '../components/Settings/GSTSettings';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');



  

 
 
 


  return (
    <RoleBasedLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Cafe Settings</h2>
            <p className="text-gray-600 mt-1">Manage your cafe configuration and preferences</p>
          </div>
        </div>

      

        <div className="bg-white rounded-xl shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                
                { name: 'theme', label: 'Theme' },
             
                { name: 'gst', label: 'GST & Tax' }
              ].map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.name
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
           
            {activeTab === 'theme' && (
              <div className="space-y-6">
                <ThemeSettings />
               
              </div>
            )}
          
            {activeTab === 'gst' && <GSTSettings />}
          </div>
        </div>
      </div>
    </RoleBasedLayout>
  );
}