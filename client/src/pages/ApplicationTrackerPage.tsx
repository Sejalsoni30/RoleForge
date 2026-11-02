import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useToast } from '../contexts/ToastContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { ApplicationStatusBadge } from '../components/ui/StatusBadge';
import { IApplication, ApplicationStatus } from '@roleforge/shared';
import {
  CalendarCheck,
  Plus,
  Trash2,
  Calendar,
  Building2,
  DollarSign,
  MapPin,
  CheckCircle,
  Clock,
} from 'lucide-react';

export const ApplicationTrackerPage: React.FC = () => {
  const { success, error } = useToast();

  const [applications, setApplications] = useState<IApplication[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // New Application Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState<ApplicationStatus>('applied');
  const [salary, setSalary] = useState('');
  const [location, setLocation] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Delete
  const [deleteAppId, setDeleteAppId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchApplications = async () => {
    try {
      const res = await api.get<IApplication[]>('/applications');
      setApplications(res.data || []);
    } catch (err: any) {
      error(err.message || 'Failed to load applications.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !role) {
      error('Company and Role are required.');
      return;
    }

    setIsSaving(true);
    try {
      await api.post('/applications', {
        company,
        role,
        status,
        salary,
        location,
        jobUrl,
        notes,
        appliedDate: new Date().toISOString().split('T')[0],
      });
      success('Application added to tracker!');
      setIsAddModalOpen(false);
      setCompany('');
      setRole('');
      setSalary('');
      setLocation('');
      setJobUrl('');
      setNotes('');
      await fetchApplications();
    } catch (err: any) {
      error(err.message || 'Failed to create application.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateStatus = async (appId: string, newStatus: ApplicationStatus) => {
    try {
      await api.put(`/applications/${appId}`, { status: newStatus });
      success(`Status updated to ${newStatus}!`);
      await fetchApplications();
    } catch (err: any) {
      error(err.message || 'Failed to update status.');
    }
  };

  const handleDelete = async () => {
    if (!deleteAppId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/applications/${deleteAppId}`);
      success('Application removed.');
      setDeleteAppId(null);
      await fetchApplications();
    } catch (err: any) {
      error(err.message || 'Failed to delete application.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-28 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
        </div>
      </div>
    );
  }

  const filteredApps = applications.filter((app) => {
    const matchesFilter = filterStatus === 'all' || app.status === filterStatus;
    const matchesSearch =
      app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            Application Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track interview rounds, follow-up deadlines, and offers across your pipeline.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Track New Application
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-1 p-1 rounded-xl bg-slate-100 text-xs">
          {['all', 'saved', 'applied', 'interviewing', 'offered', 'rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                filterStatus === st ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'
              }`}
            >
              {st.charAt(0).toUpperCase() + st.slice(1)}
            </button>
          ))}
        </div>

        <div className="max-w-xs w-full">
          <Input
            placeholder="Search company or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Applications List */}
      {filteredApps.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No Applications Tracked"
          description="Keep your job search organized. Log target roles, interview schedules, compensation notes, and submission dates."
          actionText="Track Application"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredApps.map((app) => (
            <Card key={app.id} className="p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="text-base font-bold text-slate-900">{app.company}</h4>
                    <p className="text-xs font-semibold text-indigo-600">{app.role}</p>
                  </div>
                  <ApplicationStatusBadge status={app.status} />
                </div>

                <div className="space-y-1.5 text-xs text-slate-500 pt-2">
                  {app.appliedDate && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Applied on {app.appliedDate}</span>
                    </div>
                  )}
                  {app.salary && (
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                      <span>{app.salary}</span>
                    </div>
                  )}
                  {app.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{app.location}</span>
                    </div>
                  )}
                </div>

                {app.notes && (
                  <p className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 text-xs text-slate-600 line-clamp-2">
                    {app.notes}
                  </p>
                )}
              </div>

              {/* Status transition dropdown & delete */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <select
                  value={app.status}
                  onChange={(e) => handleUpdateStatus(app.id, e.target.value as ApplicationStatus)}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700"
                >
                  <option value="saved">Saved</option>
                  <option value="applied">Applied</option>
                  <option value="interviewing">Interviewing</option>
                  <option value="offered">Offered</option>
                  <option value="rejected">Rejected</option>
                  <option value="withdrawn">Withdrawn</option>
                </select>

                <button
                  onClick={() => setDeleteAppId(app.id)}
                  className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg transition-colors"
                  title="Remove application"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Track Job Application"
        description="Add a new submission to your job hunt pipeline."
        maxWidth="md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Company"
            placeholder="e.g. OpenAI, Stripe"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            required
          />
          <Input
            label="Role Title"
            placeholder="e.g. Staff Full Stack Engineer"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
              >
                <option value="saved">Saved</option>
                <option value="applied">Applied</option>
                <option value="interviewing">Interviewing</option>
                <option value="offered">Offered</option>
              </select>
            </div>
            <Input
              label="Salary / Comp Target"
              placeholder="e.g. $185k - $210k"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
            />
          </div>
          <Input
            label="Location"
            placeholder="e.g. Remote / New York"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <Textarea
            label="Notes"
            placeholder="Interviewer names, referral contacts, or next steps..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
          <div className="flex justify-end gap-3 pt-3">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSaving}>
              Save Application
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={Boolean(deleteAppId)}
        onClose={() => setDeleteAppId(null)}
        onConfirm={handleDelete}
        title="Remove Application"
        message="Are you sure you want to remove this tracked job application?"
        confirmText="Remove"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

