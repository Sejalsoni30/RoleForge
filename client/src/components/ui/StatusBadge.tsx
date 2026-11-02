import React from 'react';
import { Badge } from './Badge';
import { EvidenceStatus, ApplicationStatus } from '@roleforge/shared';
import { CheckCircle2, Clock, AlertCircle, XCircle, HelpCircle } from 'lucide-react';

export const EvidenceStatusBadge: React.FC<{ status: EvidenceStatus }> = ({ status }) => {
  switch (status) {
    case 'matched':
      return (
        <Badge variant="emerald" className="gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Verified Match</span>
        </Badge>
      );
    case 'partially_matched':
      return (
        <Badge variant="amber" className="gap-1">
          <Clock className="w-3.5 h-3.5" />
          <span>Partially Demonstrated</span>
        </Badge>
      );
    case 'not_mentioned':
      return (
        <Badge variant="slate" className="gap-1">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Not Mentioned</span>
        </Badge>
      );
    case 'not_demonstrated':
      return (
        <Badge variant="amber" className="gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Not Demonstrated</span>
        </Badge>
      );
    case 'explicitly_unavailable':
      return (
        <Badge variant="rose" className="gap-1">
          <XCircle className="w-3.5 h-3.5" />
          <span>Explicitly Missing</span>
        </Badge>
      );
    default:
      return <Badge variant="slate">{status}</Badge>;
  }
};

export const ApplicationStatusBadge: React.FC<{ status: ApplicationStatus }> = ({ status }) => {
  switch (status) {
    case 'saved':
      return <Badge variant="slate">Saved</Badge>;
    case 'applied':
      return <Badge variant="sky">Applied</Badge>;
    case 'interviewing':
      return <Badge variant="indigo">Interviewing</Badge>;
    case 'offered':
      return <Badge variant="emerald">Offer Received</Badge>;
    case 'rejected':
      return <Badge variant="rose">Rejected</Badge>;
    case 'withdrawn':
      return <Badge variant="slate">Withdrawn</Badge>;
    default:
      return <Badge variant="slate">{status}</Badge>;
  }
};

