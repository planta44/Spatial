import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Building2, GraduationCap, Mail, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';

const emptyProfile = {
  name: '',
  email: '',
  role: '',
  university: '',
  department: '',
  specialization: 'other',
  avatar: '',
  bio: '',
};

const specializationOptions = [
  { value: 'vocal', label: 'Vocal' },
  { value: 'instrumental', label: 'Instrumental' },
  { value: 'theory', label: 'Theory' },
  { value: 'composition', label: 'Composition' },
  { value: 'education', label: 'Education' },
  { value: 'other', label: 'Other' },
];

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch (error) {
    return null;
  }
};

const normalizeProfile = (data = {}) => ({
  ...emptyProfile,
  ...data,
  specialization: data?.specialization || 'other',
});

const Profile = () => {
  const [profile, setProfile] = useState(() => normalizeProfile(getStoredUser() || {}));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(localStorage.getItem('token')));

  useEffect(() => {
    const syncAuth = () => {
      setIsAuthenticated(Boolean(localStorage.getItem('token')));
    };

    window.addEventListener('auth-change', syncAuth);
    window.addEventListener('storage', syncAuth);

    return () => {
      window.removeEventListener('auth-change', syncAuth);
      window.removeEventListener('storage', syncAuth);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const storedUser = getStoredUser();

    if (storedUser && isMounted) {
      setProfile(normalizeProfile(storedUser));
    }

    if (!isAuthenticated) {
      setLoading(false);
      return () => {
        isMounted = false;
      };
    }

    const loadProfile = async () => {
      try {
        setLoading(true);
        setLoadError('');
        const response = await authAPI.getMe();
        const payload = response?.data || {};
        const user = payload.user || payload.data?.user;

        if (!user) {
          throw new Error('Profile payload missing');
        }

        if (isMounted) {
          setProfile(normalizeProfile(user));
          localStorage.setItem('user', JSON.stringify(user));
          window.dispatchEvent(new Event('auth-change'));
        }
      } catch (error) {
        if (isMounted) {
          setLoadError('Unable to load profile details. Please try again.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  const initials = useMemo(() => {
    const name = profile.name || '';
    if (!name) return 'U';
    const letters = name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2);
    return letters.toUpperCase();
  }, [profile.name]);

  const handleFieldChange = (field) => (event) => {
    const value = event.target.value;
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please sign in to update your profile.');
      return;
    }

    try {
      setSaving(true);
      const updatePayload = {
        name: profile.name,
        university: profile.university,
        department: profile.department,
        specialization: profile.specialization,
        bio: profile.bio,
        avatar: profile.avatar,
      };

      const response = await authAPI.updateProfile(updatePayload);
      const payload = response?.data || {};
      const user = payload.user || payload.data?.user;

      if (user) {
        setProfile(normalizeProfile(user));
        localStorage.setItem('user', JSON.stringify(user));
        window.dispatchEvent(new Event('auth-change'));
      }

      toast.success('Profile updated successfully.');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('auth-change'));
    setProfile(normalizeProfile({}));
    setIsAuthenticated(false);
    toast.success('You have been logged out.');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center text-gray-600">Loading profile...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <p className="text-gray-600">Sign in to view and edit your profile details.</p>
            <Link
              to="/admin"
              className="inline-flex items-center justify-center bg-primary-600 text-white px-5 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        <div>
          <p className="text-sm font-semibold text-primary-600">Profile</p>
          <h1 className="text-3xl font-bold text-gray-900">Your account</h1>
          <p className="text-gray-600">Manage your Spatial AI profile details.</p>
        </div>

        {loadError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {loadError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-5">
            <div className="flex items-center gap-4">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name || 'Profile avatar'}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xl font-semibold">
                  {initials}
                </div>
              )}
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{profile.name || 'Your Name'}</h2>
                <p className="text-sm text-gray-500 capitalize">{profile.role || 'student'}</p>
              </div>
            </div>

            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span>{profile.email || 'No email on file'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-gray-400" />
                <span>{profile.university || 'Add your university'}</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-gray-400" />
                <span>{profile.department || 'Add your department'}</span>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-gray-400" />
                <span className="capitalize">{profile.specialization || 'other'}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Avatar URL</label>
              <input
                type="text"
                value={profile.avatar || ''}
                onChange={handleFieldChange('avatar')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="https://..."
              />
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
            >
              Log out
            </button>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
                  <input
                    type="text"
                    value={profile.name || ''}
                    onChange={handleFieldChange('name')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={profile.email || ''}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-500"
                    disabled
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">University</label>
                  <input
                    type="text"
                    value={profile.university || ''}
                    onChange={handleFieldChange('university')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="University"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={profile.department || ''}
                    onChange={handleFieldChange('department')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Department"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                  <select
                    value={profile.specialization || 'other'}
                    onChange={handleFieldChange('specialization')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
                  >
                    {specializationOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  rows={4}
                  value={profile.bio || ''}
                  onChange={handleFieldChange('bio')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Share a short bio"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-gray-500">Profile updates are saved to your account.</p>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 bg-primary-600 text-white px-5 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-60"
                >
                  {saving ? 'Saving...' : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Profile
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
