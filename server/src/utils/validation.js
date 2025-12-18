/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {object} - { valid: boolean, message: string }
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { valid: false, message: 'Email is required' };
  }

  // Basic email regex pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Invalid email format' };
  }

  // Check email length
  if (email.length > 255) {
    return { valid: false, message: 'Email is too long (max 255 characters)' };
  }

  return { valid: true, message: 'Email is valid' };
};

/**
 * Validate required fields in request body
 * @param {object} body - Request body
 * @param {string[]} requiredFields - Array of required field names
 * @returns {object} - { valid: boolean, message: string, missingFields: string[] }
 */
export const validateRequiredFields = (body, requiredFields) => {
  const missingFields = requiredFields.filter(field => {
    const value = body[field];
    
    // Check if field is missing or undefined
    if (value === undefined || value === null) {
      return true;
    }
    
    // For string fields, check if empty after trim
    if (typeof value === 'string') {
      return value.trim() === '';
    }
    
    // For number fields, check if NaN or 0 (but 0 is valid for some cases)
    if (typeof value === 'number') {
      return isNaN(value);
    }
    
    // For other types, just check if falsy (but note: 0 and false are valid)
    return false; // Let specific validation handle these cases
  });
  
  if (missingFields.length > 0) {
    return {
      valid: false,
      message: `Missing required fields: ${missingFields.join(', ')}`,
      missingFields,
    };
  }

  return { valid: true, message: 'All required fields are present', missingFields: [] };
};

