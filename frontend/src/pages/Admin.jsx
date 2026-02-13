import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { LogIn, Lock, Mail, User, UserPlus } from 'lucide-react';
import Dashboard from '../components/admin/Dashboard';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';

const Admin = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [university, setUniversity] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (error) {
        setCurrentUser(null);
      }
    }
  }, []);

  const isAdminUser = useMemo(
    () => Boolean(currentUser && ['admin', 'teacher'].includes(currentUser.role)),
    [currentUser]
  );

  const resetVerificationStatus = () => {
    setVerificationStatus(null);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setLoading(true);
    resetVerificationStatus();

    try {
      const response = await authAPI.login({ email, password });
      const payload = response?.data?.data || {};
      const user = payload.user;
      const token = payload.token;

      if (!token || !user) {
        throw new Error('Invalid login response');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      window.dispatchEvent(new Event('auth-change'));
      setCurrentUser(user);

      if (['admin', 'teacher'].includes(user.role)) {
        toast.success(`Welcome back, ${user.role === 'admin' ? 'Admin' : user.name}!`);
      } else {
        toast.success(`Welcome back, ${user.name || 'Student'}!`);
        navigate('/profile');
      }
    } catch (error) {
      console.error('Admin login failed:', error);
      const response = error.response?.data;

      if (response?.requiresVerification) {
        setVerificationStatus({
          tone: 'warning',
          message: response.message || 'Please verify your email before logging in.',
          showResend: true
        });
        toast.error(response.message || 'Email verification required.');
        return;
      }

      toast.error(response?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      toast.error('Please fill in your name, email, and password.');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);
    resetVerificationStatus();

    try {
      const response = await authAPI.register({
        name,
        email,
        password,
        university,
        department,
      });
      const payload = response?.data || {};
      const emailSent = payload.emailSent !== false;
      const message = payload.message || 'Registration successful. Please verify your email.';

      setVerificationStatus({
        tone: emailSent ? 'success' : 'warning',
        message,
        showResend: true,
      });
      setIsSignup(false);
      toast.success('Account created. Check your email to verify your account.');
    } catch (error) {
      console.error('Signup failed:', error);
      const response = error.response?.data;
      setVerificationStatus({
        tone: 'error',
        message: response?.message || 'Unable to create account. Please try again.',
        showResend: false,
      });
      toast.error(response?.message || 'Unable to create account.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      toast.error('Enter your email to resend verification.');
      return;
    }

    setResendLoading(true);

    try {
      const response = await authAPI.resendVerification({ email });
      const message = response?.data?.message || 'Verification email resent.';
      setVerificationStatus({
        tone: 'success',
        message,
        showResend: true,
      });
      toast.success(message);
    } catch (error) {
      console.error('Resend verification failed:', error);
      const response = error.response?.data;
      setVerificationStatus({
        tone: 'error',
        message: response?.message || 'Unable to resend verification email.',
        showResend: true,
      });
      toast.error(response?.message || 'Unable to resend verification email.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('auth-change'));
    setCurrentUser(null);
    toast.success('Logged out successfully');
  };

  if (isAdminUser) {
    return <Dashboard onLogout={handleLogout} />;
  }

  if (currentUser && !isAdminUser) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-primary-50 to-accent-50">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center space-y-4">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
              <User className="h-8 w-8 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">You're signed in</h1>
            <p className="text-gray-600">
              Continue to your profile or head back to training.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/profile"
                className="inline-flex items-center justify-center bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Go to Profile
              </Link>
              <Link
                to="/training"
                className="inline-flex items-center justify-center border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                View Training
              </Link>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusToneStyles = {
    success: 'border-green-200 bg-green-50 text-green-700',
    warning: 'border-amber-200 bg-amber-50 text-amber-700',
    error: 'border-red-200 bg-red-50 text-red-700',
    info: 'border-blue-200 bg-blue-50 text-blue-700',
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-primary-50 to-accent-50">
      <div className="max-w-md w-full">
        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              {isSignup ? (
                <UserPlus className="h-8 w-8 text-primary-600" />
              ) : (
                <Lock className="h-8 w-8 text-primary-600" />
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Spatial AI Portal</h1>
            <p className="text-gray-600">
              {isSignup ? 'Create your account to start learning.' : 'Sign in to access your dashboard'}
            </p>
          </div>

          {verificationStatus && (
            <div
              className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
                statusToneStyles[verificationStatus.tone || 'info']
              }`}
            >
              <p className="font-medium">{verificationStatus.message}</p>
              {verificationStatus.showResend && (
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendLoading}
                  className="mt-3 inline-flex items-center text-xs font-semibold text-primary-700 hover:text-primary-800 disabled:opacity-60"
                >
                  {resendLoading ? 'Sending email...' : 'Resend verification email'}
                </button>
              )}
            </div>
          )}

          {/* Login / Signup Form */}
          <form onSubmit={isSignup ? handleSignup : handleLogin} className="space-y-6">
            {isSignup && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            )}
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@yourdomain.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {isSignup && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
            )}

            {isSignup && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="university" className="block text-sm font-medium text-gray-700 mb-2">
                    University (optional)
                  </label>
                  <input
                    type="text"
                    id="university"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    placeholder="Your university"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                    Department (optional)
                  </label>
                  <input
                    type="text"
                    id="department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Your department"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  {isSignup ? 'Creating account...' : 'Signing in...'}
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  {isSignup ? 'Create Account' : 'Sign In'}
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2 font-medium">
              {isSignup ? 'Email verification required' : 'Portal Access'}
            </p>
            <p className="text-sm text-gray-500">
              {isSignup
                ? 'After signup, check your inbox and verify your email before logging in.'
                : 'Use your account credentials to continue.'}
            </p>
          </div>

          <div className="mt-6 text-center text-sm text-gray-600">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => {
                setIsSignup((prev) => !prev);
                resetVerificationStatus();
              }}
              className="text-primary-600 hover:underline font-medium"
            >
              {isSignup ? 'Sign in' : 'Create one'}
            </button>
          </div>
        </div>

        {/* Info Text */}
        <p className="text-center text-gray-600 mt-6 text-sm">
          Need help? Contact <a href="mailto:support@spatialai.edu" className="text-primary-600 hover:underline">support@spatialai.edu</a>
        </p>
      </div>
    </div>
  );
};

export default Admin;