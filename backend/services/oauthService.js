/**
 * OAuth Service
 *
 * Handles authentication with various OAuth providers
 */

const axios = require('axios');
const qs = require('querystring');
const db = require('../config/db');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Generate a secure JWT token
const generateToken = (userId, expiresIn = '1d') => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'your_jwt_secret_for_dev',
    { expiresIn }
  );
};

// Generate a refresh token
const generateRefreshToken = () => {
  return crypto.randomBytes(40).toString('hex');
};

/**
 * Store user session information
 */
const saveSession = async (userId, token, refreshToken, ipAddress, userAgent) => {
  try {
    // Expire time - 1 day from now for access token
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const result = await db.query(
      `INSERT INTO blinds.sessions (user_id, token, refresh_token, ip_address, user_agent, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [userId, token, refreshToken, ipAddress, userAgent, expiresAt]
    );

    return result.rows[0].id;
  } catch (error) {
    console.error('[OAuth Service] Error saving session:', error);
    throw error;
  }
};

/**
 * Validate and process Google OAuth token
 */
const verifyGoogleToken = async (tokenId) => {
  try {
    const response = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${tokenId}`);

    if (response.status !== 200) {
      throw new Error('Failed to verify Google token');
    }

    const { sub, email, name, picture } = response.data;

    return {
      provider: 'google',
      providerId: sub,
      email,
      name,
      profileImage: picture
    };
  } catch (error) {
    console.error('[OAuth Service] Google token verification error:', error);
    throw new Error('Invalid Google token');
  }
};

/**
 * Validate and process Facebook OAuth token
 */
const verifyFacebookToken = async (accessToken) => {
  try {
    // First verify the token is valid
    const verifyResponse = await axios.get(
      `https://graph.facebook.com/debug_token?input_token=${accessToken}&access_token=${process.env.FACEBOOK_APP_ID}|${process.env.FACEBOOK_APP_SECRET}`
    );

    if (!verifyResponse.data.data.is_valid) {
      throw new Error('Invalid Facebook token');
    }

    // Get user information
    const userResponse = await axios.get(
      `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`
    );

    const { id, name, email, picture } = userResponse.data;

    return {
      provider: 'facebook',
      providerId: id,
      email,
      name,
      profileImage: picture?.data?.url
    };
  } catch (error) {
    console.error('[OAuth Service] Facebook token verification error:', error);
    throw new Error('Invalid Facebook token');
  }
};

/**
 * Validate and process Apple OAuth token
 */
const verifyAppleToken = async (identityToken, authorizationCode) => {
  try {
    // Apple's identityToken is a JWT - we can decode it to get the user info
    const decoded = jwt.decode(identityToken);

    if (!decoded || !decoded.sub) {
      throw new Error('Invalid Apple token');
    }

    // Get refresh token
    const clientSecret = generateAppleClientSecret();

    const tokenResponse = await axios.post(
      'https://appleid.apple.com/auth/token',
      qs.stringify({
        client_id: process.env.APPLE_CLIENT_ID,
        client_secret: clientSecret,
        code: authorizationCode,
        grant_type: 'authorization_code'
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const { email, name } = decoded;

    return {
      provider: 'apple',
      providerId: decoded.sub,
      email,
      name: name || email.split('@')[0], // Use email prefix if name not provided
      profileImage: null,
      refreshToken: tokenResponse.data.refresh_token
    };
  } catch (error) {
    console.error('[OAuth Service] Apple token verification error:', error);
    throw new Error('Invalid Apple token');
  }
};

/**
 * Generate client secret for Apple Sign In
 */
const generateAppleClientSecret = () => {
  const header = {
    alg: 'ES256',
    kid: process.env.APPLE_KEY_ID
  };

  const payload = {
    iss: process.env.APPLE_TEAM_ID,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (86400 * 180), // 6 months
    aud: 'https://appleid.apple.com',
    sub: process.env.APPLE_CLIENT_ID
  };

  // In a production environment, you'd use your private key to sign this JWT
  // For simplicity in this example, we're returning a mock token
  // In real implementation, use something like:
  // return jwt.sign(payload, privateKey, { header: header, algorithm: 'ES256' });
  return jwt.sign(payload, process.env.JWT_SECRET || 'your_jwt_secret', { header });
};

/**
 * Process OAuth user data - find or create user
 */
const processOAuthUser = async (userData, accessToken, refreshToken = null) => {
  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    // Check if user exists with this OAuth provider
    let result = await client.query(
      `SELECT * FROM blinds.user_oauth_accounts
       WHERE provider = $1 AND provider_user_id = $2`,
      [userData.provider, userData.providerId]
    );

    let userId;
    let isNewUser = false;

    if (result.rows.length > 0) {
      // User exists with this OAuth account - update the tokens
      userId = result.rows[0].user_id;

      await client.query(
        `UPDATE blinds.user_oauth_accounts
         SET access_token = $1, refresh_token = $2, expires_at = $3, updated_at = CURRENT_TIMESTAMP
         WHERE provider = $4 AND provider_user_id = $5`,
        [
          accessToken,
          refreshToken,
          refreshToken ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null, // 30 days
          userData.provider,
          userData.providerId
        ]
      );
    } else {
      // Check if user exists with this email
      result = await client.query(
        'SELECT * FROM blinds.users WHERE email = $1',
        [userData.email]
      );

      if (result.rows.length > 0) {
        // User exists with this email - link the OAuth account
        userId = result.rows[0].user_id;

        await client.query(
          `INSERT INTO blinds.user_oauth_accounts
           (user_id, provider, provider_user_id, access_token, refresh_token, expires_at)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            userId,
            userData.provider,
            userData.providerId,
            accessToken,
            refreshToken,
            refreshToken ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null
          ]
        );
      } else {
        // Create new user
        isNewUser = true;

        const userResult = await client.query(
          `INSERT INTO blinds.users
           (name, email, role, profile_image, social_provider, social_id, email_verified)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING *`,
          [
            userData.name,
            userData.email,
            'customer', // Default role for OAuth users
            userData.profileImage,
            userData.provider,
            userData.providerId,
            true // Email is verified when using OAuth
          ]
        );

        userId = userResult.rows[0].user_id;

        // Create OAuth account record
        await client.query(
          `INSERT INTO blinds.user_oauth_accounts
           (user_id, provider, provider_user_id, access_token, refresh_token, expires_at)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            userId,
            userData.provider,
            userData.providerId,
            accessToken,
            refreshToken,
            refreshToken ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null
          ]
        );
      }
    }

    // Get the user
    const userResult = await client.query(
      'SELECT * FROM blinds.users WHERE user_id = $1',
      [userId]
    );

    // Update last login
    await client.query(
      'UPDATE blinds.users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1',
      [userId]
    );

    await client.query('COMMIT');

    return {
      user: userResult.rows[0],
      isNewUser
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[OAuth Service] Error processing OAuth user:', error);
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  generateToken,
  generateRefreshToken,
  saveSession,
  verifyGoogleToken,
  verifyFacebookToken,
  verifyAppleToken,
  processOAuthUser
};
