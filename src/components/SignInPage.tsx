import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService, SocialProvider } from '../services/authService';
import { checkForExpiredSession } from '../utils/authUtils';

// Define environment variables
const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID || "dummy_id";
const APPLE_CLIENT_ID = import.meta.env.VITE_APPLE_CLIENT_ID || "dummy.client.id";
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "dummy.client.id";

// Create a simple social login button component
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
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // From location state (for redirects)
  const from = (location.state as any)?.from?.pathname || '/';

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
  const [resetError, setResetError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (authService.isAuthenticated()) {
      const redirectTo = authService.getDashboardUrl() || '/';
      navigate(redirectTo);
    }
  }, [navigate]);

  // Add useEffect to check for expired session
  useEffect(() => {
    // Check if we were redirected here due to expired session
    checkForExpiredSession();
  }, []);

  // Google login with OAuth
  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);

      // Load the Google Sign-In API script dynamically
      const loadGoogleScript = () => {
        return new Promise<void>((resolve, reject) => {
          if (document.getElementById('google-auth-script')) {
            resolve();
            return;
          }

          const script = document.createElement('script');
          script.id = 'google-auth-script';
          script.src = 'https://accounts.google.com/gsi/client';
          script.async = true;
          script.defer = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load Google Sign-In script'));
          document.body.appendChild(script);
        });
      };

      await loadGoogleScript();

      // Initialize Google Sign-In
      // @ts-ignore - Google API not typed
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response: any) => {
          try {
            if (response.credential) {
              // Call our backend with the ID token
              const user = await authService.socialLogin('google', response.credential);
              navigate(from);
            }
          } catch (error) {
            console.error('Google login processing failed:', error);
            setLoginError('Google login failed. Please try again.');
            setIsLoading(false);
          }
        },
        auto_select: false,
      });

      // @ts-ignore - Google API not typed
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Use Google One Tap fallback
          // @ts-ignore - Google API not typed
          window.google.accounts.id.renderButton(
            document.getElementById('google-signin-button') || document.createElement('div'),
            { theme: 'outline', size: 'large' }
          );
          setIsLoading(false);
        }
      });
    } catch (error) {
      console.error('Google login initialization failed:', error);
      setLoginError('Google login failed. Please try again.');
      setIsLoading(false);
    }
  };

  // Facebook login with OAuth
  const handleFacebookLogin = async () => {
    try {
      setIsLoading(true);

      // Load the Facebook SDK dynamically
      const loadFacebookScript = () => {
        return new Promise<void>((resolve, reject) => {
          if (document.getElementById('facebook-auth-script')) {
            resolve();
            return;
          }

          window.fbAsyncInit = function() {
            // @ts-ignore - FB SDK not typed
            FB.init({
              appId: FACEBOOK_APP_ID,
              cookie: true,
              xfbml: true,
              version: 'v18.0'
            });
            resolve();
          };

          const script = document.createElement('script');
          script.id = 'facebook-auth-script';
          script.src = 'https://connect.facebook.net/en_US/sdk.js';
          script.async = true;
          script.defer = true;
          script.onerror = () => reject(new Error('Failed to load Facebook SDK script'));
          document.body.appendChild(script);
        });
      };

      await loadFacebookScript();

      // Login with Facebook and request permissions
      // @ts-ignore - FB SDK not typed
      FB.login(async function(response) {
        if (response.authResponse) {
          try {
            // Call our backend with the access token
            const user = await authService.socialLogin('facebook', response.authResponse.accessToken);
            navigate(from);
          } catch (error) {
            console.error('Facebook login processing failed:', error);
            setLoginError('Facebook login failed. Please try again.');
          }
        } else {
          setLoginError('Facebook login was cancelled');
        }
        setIsLoading(false);
      }, { scope: 'email,public_profile' });

    } catch (error) {
      console.error('Facebook login initialization failed:', error);
      setLoginError('Facebook login failed. Please try again.');
      setIsLoading(false);
    }
  };

  // Apple login with OAuth
  const handleAppleLogin = async () => {
    try {
      setIsLoading(true);

      // Load Apple Sign In JS
      const loadAppleScript = () => {
        return new Promise<void>((resolve, reject) => {
          if (document.getElementById('apple-signin-script')) {
            resolve();
            return;
          }

          const script = document.createElement('script');
          script.id = 'apple-signin-script';
          script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
          script.async = true;
          script.defer = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load Apple Sign In script'));
          document.body.appendChild(script);
        });
      };

      await loadAppleScript();

      // Setup Apple Sign In
      // @ts-ignore - Apple SDK not typed
      AppleID.auth.init({
        clientId: APPLE_CLIENT_ID,
        scope: 'name email',
        redirectURI: `${window.location.origin}/auth/callback/apple`,
        usePopup: true
      });

      // Perform sign in
      // @ts-ignore - Apple SDK not typed
      const response = await AppleID.auth.signIn();

      if (response.authorization && response.authorization.id_token) {
        try {
          // Call our backend with the ID token and authorization code
          const user = await authService.socialLogin(
            'apple',
            response.authorization.id_token,
            response.authorization.code
          );
          navigate(from);
        } catch (error) {
          console.error('Apple login processing failed:', error);
          setLoginError('Apple login failed. Please try again.');
        }
      } else {
        setLoginError('Apple login failed. Missing authentication data.');
      }

    } catch (error) {
      console.error('Apple login failed:', error);
      setLoginError('Apple login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);

    // Simple validation
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('Please enter both email and password.');
      setIsLoading(false);
      return;
    }

    try {
      await authService.login(loginEmail, loginPassword);

      // Redirect to the page user came from or dashboard
      navigate(from);
    } catch (error) {
      console.error('Login error:', error);
      setLoginError((error as Error).message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
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
      await authService.register({
        name: `${firstName} ${lastName}`,
        email: registerEmail,
        password: registerPassword,
        // All users are registered as customers by default
      });

      // Redirect to the page user came from or dashboard
      navigate(from);
    } catch (error) {
      setRegisterError((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setIsLoading(true);

    if (!resetEmail.trim()) {
      setResetError('Please enter your email address.');
      setIsLoading(false);
      return;
    }

    try {
      const success = await authService.requestPasswordReset(resetEmail);

      if (success) {
        setResetSent(true);
        setResetError('');
      } else {
        setResetError('Failed to send password reset email. Please try again.');
      }
    } catch (error) {
      setResetError((error as Error).message || 'Failed to send password reset email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-6">
          {showResetPassword ? 'Reset Password' : (activeTab === 'login' ? 'Sign In' : 'Create Account')}
        </h1>

        {/* Reset Password Form */}
        {showResetPassword ? (
          <>
            {resetSent ? (
              <div className="text-center mb-6">
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                  <p>We've sent a password reset link to your email address.</p>
                </div>
                <button
                  onClick={() => {
                    setShowResetPassword(false);
                    setResetSent(false);
                    setResetEmail('');
                  }}
                  className="text-primary-red hover:underline"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword}>
                <div className="mb-4">
                  <label htmlFor="reset-email" className="block text-gray-700 text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="reset-email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-red focus:border-primary-red"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                {resetError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <p>{resetError}</p>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(false)}
                    className="text-gray-600 hover:underline"
                  >
                    Back to Sign In
                  </button>
                  <button
                    type="submit"
                    className="bg-primary-red text-white px-4 py-2 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </div>
              </form>
            )}
          </>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex mb-6 border-b">
              <button
                className={`flex-1 py-2 ${
                  activeTab === 'login'
                    ? 'border-b-2 border-primary-red text-primary-red'
                    : 'text-gray-500'
                }`}
                onClick={() => setActiveTab('login')}
              >
                Sign In
              </button>
              <button
                className={`flex-1 py-2 ${
                  activeTab === 'register'
                    ? 'border-b-2 border-primary-red text-primary-red'
                    : 'text-gray-500'
                }`}
                onClick={() => setActiveTab('register')}
              >
                Register
              </button>
            </div>

            {/* Login Form */}
            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit}>
                <div className="mb-4">
                  <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-red focus:border-primary-red"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="password"
                    className="block text-gray-700 text-sm font-medium mb-2"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-red focus:border-primary-red"
                    placeholder="********"
                    required
                  />
                </div>

                <div className="flex justify-between mb-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="remember-me"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 text-primary-red focus:ring-primary-red border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-gray-700 text-sm">
                      Remember me
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(true)}
                    className="text-primary-red text-sm hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                {loginError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <p>{loginError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-primary-red text-white py-2 px-4 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </button>

                <div className="my-6 relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <SocialLoginButton provider="Google" onClick={handleGoogleLogin} />
                  <SocialLoginButton provider="Apple" onClick={handleAppleLogin} />
                  <SocialLoginButton provider="Facebook" onClick={handleFacebookLogin} />
                </div>
              </form>
            )}

            {/* Registration Form */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegisterSubmit}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="first-name" className="block text-gray-700 text-sm font-medium mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="first-name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-red focus:border-primary-red"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="last-name" className="block text-gray-700 text-sm font-medium mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="last-name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-red focus:border-primary-red"
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="register-email" className="block text-gray-700 text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="register-email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-red focus:border-primary-red"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="register-password" className="block text-gray-700 text-sm font-medium mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    id="register-password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-red focus:border-primary-red"
                    required
                    minLength={8}
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="confirm-password" className="block text-gray-700 text-sm font-medium mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirm-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-red focus:border-primary-red"
                    required
                  />
                </div>

                <div className="mb-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={agreeToTerms}
                      onChange={(e) => setAgreeToTerms(e.target.checked)}
                      className="h-4 w-4 text-primary-red focus:ring-primary-red border-gray-300 rounded"
                      required
                    />
                    <label htmlFor="terms" className="ml-2 block text-gray-700 text-sm">
                      I agree to the{' '}
                      <a href="/terms" className="text-primary-red hover:underline">
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a href="/privacy" className="text-primary-red hover:underline">
                        Privacy Policy
                      </a>
                    </label>
                  </div>
                </div>

                {registerError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <p>{registerError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-primary-red text-white py-2 px-4 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>

                <div className="my-6 relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or register with</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <SocialLoginButton provider="Google" onClick={handleGoogleLogin} />
                  <SocialLoginButton provider="Apple" onClick={handleAppleLogin} />
                  <SocialLoginButton provider="Facebook" onClick={handleFacebookLogin} />
                </div>
              </form>
            )}
          </>
        )}
      </div>
      {/* For Google One Tap fallback */}
      <div id="google-signin-button" className="hidden"></div>
    </div>
  );
};

export default SignInPage;
