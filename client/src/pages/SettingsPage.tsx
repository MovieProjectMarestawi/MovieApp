import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Trash2, Save, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { toast } from 'sonner';
import { userAPI } from '../services/api';

export function SettingsPage() {
  const { user, isLoggedIn, logout, refreshUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        email: user.email || '',
      }));
    }
  }, [user]);

  // Wait for auth to finish loading before checking login status
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isLoggedIn || !user) {
    return <Navigate to="/login" />;
  }

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): string => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    return '';
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setErrors({
      email: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });

    // Validate email
    if (!formData.email.trim()) {
      setErrors((prev) => ({ ...prev, email: 'Email is required' }));
      return;
    }

    if (!validateEmail(formData.email)) {
      setErrors((prev) => ({ ...prev, email: 'Please enter a valid email address' }));
      return;
    }

    if (formData.email === user.email) {
      toast.info('No changes to save');
      return;
    }

    setLoading(true);
    try {
      const updatedUser = await userAPI.updateProfile(formData.email);
      await refreshUser();
      toast.success('Profile updated successfully!');
      setFormData((prev) => ({
        ...prev,
        email: updatedUser.email,
      }));
    } catch (error: any) {
      console.error('Profile update error:', error);
      const errorMessage = error.message || 'Failed to update profile';
      if (errorMessage.includes('already in use')) {
        setErrors((prev) => ({ ...prev, email: 'This email is already in use' }));
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setErrors({
      email: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });

    // Validate current password
    if (!formData.currentPassword) {
      setErrors((prev) => ({ ...prev, currentPassword: 'Current password is required' }));
      return;
    }

    // Validate new password
    if (!formData.newPassword) {
      setErrors((prev) => ({ ...prev, newPassword: 'New password is required' }));
      return;
    }

    const passwordError = validatePassword(formData.newPassword);
    if (passwordError) {
      setErrors((prev) => ({ ...prev, newPassword: passwordError }));
      return;
    }

    // Validate confirm password
    if (formData.newPassword !== formData.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      return;
    }

    setPasswordLoading(true);
    try {
      await userAPI.changePassword(formData.currentPassword, formData.newPassword);
      // Clear form and errors first
      setFormData((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
      setErrors({
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      // Show success message
      toast.success('Password changed successfully!', {
        duration: 4000,
      });
    } catch (error: any) {
      console.error('Password change error:', error);
      const errorMessage = error.message || 'Failed to change password';
      
      // Handle specific error cases
      if (errorMessage.includes('incorrect') || errorMessage.includes('Current password')) {
        setErrors((prev) => ({ ...prev, currentPassword: 'Current password is incorrect' }));
      } else if (errorMessage.includes('different') || errorMessage.includes('must be different')) {
        setErrors((prev) => ({ ...prev, newPassword: 'New password must be different from current password' }));
      } else if (errorMessage.includes('required')) {
        // Handle required field errors
        if (errorMessage.includes('currentPassword')) {
          setErrors((prev) => ({ ...prev, currentPassword: 'Current password is required' }));
        } else if (errorMessage.includes('newPassword')) {
          setErrors((prev) => ({ ...prev, newPassword: 'New password is required' }));
        }
      } else {
        // Show general error message
        toast.error(errorMessage);
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await userAPI.deleteAccount();
      await logout();
      navigate('/');
      toast.success('Account deleted successfully');
    } catch (error: any) {
      console.error('Delete account error:', error);
      toast.error(error.message || 'Failed to delete account');
    } finally {
      setDeleteLoading(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-white text-4xl mb-2">Account Settings</h1>
          <p className="text-zinc-400">Manage your account preferences and security</p>
        </div>

        <div className="space-y-6">
          {/* Profile Information */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Profile Information</CardTitle>
              <CardDescription className="text-zinc-400">
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-zinc-300">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        setErrors((prev) => ({ ...prev, email: '' }));
                      }}
                      className={`pl-10 bg-zinc-800 border-zinc-700 text-white ${
                        errors.email ? 'border-red-500' : ''
                      }`}
                      required
                    />
                  </div>
                  {errors.email && (
                    <div className="flex items-center gap-2 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.email}</span>
                    </div>
                  )}
                </div>

                <Button type="submit" className="bg-red-600 hover:bg-red-700" disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Change Password</CardTitle>
              <CardDescription className="text-zinc-400">
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-zinc-300">
                    Current Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <Input
                      id="currentPassword"
                      type="password"
                      value={formData.currentPassword}
                      onChange={(e) => {
                        setFormData({ ...formData, currentPassword: e.target.value });
                        setErrors((prev) => ({ ...prev, currentPassword: '' }));
                      }}
                      className={`pl-10 bg-zinc-800 border-zinc-700 text-white ${
                        errors.currentPassword ? 'border-red-500' : ''
                      }`}
                      required
                    />
                  </div>
                  {errors.currentPassword && (
                    <div className="flex items-center gap-2 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.currentPassword}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-zinc-300">
                    New Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <Input
                      id="newPassword"
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) => {
                        setFormData({ ...formData, newPassword: e.target.value });
                        setErrors((prev) => ({ ...prev, newPassword: '' }));
                      }}
                      className={`pl-10 bg-zinc-800 border-zinc-700 text-white ${
                        errors.newPassword ? 'border-red-500' : ''
                      }`}
                      required
                    />
                  </div>
                  {errors.newPassword && (
                    <div className="flex items-center gap-2 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.newPassword}</span>
                    </div>
                  )}
                  <p className="text-zinc-500 text-xs">
                    Password must be at least 8 characters, contain one uppercase letter and one number
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-zinc-300">
                    Confirm New Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => {
                        setFormData({ ...formData, confirmPassword: e.target.value });
                        setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                      }}
                      className={`pl-10 bg-zinc-800 border-zinc-700 text-white ${
                        errors.confirmPassword ? 'border-red-500' : ''
                      }`}
                      required
                    />
                  </div>
                  {errors.confirmPassword && (
                    <div className="flex items-center gap-2 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.confirmPassword}</span>
                    </div>
                  )}
                </div>

                <Button type="submit" className="bg-red-600 hover:bg-red-700" disabled={passwordLoading}>
                  <Lock className="w-4 h-4 mr-2" />
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="bg-zinc-900 border-red-900">
            <CardHeader>
              <CardTitle className="text-red-400">Danger Zone</CardTitle>
              <CardDescription className="text-zinc-400">
                Irreversible actions that affect your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start justify-between p-4 bg-red-950/30 rounded-lg border border-red-900">
                <div className="flex-1">
                  <h3 className="text-white mb-1">Delete Account</h3>
                  <p className="text-zinc-400 text-sm">
                    Once you delete your account, there is no going back. All your data will be permanently removed.
                  </p>
                </div>
                <Button
                  onClick={() => setShowDeleteDialog(true)}
                  variant="outline"
                  className="ml-4 bg-transparent border-red-800 text-red-400 hover:bg-red-950 hover:text-red-300"
                  disabled={deleteLoading}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-400">
              Delete Account Permanently?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              This action cannot be undone. This will permanently delete your account and remove all your data from our servers, including:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Your profile and account information</li>
                <li>All your favorite movies</li>
                <li>Your group memberships</li>
                <li>All your reviews and ratings</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-zinc-700 text-white hover:bg-zinc-800">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteLoading}
            >
              {deleteLoading ? 'Deleting...' : 'Yes, Delete My Account'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
