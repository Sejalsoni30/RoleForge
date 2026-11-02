import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { User, ShieldAlert, Trash2, Save, Mail, Briefcase, Award } from 'lucide-react';

export const AccountSettingsPage: React.FC = () => {
  const { user, updateProfile, deleteAccount } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [currentRole, setCurrentRole] = useState(user?.currentRole || '');
  const [targetRole, setTargetRole] = useState(user?.targetRole || '');
  const [yearsOfExperience, setYearsOfExperience] = useState(user?.yearsOfExperience || 3);
  const [emailAlerts, setEmailAlerts] = useState(user?.preferences?.emailAlerts ?? true);

  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        name,
        currentRole,
        targetRole,
        yearsOfExperience: Number(yearsOfExperience),
        preferences: {
          emailAlerts,
          atsOptimizationLevel: user?.preferences?.atsOptimizationLevel || 'balanced',
          defaultTemplate: user?.preferences?.defaultTemplate || 'ats-classic',
        },
      });
      success('Account profile settings updated!');
    } catch (err: any) {
      error(err.message || 'Failed to update settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePermanent = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      success('Your account and all associated personal data have been completely deleted.');
      navigate('/login');
    } catch (err: any) {
      error(err.message || 'Failed to delete account.');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
          Account Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your credentials, career compilation targets, and data retention rights.
        </p>
      </div>

      {/* Profile Form */}
      <Card className="p-6">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-600" />
          <span>Profile & Target Information</span>
        </h3>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Account Email"
              value={user?.email || ''}
              disabled
              helperText="Managed by account security"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Current Role"
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value)}
            />
            <Input
              label="Target Role"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
            />
            <Input
              label="Years of Experience"
              type="number"
              value={yearsOfExperience}
              onChange={(e) => setYearsOfExperience(Number(e.target.value))}
            />
          </div>

          <div className="pt-2 flex items-center gap-2">
            <input
              type="checkbox"
              id="emailAlerts"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="emailAlerts" className="text-xs font-semibold text-slate-700">
              Receive status notifications on application deadlines and reminders
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button type="submit" isLoading={isSaving} leftIcon={<Save className="w-4 h-4" />}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* Danger Zone: Account & Data Deletion */}
      <Card className="p-6 border-rose-200 bg-rose-50/20">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-rose-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <span>Danger Zone: Permanent Account & Data Deletion</span>
            </h3>
            <p className="text-xs text-rose-800 leading-relaxed max-w-xl">
              Permanently delete your account along with all uploaded resumes, parsed job descriptions, compiled match evaluations, interview recordings, and tracked applications. This action is irreversible.
            </p>
          </div>

          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
            leftIcon={<Trash2 className="w-4 h-4" />}
          >
            Delete Account
          </Button>
        </div>
      </Card>

      {/* Permanent Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeletePermanent}
        title="Permanently Delete Account?"
        message="This will immediately and permanently erase all your resumes, compiled match analyses, notes, and activity history. This cannot be undone."
        confirmText="Yes, Permanently Delete Everything"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

