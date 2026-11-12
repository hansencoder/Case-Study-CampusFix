export type ReportCategory =
  | 'Plumbing'
  | 'Electrical'
  | 'HVAC / Climate'
  | 'Doors & Locks'
  | 'Safety Hazard'
  | 'Other Defect';

export interface CategoryOption {
  value: ReportCategory;
  label: string;
  icon: string;
}

export const CATEGORY_OPTIONS: readonly CategoryOption[] = [
  { value: 'Plumbing', label: 'Plumbing', icon: 'water-outline' },
  { value: 'Electrical', label: 'Electrical', icon: 'flash-outline' },
  { value: 'HVAC / Climate', label: 'HVAC / Climate', icon: 'snow-outline' },
  {
    value: 'Doors & Locks',
    label: 'Doors & Locks',
    icon: 'lock-closed-outline',
  },
  { value: 'Safety Hazard', label: 'Safety Hazard', icon: 'warning-outline' },
  {
    value: 'Other Defect',
    label: 'Other Defect',
    icon: 'ellipsis-horizontal-outline',
  },
];

export const REPORT_CATEGORIES: readonly ReportCategory[] =
  CATEGORY_OPTIONS.map((item) => item.value);

export type ReportUrgency = 'Low' | 'Standard' | 'Urgent';

export interface UrgencyOption {
  value: ReportUrgency;
  label: string;
  sublabel: string;
  targetText: string;
}

export const URGENCY_OPTIONS: readonly UrgencyOption[] = [
  {
    value: 'Low',
    label: 'Low',
    sublabel: 'Within 3d',
    targetText:
      'Low resolution target: Scheduled for routine maintenance within 3 business days.',
  },
  {
    value: 'Standard',
    label: 'Standard',
    sublabel: 'Within 24h',
    targetText:
      'Standard resolution target: Technician dispatched before 5:00 PM today.',
  },
  {
    value: 'Urgent',
    label: 'Urgent',
    sublabel: 'Immediate',
    targetText:
      'Urgent resolution target: Priority alert sent to on-duty campus facilities team.',
  },
];

export type ReportStatus = 'Saved locally' | 'Draft';

export interface Report {
  id: string;
  ticketCode: string;
  category: ReportCategory;
  location: string;
  title: string;
  description: string;
  urgency: ReportUrgency;
  photoPath: string | null;
  createdAt: string;
  status: ReportStatus;
}

export interface CreateReportInput {
  category: ReportCategory;
  location: string;
  title: string;
  description: string;
  urgency?: ReportUrgency;
  status?: ReportStatus;
  photoPath?: string | null;
}

export type PhotoCaptureResult =
  | {
      status: 'captured';
      photoPath: string;
      previewUrl: string;
    }
  | {
      status: 'cancelled';
    }
  | {
      status: 'denied';
      message: string;
    }
  | {
      status: 'error';
      message: string;
    };

export function getCategoryIcon(category: string): string {
  return (
    CATEGORY_OPTIONS.find((item) => item.value === category)?.icon ??
    'ellipsis-horizontal-outline'
  );
}
