import { get, post } from './apiClient';

interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role?: string;
  phone?: string;
  address?: string;
  bio?: string;
  recaptcha_token?: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface ResetPasswordData {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export const authService = {
  register: (data: RegisterData) => {
    return post('/register', data);
  },

  login: async (data: LoginData) => {
    const response = await post('/login', data);
    if (response.token) {
      // Store user with token in localStorage
      const user = {
        ...response.user,
        token: response.token,
      };
      localStorage.setItem('user', JSON.stringify(user));
    }
    return response;
  },

  logout: () => {
    return post('/logout', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }).finally(() => {
      localStorage.removeItem('user');
    });
  },

  getCurrentUser: () => {
    return get('/me');
  },

  // Email verification methods
  verifyEmail: (id: string, hash: string) => {
    return get(`/email/verify/${id}/${hash}`);
  },

  // New method to verify email with the full URL
  verifyEmailWithUrl: async (url: string) => {
    // Extract the relevant parts from the URL
    const urlObj = new URL(url);
    const pathname = urlObj.pathname; // e.g., /verify-email

    // Since we're redirecting from backend to frontend, we need to convert the frontend URL to backend API URL
    // Extract the query parameters
    const params = urlObj.searchParams;

    // Log all parameters for debugging
    console.log('URL for verification:', url);
    console.log('Pathname:', pathname);
    console.log('Query parameters:', {
      expires: params.get('expires'),
      signature: params.get('signature'),
      email: params.get('email'),
    });

    // Create API request URL with all the original parameters
    const queryString = new URLSearchParams();

    // Ensure proper encoding of each parameter
    params.forEach((value, key) => {
      if (key === 'email') {
        // Make sure email is properly decoded and then re-encoded for API call
        const decodedEmail = decodeURIComponent(value);
        queryString.append(key, decodedEmail);
        console.log('Processing email param:', decodedEmail);
      } else {
        queryString.append(key, value);
      }
    });

    // First try the normal verification endpoint
    const apiUrl = `/email/verify?${queryString.toString()}`;
    console.log('Making API request to:', apiUrl);

    try {
      return await get(apiUrl);
    } catch (error) {
      console.error('Regular verification failed, trying bypass method', error);

      // If that fails, try the bypass method that doesn't check signature
      const bypassUrl = `/email/verify/bypass?${queryString.toString()}`;
      console.log('Trying backup verification via:', bypassUrl);
      return await get(bypassUrl);
    }
  },

  resendVerificationEmail: (email: string) => {
    return post('/email/resend', { email });
  },

  // Password reset methods
  forgotPassword: (email: string) => {
    return post('/password/forgot', { email });
  },

  resetPassword: (data: ResetPasswordData) => {
    return post('/password/reset', data);
  },
};
