import { authService } from '../services/authService';

/**
 * Utility functions for authentication
 */

/**
 * Force clear tokens and redirect to login when session has expired
 * This is used to recover from the "Received HTML response instead of JSON" error
 */
export const handleSessionExpired = () => {
  // Clear any stored tokens
  localStorage.removeItem('smartblinds_auth_token');
  localStorage.removeItem('smartblinds_user');
  localStorage.removeItem('smartblinds_refresh_token');
  localStorage.removeItem('smartblinds_token_expiry');
  localStorage.removeItem('smartblinds_auto_refresh');

  // Call auth service logout to dispatch events
  authService.logout();

  // Redirect to login page with expired parameter
  window.location.href = '/signin?expired=true';
};

/**
 * Check if the current page load includes the expired session parameter
 * and show appropriate notification
 */
export const checkForExpiredSession = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const sessionExpired = urlParams.get('expired');

  if (sessionExpired === 'true') {
    // Show a notification about the expired session
    alert('Your session has expired. Please sign in again to continue.');

    // Remove the parameter from URL without reloading the page
    const url = new URL(window.location.href);
    url.searchParams.delete('expired');
    window.history.replaceState({}, document.title, url.toString());
  }
};

/**
 * Check if a JWT token is expired or about to expire
 * @param token The JWT token to check
 * @param bufferSeconds Number of seconds before actual expiration to consider token expired (default: 60)
 * @returns boolean
 */
export const isTokenExpired = (token: string | null, bufferSeconds = 60): boolean => {
  if (!token) return true;

  try {
    // Parse the JWT payload (middle part between dots)
    const payload = JSON.parse(atob(token.split('.')[1]));

    // Check if it has an expiration claim
    if (!payload.exp) return false;

    // Calculate time remaining with buffer
    const now = Math.floor(Date.now() / 1000); // Current time in seconds
    return payload.exp <= (now + bufferSeconds);
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true; // Consider invalid tokens as expired
  }
};
