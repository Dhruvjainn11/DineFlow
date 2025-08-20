import { toast } from 'react-toastify';

export const handleApiError = (error, operation = 'Operation') => {
  console.error(`${operation} failed:`, error);
  
  let errorMessage = 'An unexpected error occurred';
  
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        errorMessage = data.message || 'Invalid request data';
        break;
      case 401:
        errorMessage = 'Authentication required. Please login again.';
        // Optionally redirect to login
        break;
      case 403:
        errorMessage = 'Access denied. You don\'t have permission for this action.';
        break;
      case 404:
        errorMessage = data.message || 'Resource not found';
        break;
      case 409:
        errorMessage = data.message || 'Conflict with existing data';
        break;
      case 422:
        errorMessage = data.message || 'Validation failed';
        break;
      case 429:
        errorMessage = 'Too many requests. Please try again later.';
        break;
      case 500:
        errorMessage = 'Server error. Please try again later.';
        break;
      default:
        errorMessage = data.message || `Server error (${status})`;
    }
  } else if (error.request) {
    // Network error
    errorMessage = 'Network error. Please check your connection.';
  } else {
    // Other error
    errorMessage = error.message || 'An unexpected error occurred';
  }
  
  toast.error(`❌ ${operation}: ${errorMessage}`);
  return errorMessage;
};

export const handleApiSuccess = (message, operation = 'Operation') => {
  toast.success(`✅ ${operation}: ${message}`);
};

export const handleApiWarning = (message, operation = 'Operation') => {
  toast.warning(`⚠️ ${operation}: ${message}`);
};

export const handleApiInfo = (message, operation = 'Operation') => {
  toast.info(`ℹ️ ${operation}: ${message}`);
};