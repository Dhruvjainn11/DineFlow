import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { 
  PlusIcon, 
  TrashIcon, 
  EyeIcon,
  BuildingOfficeIcon,
  UsersIcon,
  CreditCardIcon,
  ChartBarIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  PencilIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import CreateCafeModal from '../components/CreateCafeModal';
import EditCafeModal from '../components/EditCafeModal';

const SuperAdminCafeManagement = () => {
  const { isSuperAdmin } = useAuth();
  const [cafes, setCafes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCafe, setSelectedCafe] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    planType: '',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({});

  // Redirect if not super admin
  useEffect(() => {
    if (!isSuperAdmin()) {
      window.location.href = '/admin';
    }
  }, [isSuperAdmin]);

  // Fetch cafes and statistics
  useEffect(() => {
    fetchCafes();
    fetchStatistics();
  }, [filters]);


  

  const fetchCafes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(filters);
      const response = await api.get(`/cafes?${params}`);
      
      if (response.data.success) {
        setCafes(response.data.data.cafes);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch cafes:', error);
      toast.error('Failed to load cafes');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await api.get('/cafes/stats/overview');
      if (response.data.success) {
        setStatistics(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  };

  const handleCreateCafe = () => {
    setShowCreateModal(true);
  };



  const handleEditCafe = (cafe) => {
    setSelectedCafe(cafe);
    setShowEditModal(true);
  };

  const handleDeleteCafe = async (cafe) => {
    if (window.confirm(`Are you sure you want to deactivate ${cafe.name}?`)) {
      try {
        await api.delete(`/cafes/${cafe._id}`);
        toast.success('Cafe deactivated successfully');
        fetchCafes();
        fetchStatistics();
      } catch (error) {
        console.error('Failed to delete cafe:', error);
        toast.error('Failed to deactivate cafe');
      }
    }
  };

  const handleReactivateCafe = async (cafe) => {
    if (window.confirm(`Are you sure you want to reactivate ${cafe.name}?`)) {
      try {
        await api.put(`/cafes/${cafe._id}/reactivate`);
        toast.success('Cafe reactivated successfully');
        fetchCafes();
        fetchStatistics();
      } catch (error) {
        console.error('Failed to reactivate cafe:', error);
        toast.error('Failed to reactivate cafe');
      }
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
      suspended: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-blue-100 text-blue-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPlanBadge = (planType) => {
    const planColors = {
      basic: 'bg-blue-100 text-blue-800',
      pro: 'bg-purple-100 text-purple-800',
      trial: 'bg-indigo-100 text-indigo-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${planColors[planType] || 'bg-gray-100 text-gray-800'}`}>
        {planType?.toUpperCase()}
      </span>
    );
  };

  if (!isSuperAdmin()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-4 py-5 sm:px-6 lg:px-8 mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Cafe Management</h1>
                <p className="text-sm text-gray-500">Manage all cafes in the DineFlow platform</p>
              </div>
            </div>
            <button
              onClick={handleCreateCafe}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add New Cafe
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-100 p-3 rounded-md">
                    <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Cafes</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">{statistics.overview.totalCafes}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-100 p-3 rounded-md">
                    <UsersIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Active Cafes</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">{statistics.overview.activeCafes}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-purple-100 p-3 rounded-md">
                    <CreditCardIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Pro Plans</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">{statistics.overview.proCafes}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-yellow-100 p-3 rounded-md">
                    <ChartBarIcon className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Trial Cafes</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">{statistics.overview.trialCafes}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white shadow rounded-lg mb-6 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <FunnelIcon className="h-5 w-5 text-gray-500 mr-2" />
              Filters
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search cafes..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
                <select
                  value={filters.planType}
                  onChange={(e) => handleFilterChange('planType', e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">All Plans</option>
                  <option value="basic">Basic</option>
                  <option value="pro">Pro</option>
                  <option value="trial">Trial</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => setFilters({ search: '', status: '', planType: '', page: 1, limit: 10 })}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <ArrowPathIcon className="h-4 w-4 mr-2" />
                  Reset Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Cafes Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">All Cafes</h3>
            <div className="text-sm text-gray-500">
              Showing {((filters.page - 1) * filters.limit) + 1} to{' '}
              {Math.min(filters.page * filters.limit, pagination.totalCafes)} of{' '}
              {pagination.totalCafes} cafes
            </div>
          </div>

          {loading ? (
            <div className="px-6 py-12">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            </div>
          ) : cafes.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No cafes found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
              <div className="mt-6">
                <button
                  onClick={handleCreateCafe}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add New Cafe
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cafe
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cafes.map((cafe) => (
                    <tr key={cafe._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {cafe.theme?.logoUrl ? (
                              <img
                                src={cafe.theme.logoUrl}
                                alt={cafe.name}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{cafe.name}</div>
                            <div className="text-sm text-gray-500">{cafe.email}</div>
                            {cafe.subdomain && (
                              <a 
                                href={`https://${cafe.subdomain}.dineflow.com`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                {cafe.subdomain}.dineflow.com
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPlanBadge(cafe.subscription?.planType)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(cafe.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(cafe.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-3">
                          {/* Edit Button */}
                          <button
                            onClick={() => handleEditCafe(cafe)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit cafe details"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          
                          {/* Reactivate or Deactivate Button */}
                          {cafe.status === 'inactive' ? (
                            <button
                              onClick={() => handleReactivateCafe(cafe)}
                              className="text-green-600 hover:text-green-900"
                              title="Reactivate cafe"
                            >
                              <CheckCircleIcon className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDeleteCafe(cafe)}
                              className="text-red-600 hover:text-red-900"
                              title="Deactivate cafe"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handleFilterChange('page', filters.page - 1)}
                    disabled={!pagination.hasPrev}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handleFilterChange('page', filters.page + 1)}
                    disabled={!pagination.hasNext}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{((filters.page - 1) * filters.limit) + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(filters.page * filters.limit, pagination.totalCafes)}</span> of{' '}
                      <span className="font-medium">{pagination.totalCafes}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => handleFilterChange('page', filters.page - 1)}
                        disabled={!pagination.hasPrev}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Previous</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => handleFilterChange('page', page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            filters.page === page 
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => handleFilterChange('page', filters.page + 1)}
                        disabled={!pagination.hasNext}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Next</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateCafeModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCafeCreated={() => {
            fetchCafes();
            fetchStatistics();
          }}
        />
      )}
      
      {/* Edit Modal */}
      {showEditModal && selectedCafe && (
        <EditCafeModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedCafe(null);
          }}
          cafe={selectedCafe}
          onCafeUpdated={() => {
            fetchCafes();
            fetchStatistics();
          }}
        />
      )}
    </div>
  );
};



export default SuperAdminCafeManagement;