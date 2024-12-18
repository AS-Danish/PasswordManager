export const checkPasswordStrength = (password) => {
    // Initialize score
    let score = 0;
  
    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
  
    // Character variety checks
    if (/[A-Z]/.test(password)) score += 1; // Has uppercase
    if (/[a-z]/.test(password)) score += 1; // Has lowercase
    if (/[0-9]/.test(password)) score += 1; // Has number
    if (/[^A-Za-z0-9]/.test(password)) score += 1; // Has special character
  
    // Return strength category
    if (score >= 5) return 'strong';
    if (score >= 3) return 'medium';
    return 'weak';
  }; 