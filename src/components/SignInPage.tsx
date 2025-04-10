import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const SignInPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState('');

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

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    // Simple validation
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('Please enter both email and password.');
      return;
    }

    // Demo login - in a real app this would call an API
    if (loginEmail === 'sales@smartblindshub.com' && loginPassword === 'password') {
      // Simulate successful login
      alert('Login successful! Redirecting to dashboard...');
      // In a real app, would save auth token and redirect
    } else {
      setLoginError('Invalid email or password. Try using sales@smartblindshub.com / password');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');

    // Simple validation
    if (!firstName.trim() || !lastName.trim() || !registerEmail.trim() || !registerPassword.trim()) {
      setRegisterError('Please fill in all required fields.');
      return;
    }

    if (registerPassword !== confirmPassword) {
      setRegisterError('Passwords do not match.');
      return;
    }

    if (!agreeToTerms) {
      setRegisterError('You must agree to the Terms of Service.');
      return;
    }

    // Demo registration - in a real app this would call an API
    alert('Registration successful! You can now sign in with your new account.');
    setActiveTab('login');
    setLoginEmail(registerEmail);
    setLoginPassword('');
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
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-primary-red"
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
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-primary-red"
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
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-primary-red"
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
              className="w-full bg-primary-red hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              Sign In
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

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.545,10.239V9.754H9.818v7.499h2.949v-3.473c0-1.234,0.233-2.428,1.777-2.428c1.525,0,1.525,1.389,1.525,2.507v3.394h2.949v-4.008c0-2.491-0.51-4.408-3.347-4.408c-1.36,0-2.275,0.736-2.649,1.43h-0.034V10.239H12.545z" />
                <path d="M7.514,10.239H4.547V17.25h2.966V10.239z" />
                <path d="M6.031,7.104c-0.951,0-1.719,0.771-1.719,1.72c0,0.949,0.768,1.72,1.719,1.72c0.95,0,1.719-0.771,1.719-1.72C7.75,7.875,6.981,7.104,6.031,7.104z" />
              </svg>
              LinkedIn
            </button>
            <button
              type="button"
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.283,10.356h-8.327v3.451h4.792c-0.446,2.193-2.313,3.453-4.792,3.453c-2.923,0-5.279-2.356-5.279-5.28c0-2.923,2.356-5.279,5.279-5.279c1.259,0,2.397,0.447,3.29,1.178l2.6-2.599c-1.584-1.381-3.615-2.233-5.89-2.233c-4.954,0-8.934,3.979-8.934,8.934c0,4.955,3.979,8.934,8.934,8.934c4.467,0,8.529-3.249,8.529-8.934C20.485,11.453,20.404,10.884,20.283,10.356z" />
              </svg>
              Google
            </button>
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
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-primary-red"
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
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-primary-red"
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
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-primary-red"
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
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-primary-red"
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
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-primary-red"
              required
            />
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
              className="w-full bg-primary-red hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              Create Account
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
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
        <div className="p-6">
          {activeTab === 'login' ? renderLoginForm() : renderRegisterForm()}
        </div>
      </div>

      <div className="mt-8">
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="font-medium text-lg mb-2">Why Create an Account?</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center">
              <svg className="w-4 h-4 text-primary-red mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Save measurements and custom quotes
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 text-primary-red mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Track orders and check status at any time
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 text-primary-red mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              View order history and reorder easily
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 text-primary-red mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Exclusive access to promotions and discounts
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
