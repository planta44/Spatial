import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Mail, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const verify = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Verification link is missing or invalid.');
        return;
      }

      setStatus('loading');
      setMessage('');

      try {
        const response = await authAPI.verifyEmail(token);
        const responseMessage = response?.data?.message || 'Email verified successfully.';

        if (!isMounted) return;

        setStatus('success');
        setMessage(responseMessage);
      } catch (error) {
        if (!isMounted) return;

        const response = error.response?.data;
        const expired = Boolean(response?.expired);
        setStatus('error');
        setMessage(
          expired
            ? 'Your verification link has expired. You can request a new email below.'
            : response?.message || 'Unable to verify this email. Please try again.'
        );
      }
    };

    verify();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleResend = async () => {
    if (!email) {
      toast.error('Enter your email to resend verification.');
      return;
    }

    setResendLoading(true);

    try {
      const response = await authAPI.resendVerification({ email });
      const responseMessage = response?.data?.message || 'Verification email resent.';
      setMessage(responseMessage);
      setStatus('success');
      toast.success(responseMessage);
    } catch (error) {
      const response = error.response?.data;
      setStatus('error');
      setMessage(response?.message || 'Unable to resend verification email.');
      toast.error(response?.message || 'Unable to resend verification email.');
    } finally {
      setResendLoading(false);
    }
  };

  const statusIcon = (() => {
    if (status === 'success') return <CheckCircle2 className="h-12 w-12 text-green-500" />;
    if (status === 'error') return <AlertCircle className="h-12 w-12 text-red-500" />;
    return <Mail className="h-12 w-12 text-primary-600" />;
  })();

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-primary-50 to-accent-50">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="flex flex-col items-center text-center space-y-3">
          {statusIcon}
          <h1 className="text-2xl font-bold text-gray-900">Verify your email</h1>
          <p className="text-gray-600">
            {status === 'loading'
              ? 'Checking your verification link...'
              : message || 'Please wait while we confirm your email.'}
          </p>
        </div>

        {status !== 'success' && (
          <div className="border border-gray-200 rounded-lg p-4 space-y-3">
            <p className="text-sm text-gray-600">
              Need a new verification email? Enter the address you signed up with.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
              />
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading}
                className="inline-flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-60"
              >
                <RefreshCw className="h-4 w-4" />
                {resendLoading ? 'Sending...' : 'Resend'}
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/admin"
            className="inline-flex items-center justify-center bg-primary-600 text-white px-5 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Go to Login
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center border border-gray-200 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
