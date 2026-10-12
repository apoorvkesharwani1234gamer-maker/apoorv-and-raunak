export type UserRole = 'owner' | 'member';

export interface UserSession {
  token: string;
  role: UserRole;
  email: string;
  name: string;
  memberId?: string; // present if role === 'member'
  avatar?: string;
  phone?: string;
}

export interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  description: string;
  perks: string[];
  popular?: boolean;
}

export type MemberStatus = 'active' | 'expiring' | 'expired' | 'frozen' | 'inactive';

export interface Member {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  dob?: string;
  photo?: string;
  googleLinked: boolean;
  googleSub?: string;
  status: MemberStatus;
  planId: string;
  planName: string;
  startDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
  amountPaid: number;
  frozenAt?: string;
  freezeReason?: string;
  emergencyContact?: string;
  notes?: string;
  createdAt: string;
  streak: number;
  longestStreak: number;
  totalVisits: number;
  monthlyVisits: number;
  lastVisit?: string;
  workoutPlanId?: string;
  dietPlanId?: string;
}

export interface AttendanceRecord {
  id: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  memberPhoto?: string;
  timestamp: string; // ISO string
  date: string; // YYYY-MM-DD
  time: string; // e.g. 07:45 AM
  method: 'qr_scan' | 'manual_owner';
}

export interface RedListMember {
  member: Member;
  daysAbsent: number;
  lastSeenDate: string | null;
  riskLevel: 'high' | 'critical';
}

export interface PaymentRecord {
  id: string;
  invoiceNo: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  planId: string;
  planName: string;
  amount: number;
  status: 'verified' | 'pending' | 'failed';
  paymentMethod: 'upi' | 'card' | 'cash' | 'netbanking';
  transactionRef: string;
  date: string; // ISO
  expiryExtendedTo: string;
  verifiedBy?: string;
}

export interface ExerciseItem {
  name: string;
  sets: string;
  reps: string;
  rest: string;
  tips: string;
}

export interface WorkoutDay {
  dayName: string;
  focus: string;
  exercises: ExerciseItem[];
}

export interface WorkoutPlan {
  id: string;
  title: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  goal: string;
  description: string;
  days: WorkoutDay[];
}

export interface MealItem {
  meal: string;
  time: string;
  foods: string[];
  notes: string;
}

export interface DietPlan {
  id: string;
  title: string;
  goal: string;
  targetCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  guidelines: string[];
  meals: MealItem[];
}

export interface ProgressLog {
  id: string;
  memberId: string;
  date: string;
  weightKg: number;
  bodyFatPercent?: number;
  chestCm?: number;
  waistCm?: number;
  bicepsCm?: number;
  notes?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  tag: 'General' | 'Offer' | 'Urgent' | 'Event' | 'Schedule';
  author: string;
}

export interface GymSettings {
  gymName: string;
  tagline: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  address: string;
  upiId: string;
  openingHours: string;
  attendanceQrSecret: string;
  attendanceQrRotateMinutes: number;
  redListThresholdDays: number;
}
