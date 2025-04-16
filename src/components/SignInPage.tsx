import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

// Define environment variables
const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID || "dummy_id";
const APPLE_CLIENT_ID = import.meta.env.VITE_APPLE_CLIENT_ID || "dummy.client.id";

// Create a simple social login button component to prevent errors
const SocialLoginButton = ({ provider, onClick }: { provider: string, onClick: () => void }) => {
  let icon;

  switch (provider.toLowerCase()) {
    case 'google':
      icon = (
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" />
        </svg>
      );
      break;
    case 'apple':
      icon = (
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16.125 1.503c.25 0 .5.058.688.172-1.784 1.038-2.584 2.583-2.438 4.5.146 1.553.937 2.78 2.375 3.688-.5.915-1.084 1.734-1.75 2.375-1.084 1.038-2.168 1.115-3.25.174-1.084-.915-2.083-.915-3 0-1.084 1.038-2.167.864-3.25-.174-1.5-1.553-2.167-3.355-2-5.406.167-2.968 1.74-5.22 4.5-5.625.917-.146 1.833.09 2.813.625.98.552 1.833.9 2.625.938.167 0 .333-.012.5-.063.812-.25 1.562-.562 2.187-.937z" />
          <path d="M12.063 8.906c-.333 0-.637.09-.938.25-2.083 1.084-4.25 1.24-6.5.468.333 2.22 1.333 3.915 3 5.032.5.344 1.042.305 1.625-.063.583-.365 1.167-.365 1.75 0 .583.367 1.125.406 1.625.063.833-.583 1.5-1.365 2-2.344-1.083-.917-1.75-2.135-2-3.625-.5.042-.94.105-1.312.22-.27.02-.542.03-.813.03z" />
        </svg>
      );
      break;
    case 'facebook':
      icon = (
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
      break;
    default:
      icon = null;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
    >
      {icon}
      {provider}
    </button>
  );
};

const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Registration Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [registerError, setRegisterError] = useState('');

  // Reset Password
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[SignInPage] Login submit started');
    setLoginError('');
    setIsLoading(true);

    // Simple validation
    if (!loginEmail.trim() || !loginPassword.trim()) {
      console.log('[SignInPage] Validation failed - missing email or password');
      setLoginError('Please enter both email and password.');
      setIsLoading(false);
      return;
    }

    try {
      console.log('[SignInPage] Sending login request to /api/auth/login');
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      console.log('[SignInPage] Login response received, status:', response.status);

      let data;
      try {
        data = await response.json();
        console.log('[SignInPage] Response data:', JSON.stringify(data, null, 2));
      } catch (parseError) {
        console.error('[SignInPage] Failed to parse response as JSON:', parseError);
        const text = await response.text();
        console.log('[SignInPage] Raw response text:', text);
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        console.log('[SignInPage] Login failed, response not OK');
        throw new Error(data.error || 'Login failed');
      }

      // Use auth service for login
      console.log('[SignInPage] Login successful, saving auth data');
      authService.login(data.token, data.user);

      // Redirect to home page
      console.log('[SignInPage] Redirecting to home page');
      navigate('/');
    } catch (error) {
      console.error('[SignInPage] Login error:', error);
      setLoginError((error as Error).message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
      console.log('[SignInPage] Login process completed');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');
    setIsLoading(true);

    // Simple validation
    if (!firstName.trim() || !lastName.trim() || !registerEmail.trim() || !registerPassword.trim()) {
      setRegisterError('Please fill in all required fields.');
      setIsLoading(false);
      return;
    }

    if (registerPassword !== confirmPassword) {
      setRegisterError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    if (!agreeToTerms) {
      setRegisterError('You must agree to the Terms of Service.');
      setIsLoading(false);
      return;
    }

    try {
      // All users are registered as customers by default
      const userData = {
        name: `${firstName} ${lastName}`,
        email: registerEmail,
        password: registerPassword,
        role: 'customer' // Always register as customer - role changes must be done by admin
      };

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Use auth service for login
      authService.login(data.token, data.user);

      // Redirect to home page
      navigate('/');
    } catch (error) {
      setRegisterError((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (!resetEmail.trim()) {
      return;
    }

    // Demo reset - in a real app this would call an API
    setResetSent(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setShowResetPassword(false);
      setResetEmail('');
      setResetSent(false);
    }, 3000);
  };

  // Handle social login
  const handleSocialLogin = (provider: string) => {
    setLoginError(`${provider} login is not available in this demo environment`);
  };

  const renderLoginForm = () => {
    if (showResetPassword) {
      return (
        <div>
          <h2 className="text-xl font-semibold mb-4">Reset Password</h2>

          {resetSent ? (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
              Password reset link has been sent to your email address.
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="resetEmail"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-primary-red"
                  placeholder="Enter your account email"
                  required
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full bg-primary-red hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition-colors"
                >
                  Send Reset Link
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowResetPassword(false)}
                  className="text-sm text-primary-red hover:underline"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      );
    }

    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Sign In to Your Account</h2>

        {loginError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {loginError}
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label htmlFor="loginEmail" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="loginEmail"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-primary-red"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="loginPassword" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowResetPassword(true)}
                className="text-xs text-primary-red hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <input
              type="password"
              id="loginPassword"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-primary-red"
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-primary-red focus:ring-primary-red border-gray-300 rounded"
            />
            <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
              Remember me
            </label>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-red hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or sign in with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            {/* Google Login */}
            <div className="flex justify-center">
              <SocialLoginButton
                provider="Google"
                onClick={() => handleSocialLogin('Google')}
              />
            </div>

            {/* Facebook Login */}
            <div className="flex justify-center">
              <SocialLoginButton
                provider="Facebook"
                onClick={() => handleSocialLogin('Facebook')}
              />
            </div>

            {/* Apple Login */}
            <div className="flex justify-center">
              <SocialLoginButton
                provider="Apple"
                onClick={() => handleSocialLogin('Apple')}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderRegisterForm = () => {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Create Your Account</h2>

        {registerError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {registerError}
          </div>
        )}

        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name*
              </label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-primary-red"
                required
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name*
              </label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-primary-red"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="registerEmail" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address*
            </label>
            <input
              type="email"
              id="registerEmail"
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-primary-red"
              required
            />
          </div>

          <div>
            <label htmlFor="registerPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Password*
            </label>
            <input
              type="password"
              id="registerPassword"
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-primary-red"
              required
              minLength={8}
            />
            <p className="text-xs text-gray-500 mt-1">
              Password must be at least 8 characters long.
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password*
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-primary-red"
              required
            />
          </div>

          <div className="bg-gray-50 p-3 rounded-md border border-gray-200 my-3">
            <p className="text-sm text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-1 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              All accounts are created with customer access by default. For vendor or other account types, please contact an administrator after registration.
            </p>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="agreeToTerms"
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              className="h-4 w-4 text-primary-red focus:ring-primary-red border-gray-300 rounded"
              required
            />
            <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-700">
              I agree to the <Link to="#" className="text-primary-red hover:underline">Terms of Service</Link> and <Link to="#" className="text-primary-red hover:underline">Privacy Policy</Link>
            </label>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-red hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>

          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or sign up with</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              {/* Google Login */}
              <div className="flex justify-center">
                <SocialLoginButton
                  provider="Google"
                  onClick={() => setRegisterError('Google login is not available in this demo environment')}
                />
              </div>

              {/* Facebook Login */}
              <div className="flex justify-center">
                <SocialLoginButton
                  provider="Facebook"
                  onClick={() => setRegisterError('Facebook login is not available in this demo environment')}
                />
              </div>

              {/* Apple Login */}
              <div className="flex justify-center">
                <SocialLoginButton
                  provider="Apple"
                  onClick={() => setRegisterError('Apple login is not available in this demo environment')}
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="flex justify-center items-center py-8 px-4">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            type="button"
            className={`w-1/2 py-3 font-medium text-sm focus:outline-none ${activeTab === 'login' ? 'text-primary-red border-b-2 border-primary-red' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('login')}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`w-1/2 py-3 font-medium text-sm focus:outline-none ${activeTab === 'register' ? 'text-primary-red border-b-2 border-primary-red' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('register')}
          >
            Create Account
          </button>
        </div>

        {/* Form Content */}
        <div className="p-5">
          {activeTab === 'login' ? renderLoginForm() : renderRegisterForm()}
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
