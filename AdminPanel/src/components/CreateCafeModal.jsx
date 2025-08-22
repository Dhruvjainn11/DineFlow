import React, { useState, useEffect, useRef } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import api from '../utils/api';
import { toast } from 'react-toastify';
// import { useTheme } from '../context/ThemeContext';

const CreateCafeModal = ({ isOpen, onClose, onCafeCreated }) => {
  // const { refreshTheme } = useTheme();
  // Initialize with default values to prevent controlled/uncontrolled warnings
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    planType: 'basic',
    subdomain: '',
    theme: {
      primaryColor: '#3B82F6',
      secondaryColor: '#F3F4F6',
      fontFamily: 'Inter'
    },
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India'
    },
    adminUser: {
      username: '',
      password: '',
      profile: {
        firstName: '',
        lastName: '',
        phone: ''
      }
    }
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef(null);
  const firstInputRef = useRef(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        email: '',
        phone: '',
        planType: 'basic',
        subdomain: '',
        theme: {
          primaryColor: '#3B82F6',
          secondaryColor: '#F3F4F6',
          fontFamily: 'Inter'
        },
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'India'
        },
        adminUser: {
          username: '',
          password: '',
          profile: {
            firstName: '',
            lastName: '',
            phone: ''
          }
        }
      });
      setErrors({});
      setIsSubmitting(false);
      
      // Focus first input after modal opens
      setTimeout(() => {
        if (firstInputRef.current) {
          firstInputRef.current.focus();
        }
      }, 100);
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Handle click outside modal
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleInputChange = (field, value) => {
    // Ensure value is never undefined
    const safeValue = value || '';
    
    if (field.includes('.')) {
      const parts = field.split('.');
      if (parts.length === 2) {
        const [parent, child] = parts;
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: safeValue
          }
        }));
      } else if (parts.length === 3) {
        const [parent, child, grandChild] = parts;
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: {
              ...prev[parent][child],
              [grandChild]: safeValue
            }
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: safeValue
      }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Cafe name is required';
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !/^[+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.planType) {
      newErrors.planType = 'Subscription plan is required';
    }

    // Validate subdomain for Pro plan
    if (formData.planType === 'pro' && !formData.subdomain?.trim()) {
      newErrors.subdomain = 'Subdomain is required for Pro plan';
    } else if (formData.subdomain && !/^[a-z0-9-]+$/.test(formData.subdomain)) {
      newErrors.subdomain = 'Subdomain must contain only lowercase letters, numbers, and hyphens';
    }

    // Validate admin user (always required)
    if (!formData.adminUser?.username?.trim()) {
      newErrors['adminUser.username'] = 'Admin username is required';
    }
    if (!formData.adminUser?.password?.trim()) {
      newErrors['adminUser.password'] = 'Admin password is required';
    } else if (formData.adminUser.password.length < 6) {
      newErrors['adminUser.password'] = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateUniqueUsername = (baseName) => {
    const timestamp = Date.now().toString().slice(-4);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${baseName.toLowerCase().replace(/[^a-z0-9]/g, '')}_${timestamp}_${random}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Prepare the payload
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        planType: formData.planType
      };

      // Add phone only if provided and valid
      if (formData.phone?.trim()) {
        const cleanPhone = formData.phone.replace(/\D/g, '');
        if (cleanPhone.length >= 10) {
          payload.phone = cleanPhone;
        }
      }

      // Add address only if any field is filled
      const addressFields = formData.address || {};
      const hasAddressData = Object.values(addressFields).some(value => value?.trim());
      if (hasAddressData) {
        payload.address = {};
        Object.keys(addressFields).forEach(key => {
          if (addressFields[key]?.trim()) {
            payload.address[key] = addressFields[key].trim();
          }
        });
      }

      // Add subdomain for Pro plan
      // if (formData.planType === 'pro' && formData.subdomain?.trim()) {
      //   payload.subdomain = formData.subdomain.trim();
      // }

      // Add theme
      if (formData.theme) {
        payload.theme = formData.theme;
      }

      // Add admin user (always required now)
      if (formData.adminUser?.username?.trim() && formData.adminUser?.password?.trim()) {
        payload.adminUser = {
          username: formData.adminUser.username.trim(),
          password: formData.adminUser.password.trim(),
          profile: {}
        };
        
        // Add profile fields if they exist
        const profileData = formData.adminUser.profile || {};
        Object.keys(profileData).forEach(key => {
          if (profileData[key]?.trim()) {
            payload.adminUser.profile[key] = profileData[key].trim();
          }
        });
      }

      console.log('=== FRONTEND DEBUG ===');
      console.log('Sending payload:', JSON.stringify(payload, null, 2));

      const response = await api.post('/cafes', payload);
      
      if (response.data.success) {
        toast.success('Cafe created successfully! 🎉');
        
        onClose();
        
        // Call the callback to refresh the cafe list
        if (onCafeCreated) {
          onCafeCreated();
        }
        
        // Auto-login as the new cafe admin to apply theme
      //   setTimeout(async () => {
      //     console.log('🔄 Auto-login as new cafe admin');
      //     try {
      //       const loginResponse = await api.post('/auth/login', {
      //         username: formData.adminUser.username.trim(),
      //         password: formData.adminUser.password.trim()
      //       });
            
      //       if (loginResponse.data.success) {
      //         // Store new token
      //         localStorage.setItem('token', loginResponse.data.token);
      //         // Reload page to apply new user context and theme
      //         window.location.reload();
      //       }
      //     } catch (error) {
      //       console.error('Auto-login failed:', error);
      //       // Fallback: just refresh theme
      //       refreshTheme();
      //     }
      //   }, 500);
      // } else {
      //   toast.error(response.data.message || 'Failed to create cafe');
      }
    } catch (error) {
      console.error('Error creating cafe:', error);
      
      // Handle backend errors
      if (error.response?.data?.message) {
        const errorMessage = error.response.data.message;
        
        if (errorMessage.includes('email already exists')) {
          toast.error('A cafe with this email already exists. Please use a different email address.');
          setErrors({ email: 'This email is already registered with another cafe' });
        } else if (errorMessage.includes('Username') && errorMessage.includes('already taken')) {
          toast.error(errorMessage);
          setErrors({ 'adminUser.username': 'This username is already taken' });
          
          // Suggest a unique username
          const suggestedUsername = generateUniqueUsername(formData.adminUser.username || 'user');
          toast.info(`Try this username: ${suggestedUsername}`, { autoClose: 8000 });
        } else if (errorMessage.includes('subdomain')) {
          toast.error(errorMessage);
          setErrors({ subdomain: 'This subdomain is already taken' });
        } else {
          toast.error(errorMessage);
        }
      } else if (error.response?.data?.errors) {
        // Handle validation errors
        const backendErrors = {};
        error.response.data.errors.forEach(err => {
          const fieldPath = err.path || err.field;
          if (fieldPath) {
            backendErrors[fieldPath] = err.message;
          }
        });
        setErrors(backendErrors);
        toast.error('Please fix the validation errors below');
      } else {
        toast.error('Failed to create cafe. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div
          ref={modalRef}
          className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl"
          role="document"
        >
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 
                className="text-lg font-medium leading-6 text-gray-900"
                id="modal-title"
              >
                Create New Cafe
              </h3>
              <button
                type="button"
                className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={onClose}
                aria-label="Close modal"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Basic Info */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900 border-b pb-2">Basic Information</h4>
                  
                  {/* Cafe Name */}
                  <div>
                    <label 
                      htmlFor="name" 
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Cafe Name *
                    </label>
                    <input
                      ref={firstInputRef}
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter cafe name"
                      aria-invalid={errors.name ? 'true' : 'false'}
                      aria-describedby={errors.name ? 'name-error' : undefined}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600" id="name-error">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label 
                      htmlFor="email" 
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter cafe email"
                      aria-invalid={errors.email ? 'true' : 'false'}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600" id="email-error">
                        {errors.email}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Use a unique email address - each cafe needs a different email
                    </p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label 
                      htmlFor="phone" 
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                        errors.phone ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter cafe phone number"
                      aria-invalid={errors.phone ? 'true' : 'false'}
                      aria-describedby={errors.phone ? 'phone-error' : undefined}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600" id="phone-error">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  {/* Subscription Plan */}
                  <div>
                    <label 
                      htmlFor="planType" 
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Subscription Plan *
                    </label>
                    <select
                      id="planType"
                      name="planType"
                      value={formData.planType || 'basic'}
                      onChange={(e) => handleInputChange('planType', e.target.value)}
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                        errors.planType ? 'border-red-300' : 'border-gray-300'
                      }`}
                      aria-invalid={errors.planType ? 'true' : 'false'}
                      aria-describedby={errors.planType ? 'planType-error' : undefined}
                    >
                      <option value="basic">Basic</option>
                      <option value="pro">Pro</option>
                    </select>
                    {errors.planType && (
                      <p className="mt-1 text-sm text-red-600" id="planType-error">
                        {errors.planType}
                      </p>
                    )}
                  </div>
                  
                  {/* Theme Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {[
                        { name: 'Blue', primary: '#3B82F6', secondary: '#F3F4F6' },
                        { name: 'Green', primary: '#10B981', secondary: '#ECFDF5' },
                        { name: 'Purple', primary: '#8B5CF6', secondary: '#F3E8FF' },
                        { name: 'Red', primary: '#EF4444', secondary: '#FEF2F2' },
                        { name: 'Amber', primary: '#F59E0B', secondary: '#FEF3C7' },
                        { name: 'Gray', primary: '#6B7280', secondary: '#F9FAFB' }
                      ].map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => {
                            handleInputChange('theme.primaryColor', preset.primary);
                            handleInputChange('theme.secondaryColor', preset.secondary);
                          }}
                          className={`p-2 rounded border text-xs ${
                            formData.theme?.primaryColor === preset.primary
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center space-x-1 mb-1">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: preset.primary }}
                            />
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: preset.secondary }}
                            />
                          </div>
                          <div>{preset.name}</div>
                        </button>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Primary Color
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={formData.theme?.primaryColor || '#3B82F6'}
                            onChange={(e) => handleInputChange('theme.primaryColor', e.target.value)}
                            className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={formData.theme?.primaryColor || '#3B82F6'}
                            onChange={(e) => handleInputChange('theme.primaryColor', e.target.value)}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Font
                        </label>
                        <select
                          value={formData.theme?.fontFamily || 'Inter'}
                          onChange={(e) => handleInputChange('theme.fontFamily', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                        >
                          <option value="Inter">Inter</option>
                          <option value="Roboto">Roboto</option>
                          <option value="Poppins">Poppins</option>
                          <option value="Open Sans">Open Sans</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Subdomain for Pro Plan */}
                  {/* {formData.planType === 'pro' && (
                    <div>
                      <label 
                        htmlFor="subdomain" 
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Subdomain *
                      </label>
                      <div className="flex rounded-md shadow-sm">
                        <input
                          type="text"
                          id="subdomain"
                          name="subdomain"
                          value={formData.subdomain || ''}
                          onChange={(e) => handleInputChange('subdomain', e.target.value)}
                          className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md border focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                            errors.subdomain ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="mycafe"
                          aria-invalid={errors.subdomain ? 'true' : 'false'}
                          aria-describedby={errors.subdomain ? 'subdomain-error' : undefined}
                        />
                        <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                          .dineflow.com
                        </span>
                      </div>
                      {errors.subdomain && (
                        <p className="mt-1 text-sm text-red-600" id="subdomain-error">
                          {errors.subdomain}
                        </p>
                      )}
                    </div>
                  )} */}
                </div>

                {/* Right Column - Address & Admin User */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900 border-b pb-2">Address & Admin</h4>
                  
                  {/* Street Address */}
                  <div>
                    <label 
                      htmlFor="address.street" 
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Street Address
                    </label>
                    <input
                      type="text"
                      id="address.street"
                      name="address.street"
                      value={formData.address?.street || ''}
                      onChange={(e) => handleInputChange('address.street', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Enter street address"
                    />
                  </div>

                  {/* City & State */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label 
                        htmlFor="address.city" 
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        City
                      </label>
                      <input
                        type="text"
                        id="address.city"
                        name="address.city"
                        value={formData.address?.city || ''}
                        onChange={(e) => handleInputChange('address.city', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label 
                        htmlFor="address.state" 
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        State
                      </label>
                      <input
                        type="text"
                        id="address.state"
                        name="address.state"
                        value={formData.address?.state || ''}
                        onChange={(e) => handleInputChange('address.state', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="State"
                      />
                    </div>
                  </div>

                  {/* ZIP Code & Country */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label 
                        htmlFor="address.zipCode" 
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        id="address.zipCode"
                        name="address.zipCode"
                        value={formData.address?.zipCode || ''}
                        onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="ZIP Code"
                      />
                    </div>
                    <div>
                      <label 
                        htmlFor="address.country" 
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Country
                      </label>
                      <input
                        type="text"
                        id="address.country"
                        name="address.country"
                        value={formData.address?.country || ''}
                        onChange={(e) => handleInputChange('address.country', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Country"
                      />
                    </div>
                  </div>

                  {/* Admin User - Required for all plans */}
                  <div className="border-t pt-4">
                    <h5 className="text-sm font-medium text-gray-900 mb-3">Admin User (Required)</h5>
                  </div>
                      
                      {/* Username & Password */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label 
                            htmlFor="adminUser.username" 
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Username *
                          </label>
                          <input
                            type="text"
                            id="adminUser.username"
                            name="adminUser.username"
                            value={formData.adminUser?.username || ''}
                            onChange={(e) => handleInputChange('adminUser.username', e.target.value)}
                            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                              errors['adminUser.username'] ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Admin username"
                            aria-invalid={errors['adminUser.username'] ? 'true' : 'false'}
                            aria-describedby={errors['adminUser.username'] ? 'adminUser-username-error' : undefined}
                          />
                          {errors['adminUser.username'] && (
                            <p className="mt-1 text-sm text-red-600" id="adminUser-username-error">
                              {errors['adminUser.username']}
                            </p>
                          )}
                          <p className="mt-1 text-xs text-gray-500">
                            Username must be unique across all cafes
                          </p>
                        </div>
                        <div>
                          <label 
                            htmlFor="adminUser.password" 
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Password *
                          </label>
                          <input
                            type="password"
                            id="adminUser.password"
                            name="adminUser.password"
                            value={formData.adminUser?.password || ''}
                            onChange={(e) => handleInputChange('adminUser.password', e.target.value)}
                            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                              errors['adminUser.password'] ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Admin password"
                            aria-invalid={errors['adminUser.password'] ? 'true' : 'false'}
                            aria-describedby={errors['adminUser.password'] ? 'adminUser-password-error' : undefined}
                          />
                          {errors['adminUser.password'] && (
                            <p className="mt-1 text-sm text-red-600" id="adminUser-password-error">
                              {errors['adminUser.password']}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* First Name & Last Name */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label 
                            htmlFor="adminUser.profile.firstName" 
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            First Name
                          </label>
                          <input
                            type="text"
                            id="adminUser.profile.firstName"
                            name="adminUser.profile.firstName"
                            value={formData.adminUser?.profile?.firstName || ''}
                            onChange={(e) => handleInputChange('adminUser.profile.firstName', e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="First name"
                          />
                        </div>
                        <div>
                          <label 
                            htmlFor="adminUser.profile.lastName" 
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Last Name
                          </label>
                          <input
                            type="text"
                            id="adminUser.profile.lastName"
                            name="adminUser.profile.lastName"
                            value={formData.adminUser?.profile?.lastName || ''}
                            onChange={(e) => handleInputChange('adminUser.profile.lastName', e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Last name"
                          />
                        </div>
                      </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <svg 
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24"
                      >
                        <circle 
                          className="opacity-25" 
                          cx="12" 
                          cy="12" 
                          r="10" 
                          stroke="currentColor" 
                          strokeWidth="4"
                        />
                        <path 
                          className="opacity-75" 
                          fill="currentColor" 
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Creating...
                    </div>
                  ) : (
                    'Create Cafe'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCafeModal;