import React, { useState, useEffect } from 'react';
import { authService, SocialProvider } from '../../services/authService';

// Social provider icons
const SocialIcon = ({ provider }: { provider: SocialProvider }) => {
  switch (provider) {
    case 'google':
      return (
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" />
        </svg>
      );
    case 'apple':
      return (
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16.125 1.503c.25 0 .5.058.688.172-1.784 1.038-2.584 2.583-2.438 4.5.146 1.553.937 2.78 2.375 3.688-.5.915-1.084 1.734-1.75 2.375-1.084 1.038-2.168 1.115-3.25.174-1.084-.915-2.083-.915-3 0-1.084 1.038-2.167.864-3.25-.174-1.5-1.553-2.167-3.355-2-5.406.167-2.968 1.74-5.22 4.5-5.625.917-.146 1.833.09 2.813.625.98.552 1.833.9 2.625.938.167 0 .333-.012.5-.063.812-.25 1.562-.562 2.187-.937z" />
          <path d="M12.063 8.906c-.333 0-.637.09-.938.25-2.083 1.084-4.25 1.24-6.5.468.333 2.22 1.333 3.915 3 5.032.5.344 1.042.305 1.625-.063.583-.365 1.167-.365 1.75 0 .583.367 1.125.406 1.625.063.833-.583 1.5-1.365 2-2.344-1.083-.917-1.75-2.135-2-3.625-.5.042-.94.105-1.312.22-.27.02-.542.03-.813.03z" />
        </svg>
      );
    case 'facebook':
      return (
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
    default:
      return null;
  }
};

const SocialConnections = () => {
  const [linkedProviders, setLinkedProviders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [userHasPassword, setUserHasPassword] = useState(true);

  // Load current user's linked providers
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user && user.linkedProviders) {
      setLinkedProviders(user.linkedProviders);
    }

    // Check if user has password (if not, they can't unlink their only social provider)
    // This would require an API endpoint. For now, we'll assume they have a password
    // In a real implementation, you'd fetch this from the backend
  }, []);

  // Google login
  const handleGoogleLink = async () => {
    try {
      setIsLoading(true);
      setMessage(null);

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
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy_id',
        callback: async (response: any) => {
          try {
            if (response.credential) {
              // Link Google account
              const newLinkedProviders = await authService.linkSocialAccount('google', response.credential);
              setLinkedProviders(newLinkedProviders);
              setMessage({ type: 'success', text: 'Google account connected successfully!' });
            }
          } catch (error: any) {
            console.error('Google linking failed:', error);
            setMessage({ type: 'error', text: error.message || 'Failed to link Google account.' });
          } finally {
            setIsLoading(false);
          }
        },
      });

      // Prompt for Google Sign-In
      // @ts-ignore - Google API not typed
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Use Google One Tap fallback
          // @ts-ignore - Google API not typed
          window.google.accounts.id.renderButton(
            document.getElementById('google-link-button') || document.createElement('div'),
            { theme: 'outline', size: 'large', text: 'link' }
          );
          setIsLoading(false);
        }
      });
    } catch (error: any) {
      console.error('Google login failed:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to link Google account.' });
      setIsLoading(false);
    }
  };

  // Facebook login
  const handleFacebookLink = async () => {
    try {
      setIsLoading(true);
      setMessage(null);

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
              appId: import.meta.env.VITE_FACEBOOK_APP_ID || 'dummy_id',
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
            // Link Facebook account
            const newLinkedProviders = await authService.linkSocialAccount('facebook', response.authResponse.accessToken);
            setLinkedProviders(newLinkedProviders);
            setMessage({ type: 'success', text: 'Facebook account connected successfully!' });
          } catch (error: any) {
            console.error('Facebook linking failed:', error);
            setMessage({ type: 'error', text: error.message || 'Failed to link Facebook account.' });
          }
        } else {
          setMessage({ type: 'error', text: 'Facebook login was cancelled' });
        }
        setIsLoading(false);
      }, { scope: 'email,public_profile' });

    } catch (error: any) {
      console.error('Facebook login failed:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to link Facebook account.' });
      setIsLoading(false);
    }
  };

  // Apple login
  const handleAppleLink = async () => {
    try {
      setIsLoading(true);
      setMessage(null);

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
        clientId: import.meta.env.VITE_APPLE_CLIENT_ID || 'dummy.client.id',
        scope: 'name email',
        redirectURI: `${window.location.origin}/auth/callback/apple`,
        usePopup: true
      });

      // Perform sign in
      // @ts-ignore - Apple SDK not typed
      const response = await AppleID.auth.signIn();

      if (response.authorization && response.authorization.id_token) {
        try {
          // Link Apple account
          const newLinkedProviders = await authService.linkSocialAccount(
            'apple',
            response.authorization.id_token,
            response.authorization.code
          );
          setLinkedProviders(newLinkedProviders);
          setMessage({ type: 'success', text: 'Apple account connected successfully!' });
        } catch (error: any) {
          console.error('Apple linking failed:', error);
          setMessage({ type: 'error', text: error.message || 'Failed to link Apple account.' });
        }
      } else {
        setMessage({ type: 'error', text: 'Apple login failed. Missing authentication data.' });
      }

    } catch (error: any) {
      console.error('Apple login failed:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to link Apple account.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Unlink social account
  const handleUnlink = async (provider: SocialProvider) => {
    try {
      setIsLoading(true);
      setMessage(null);

      // Check if this is the only authentication method
      const canUnlink = userHasPassword || linkedProviders.length > 1;

      if (!canUnlink) {
        setMessage({
          type: 'error',
          text: 'You cannot remove your only login method. Please set a password first.'
        });
        setIsLoading(false);
        return;
      }

      // Unlink the account
      const newLinkedProviders = await authService.unlinkSocialAccount(provider);
      setLinkedProviders(newLinkedProviders);
      setMessage({ type: 'success', text: `${provider} account disconnected successfully!` });
    } catch (error: any) {
      console.error(`Unlinking ${provider} failed:`, error);
      setMessage({ type: 'error', text: error.message || `Failed to disconnect ${provider} account.` });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Connected Accounts
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Manage your social login connections
        </p>
      </div>

      <div className="px-4 py-5 sm:p-6">
        {message && (
          <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}

        <div className="space-y-6">
          {/* Google */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <SocialIcon provider="google" />
              <span className="ml-2 text-gray-700">Google</span>
            </div>
            <div>
              {linkedProviders.includes('google') ? (
                <button
                  onClick={() => handleUnlink('google')}
                  disabled={isLoading}
                  className="px-3 py-1 text-sm text-red-600 hover:text-red-800 rounded border border-red-500 hover:border-red-700 disabled:opacity-50"
                >
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={handleGoogleLink}
                  disabled={isLoading}
                  className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 rounded border border-blue-500 hover:border-blue-700 disabled:opacity-50"
                >
                  Connect
                </button>
              )}
            </div>
          </div>

          {/* Facebook */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <SocialIcon provider="facebook" />
              <span className="ml-2 text-gray-700">Facebook</span>
            </div>
            <div>
              {linkedProviders.includes('facebook') ? (
                <button
                  onClick={() => handleUnlink('facebook')}
                  disabled={isLoading}
                  className="px-3 py-1 text-sm text-red-600 hover:text-red-800 rounded border border-red-500 hover:border-red-700 disabled:opacity-50"
                >
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={handleFacebookLink}
                  disabled={isLoading}
                  className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 rounded border border-blue-500 hover:border-blue-700 disabled:opacity-50"
                >
                  Connect
                </button>
              )}
            </div>
          </div>

          {/* Apple */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <SocialIcon provider="apple" />
              <span className="ml-2 text-gray-700">Apple</span>
            </div>
            <div>
              {linkedProviders.includes('apple') ? (
                <button
                  onClick={() => handleUnlink('apple')}
                  disabled={isLoading}
                  className="px-3 py-1 text-sm text-red-600 hover:text-red-800 rounded border border-red-500 hover:border-red-700 disabled:opacity-50"
                >
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={handleAppleLink}
                  disabled={isLoading}
                  className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 rounded border border-blue-500 hover:border-blue-700 disabled:opacity-50"
                >
                  Connect
                </button>
              )}
            </div>
          </div>

          {/* Hidden element for Google sign-in button fallback */}
          <div id="google-link-button" className="hidden"></div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-6">
          <p className="text-sm text-gray-500">
            Connecting social accounts allows you to sign in using these platforms.
            If you already have a password set up, you can use either method to sign in.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SocialConnections;
