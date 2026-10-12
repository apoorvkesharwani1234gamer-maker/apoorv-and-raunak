import fs from 'fs';
import path from 'path';
import {
  Member,
  MembershipPlan,
  AttendanceRecord,
  PaymentRecord,
  WorkoutPlan,
  DietPlan,
  ProgressLog,
  Announcement,
  GymSettings,
} from '../src/types/index.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'gym_data.json');

export interface DatabaseSchema {
  settings: GymSettings;
  plans: MembershipPlan[];
  members: Member[];
  attendance: AttendanceRecord[];
  payments: PaymentRecord[];
  workouts: WorkoutPlan[];
  diets: DietPlan[];
  progress: ProgressLog[];
  announcements: Announcement[];
}

// Initial realistic seed data
const DEFAULT_SETTINGS: GymSettings = {
  gymName: 'FitPulse Fitness & Strength Club',
  tagline: 'Train. Track. Transform.',
  ownerName: 'Aakash Kesharwani',
  ownerEmail: 'aakashkesharwani937@gmail.com',
  ownerPhone: '+1 (555) 987-6543',
  address: '742 Iron Forge Blvd, Suite 100, Metropolis',
  upiId: 'fitpulse.gym@okaxis',
  openingHours: 'Mon - Sat: 5:30 AM - 10:30 PM | Sun: 7:00 AM - 2:00 PM',
  attendanceQrSecret: 'FP-ATTEND-KEY-2026',
  attendanceQrRotateMinutes: 60,
  redListThresholdDays: 10,
};

const DEFAULT_PLANS: MembershipPlan[] = [
  {
    id: 'plan-monthly',
    name: '1 Month Standard',
    price: 49,
    durationDays: 30,
    description: 'Full gym floor access, cardio zone, locker room & showers.',
    perks: ['Full gym access', 'Free locker', 'Steam bath weekly', 'FitPulse App'],
  },
  {
    id: 'plan-quarterly',
    name: '3 Months Pro',
    price: 129,
    durationDays: 90,
    description: 'Save 15%. Includes 1 fitness assessment & customized workout plan.',
    perks: ['All Standard perks', '1-on-1 Fitness Assessment', 'Custom Workout Routine', 'Diet Guidance'],
    popular: true,
  },
  {
    id: 'plan-half-year',
    name: '6 Months Elite',
    price: 229,
    durationDays: 180,
    description: 'Save 25%. Free body composition scans & guest passes.',
    perks: ['All Pro perks', 'Monthly InBody Scans', '2 Free Guest Passes', 'Priority Locker'],
  },
  {
    id: 'plan-annual',
    name: '12 Months VIP Transformation',
    price: 399,
    durationDays: 365,
    description: 'Maximum savings (35% OFF). Includes personal trainer kickstart.',
    perks: ['All Elite perks', '3 Personal Trainer Sessions', 'Complimentary FitPulse Shaker', 'Unlimited Guest Passes on Weekends'],
  },
];

const DEFAULT_WORKOUTS: WorkoutPlan[] = [
  {
    id: 'workout-ppl',
    title: 'Push - Pull - Legs (PPL) Hypertrophy',
    level: 'Intermediate',
    goal: 'Muscle Building & Strength',
    description: 'The gold standard 6-day split designed to maximize hypertrophy and progressive overload.',
    days: [
      {
        dayName: 'Day 1: Push (Chest, Shoulders, Triceps)',
        focus: 'Chest Press & Overhead Strength',
        exercises: [
          { name: 'Barbell Flat Bench Press', sets: '4', reps: '6-8', rest: '2-3 min', tips: 'Retract scapula, drive with legs, control descent.' },
          { name: 'Incline Dumbbell Press', sets: '3', reps: '8-10', rest: '90 sec', tips: '30-degree incline, full stretch at bottom.' },
          { name: 'Standing Overhead Barbell Press', sets: '3', reps: '8-10', rest: '2 min', tips: 'Brace core, squeeze glutes, press straight up.' },
          { name: 'Cable Lateral Raises', sets: '4', reps: '12-15', rest: '60 sec', tips: 'Slight forward lean, raise in scapular plane.' },
          { name: 'Rope Tricep Pushdowns', sets: '3', reps: '12-15', rest: '60 sec', tips: 'Lock elbows to ribs, spread rope at the bottom.' },
        ],
      },
      {
        dayName: 'Day 2: Pull (Back, Rear Delts, Biceps)',
        focus: 'Lat Width & Thickness',
        exercises: [
          { name: 'Barbell Deadlifts', sets: '3', reps: '5', rest: '3 min', tips: 'Neutral spine, drive hips forward with conviction.' },
          { name: 'Neutral-Grip Lat Pulldowns', sets: '4', reps: '8-10', rest: '90 sec', tips: 'Lead with elbows, pull to upper chest.' },
          { name: 'Chest-Supported T-Bar Rows', sets: '3', reps: '10-12', rest: '90 sec', tips: 'Pause 1s at peak contraction.' },
          { name: 'Face Pulls with External Rotation', sets: '3', reps: '15', rest: '60 sec', tips: 'Pull rope toward eyes, thumbs back.' },
          { name: 'Incline Dumbbell Bicep Curls', sets: '3', reps: '10-12', rest: '60 sec', tips: 'Maximum biceps long-head stretch.' },
        ],
      },
      {
        dayName: 'Day 3: Legs (Quads, Hamstrings, Calves)',
        focus: 'Lower Body Power',
        exercises: [
          { name: 'Barbell Back Squats', sets: '4', reps: '6-8', rest: '2-3 min', tips: 'Depth below parallel, knees tracking toes.' },
          { name: 'Romanian Deadlifts (RDL)', sets: '3', reps: '8-10', rest: '2 min', tips: 'Hinge at hips, slight knee bend, feel hamstring stretch.' },
          { name: 'Leg Press (Quad Focus)', sets: '3', reps: '10-12', rest: '90 sec', tips: 'Feet low on platform, smooth tempo.' },
          { name: 'Lying Hamstring Leg Curls', sets: '3', reps: '12-15', rest: '60 sec', tips: 'Keep hips glued to pad.' },
          { name: 'Standing Calf Raises', sets: '4', reps: '15-20', rest: '45 sec', tips: '2-second pause at bottom stretch.' },
        ],
      },
    ],
  },
  {
    id: 'workout-fatloss',
    title: 'Functional Fat Loss & Conditioning',
    level: 'Beginner',
    goal: 'Fat Loss & Stamina',
    description: 'High-energy compound circuit combining strength resistance with heart-rate elevation.',
    days: [
      {
        dayName: 'Day 1: Full Body Functional HIIT',
        focus: 'Metabolic Conditioning',
        exercises: [
          { name: 'Kettlebell Goblet Squats', sets: '4', reps: '15', rest: '45 sec', tips: 'Keep chest proud, elbows inside knees.' },
          { name: 'Dumbbell Push Press', sets: '4', reps: '12', rest: '45 sec', tips: 'Dip knees and drive overhead dynamically.' },
          { name: 'Battle Ropes (Alternating Waves)', sets: '4', reps: '30 sec', rest: '45 sec', tips: 'Athletic stance, explosive core power.' },
          { name: 'Rowing Machine Sprints', sets: '5', reps: '250m', rest: '60 sec', tips: 'Leg drive 60%, body swing 20%, arm pull 20%.' },
        ],
      },
    ],
  },
];

const DEFAULT_DIETS: DietPlan[] = [
  {
    id: 'diet-muscle',
    title: 'Lean Muscle Hypertrophy Fuel (2,600 kcal)',
    goal: 'Muscle Growth with Minimal Fat',
    targetCalories: 2600,
    proteinGrams: 180,
    carbsGrams: 300,
    fatsGrams: 75,
    guidelines: [
      'Drink at least 3.5 - 4 Liters of water daily.',
      'Consume 30-40g protein every 3.5 - 4 hours to optimize Muscle Protein Synthesis (MPS).',
      'Take 5g Creatine Monohydrate daily post-workout with simple carbs.',
      'Prioritize 7.5 to 8.5 hours of restful sleep every night for recovery.',
    ],
    meals: [
      {
        meal: 'Breakfast (7:30 AM)',
        time: '07:30 AM',
        foods: ['4 Whole Eggs + 2 Egg Whites', '1 cup Rolled Oats with cinnamon & berries', '1 Banana', 'Glass of water'],
        notes: 'Provides complex carbs for steady energy and high biological value protein.',
      },
      {
        meal: 'Mid-Morning Snack (10:30 AM)',
        time: '10:30 AM',
        foods: ['1 Scoop Whey Protein Isolate', '1 Apple or 30g Almonds'],
        notes: 'Keeps amino acid pool saturated.',
      },
      {
        meal: 'Lunch (1:30 PM)',
        time: '01:30 PM',
        foods: ['200g Grilled Chicken Breast or Paneer', '1.5 cups Jasmine or Brown Rice', 'Large mixed green salad with olive oil'],
        notes: 'Balanced macros with micronutrient-rich vegetables.',
      },
      {
        meal: 'Pre-Workout Fuel (4:30 PM)',
        time: '04:30 PM',
        foods: ['2 Slices Whole Grain Toast with 1 tbsp Peanut Butter', '1 Black Coffee or Pre-Workout'],
        notes: 'Easy to digest carbohydrates 60 minutes prior to training.',
      },
      {
        meal: 'Dinner (8:30 PM)',
        time: '08:30 PM',
        foods: ['200g Salmon Fillet or Tofu Steak', '1 Baked Sweet Potato', 'Steamed Asparagus & Broccoli'],
        notes: 'Omega-3 fatty acids for anti-inflammatory muscle recovery.',
      },
    ],
  },
  {
    id: 'diet-fatloss',
    title: 'Lean Shred & Deficit (1,900 kcal)',
    goal: 'Accelerated Fat Loss & Lean Retention',
    targetCalories: 1900,
    proteinGrams: 165,
    carbsGrams: 160,
    fatsGrams: 55,
    guidelines: [
      'Maintain a 400-500 kcal daily deficit.',
      'Keep protein high (2g/kg) to protect lean muscle mass during deficit.',
      'Drink 500ml water before every meal.',
      'Minimize sugar-sweetened beverages and fried foods.',
    ],
    meals: [
      {
        meal: 'Breakfast (8:00 AM)',
        time: '08:00 AM',
        foods: ['3 Egg Omelet with spinach & mushrooms', '1 slice sourdough toast', 'Green tea'],
        notes: 'Satiating start with high micronutrients.',
      },
      {
        meal: 'Lunch (1:00 PM)',
        time: '01:00 PM',
        foods: ['180g Grilled White Fish or Extra-Firm Tofu', '1 cup Quinoa', 'Steamed zucchini and bell peppers'],
        notes: 'High volume, low caloric density meal.',
      },
      {
        meal: 'Evening Fuel (5:00 PM)',
        time: '05:00 PM',
        foods: ['1 cup Low-fat Greek Yogurt with chia seeds', 'Handful of blueberries'],
        notes: 'Slow-digesting casein protein.',
      },
      {
        meal: 'Dinner (8:00 PM)',
        time: '08:00 PM',
        foods: ['180g Lean Turkey or Lentil soup', 'Huge garden salad with lemon-tahini dressing'],
        notes: 'Light dinner to support deep sleep and hormonal balance.',
      },
    ],
  },
];

const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: '🔥 FitPulse 30-Day Summer Consistency Challenge Starts Monday!',
    content: 'Check in at least 20 days this month to earn exclusive FitPulse merchandise and 1 month free membership extension! Track your streak right here in the app.',
    date: '2026-09-28',
    tag: 'Event',
    author: 'Aakash Kesharwani',
  },
  {
    id: 'ann-2',
    title: '🏋️ Brand New Olympic Barbells & Eleiko Bumper Plates Installed',
    content: 'We have upgraded all four squat racks with competition-grade Eleiko bars and urethane bumper plates. Please remember to re-rack weights after use.',
    date: '2026-09-25',
    tag: 'General',
    author: 'Aakash Kesharwani',
  },
  {
    id: 'ann-3',
    title: '🧘 Free Mobility & Recovery Workshop This Sunday at 9:00 AM',
    content: 'Led by certified physical therapists. Focus on hip flexor flexibility, shoulder mobility, and foam rolling techniques. Open to all active members.',
    date: '2026-09-20',
    tag: 'Event',
    author: 'Aakash Kesharwani',
  },
];

// Helper for dates relative to today (2026-09-30)
function getFormattedDate(offsetDays: number = 0): string {
  const d = new Date('2026-09-30T08:55:00Z');
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

const DEFAULT_MEMBERS: Member[] = [
  {
    id: 'mem-101',
    fullName: 'Sarah Connor',
    email: 'sarah.fitness@gmail.com',
    phone: '+1 (555) 234-5678',
    address: '14 Elm Creek Lane, Metropolis',
    dob: '1995-04-12',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    googleLinked: true,
    googleSub: 'google-sarah-101',
    status: 'active',
    planId: 'plan-quarterly',
    planName: '3 Months Pro',
    startDate: getFormattedDate(-45),
    expiryDate: getFormattedDate(45), // 45 days remaining
    amountPaid: 129,
    createdAt: getFormattedDate(-45),
    streak: 12,
    longestStreak: 18,
    totalVisits: 38,
    monthlyVisits: 19,
    lastVisit: getFormattedDate(0), // Today
    workoutPlanId: 'workout-ppl',
    dietPlanId: 'diet-muscle',
    emergencyContact: 'John Connor (+1 555-999-1234)',
    notes: 'Powerlifting focus. Working on 100kg squat benchmark.',
  },
  {
    id: 'mem-102',
    fullName: 'Marcus Vance',
    email: 'marcus.vance@gmail.com',
    phone: '+1 (555) 345-6789',
    address: '88 Oakwood Heights, Metropolis',
    dob: '1992-08-23',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    googleLinked: true,
    googleSub: 'google-marcus-102',
    status: 'expiring',
    planId: 'plan-monthly',
    planName: '1 Month Standard',
    startDate: getFormattedDate(-27),
    expiryDate: getFormattedDate(3), // Expiring in 3 days!
    amountPaid: 49,
    createdAt: getFormattedDate(-27),
    streak: 4,
    longestStreak: 11,
    totalVisits: 22,
    monthlyVisits: 14,
    lastVisit: getFormattedDate(-1),
    workoutPlanId: 'workout-ppl',
    dietPlanId: 'diet-fatloss',
    notes: 'Needs renewal follow-up. Very consistent.',
  },
  {
    id: 'mem-103',
    fullName: 'David Kim',
    email: 'david.kim@gmail.com',
    phone: '+1 (555) 456-7890',
    address: '502 Pine Street, Apt 4B, Metropolis',
    dob: '1989-11-05',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    googleLinked: true,
    googleSub: 'google-david-103',
    status: 'active',
    planId: 'plan-half-year',
    planName: '6 Months Elite',
    startDate: getFormattedDate(-60),
    expiryDate: getFormattedDate(120),
    amountPaid: 229,
    createdAt: getFormattedDate(-60),
    streak: 0,
    longestStreak: 14,
    totalVisits: 28,
    monthlyVisits: 2,
    lastVisit: getFormattedDate(-14), // RED LIST! 14 days absent
    workoutPlanId: 'workout-ppl',
    dietPlanId: 'diet-muscle',
    notes: 'On Red List: Has not attended for 14 days. Call to check in!',
  },
  {
    id: 'mem-104',
    fullName: 'Elena Rostova',
    email: 'elena.r@gmail.com',
    phone: '+1 (555) 567-8901',
    address: '12 Harbor View Drive, Metropolis',
    dob: '1998-02-14',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    googleLinked: false, // Pre-created by owner, waiting for Google login!
    status: 'expired',
    planId: 'plan-monthly',
    planName: '1 Month Standard',
    startDate: getFormattedDate(-35),
    expiryDate: getFormattedDate(-5), // Expired 5 days ago
    amountPaid: 49,
    createdAt: getFormattedDate(-35),
    streak: 0,
    longestStreak: 9,
    totalVisits: 17,
    monthlyVisits: 4,
    lastVisit: getFormattedDate(-8),
    workoutPlanId: 'workout-fatloss',
    dietPlanId: 'diet-fatloss',
    notes: 'Membership expired. Sent renewal reminder notification.',
  },
  {
    id: 'mem-105',
    fullName: 'Jessica Miller',
    email: 'jess.m@gmail.com',
    phone: '+1 (555) 678-9012',
    address: '903 Maple Avenue, Metropolis',
    dob: '1994-07-30',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    googleLinked: true,
    googleSub: 'google-jess-105',
    status: 'active',
    planId: 'plan-annual',
    planName: '12 Months VIP Transformation',
    startDate: getFormattedDate(-110),
    expiryDate: getFormattedDate(255),
    amountPaid: 399,
    createdAt: getFormattedDate(-110),
    streak: 0,
    longestStreak: 21,
    totalVisits: 42,
    monthlyVisits: 0,
    lastVisit: getFormattedDate(-21), // RED LIST! 21 days absent
    workoutPlanId: 'workout-fatloss',
    dietPlanId: 'diet-fatloss',
    notes: 'Critical Red List: Absent for 3 weeks! Needs retention call.',
  },
  {
    id: 'mem-106',
    fullName: 'Robert Sterling',
    email: 'robert.s@gmail.com',
    phone: '+1 (555) 789-0123',
    address: '320 Sunset Boulevard, Metropolis',
    dob: '1985-09-18',
    photo: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    googleLinked: true,
    googleSub: 'google-robert-106',
    status: 'frozen',
    planId: 'plan-quarterly',
    planName: '3 Months Pro',
    startDate: getFormattedDate(-40),
    expiryDate: getFormattedDate(50),
    amountPaid: 129,
    frozenAt: getFormattedDate(-10),
    freezeReason: 'Rotator cuff injury recovery (Doctor advised 3 weeks rest)',
    createdAt: getFormattedDate(-40),
    streak: 0,
    longestStreak: 15,
    totalVisits: 20,
    monthlyVisits: 5,
    lastVisit: getFormattedDate(-11),
    notes: 'Paused membership upon request. Medical slip verified.',
  },
];

const DEFAULT_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-001',
    memberId: 'mem-101',
    memberName: 'Sarah Connor',
    memberEmail: 'sarah.fitness@gmail.com',
    memberPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    timestamp: '2026-09-30T07:14:00Z',
    date: getFormattedDate(0),
    time: '07:14 AM',
    method: 'qr_scan',
  },
  {
    id: 'att-002',
    memberId: 'mem-101',
    memberName: 'Sarah Connor',
    memberEmail: 'sarah.fitness@gmail.com',
    memberPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    timestamp: '2026-09-29T06:55:00Z',
    date: getFormattedDate(-1),
    time: '06:55 AM',
    method: 'qr_scan',
  },
  {
    id: 'att-003',
    memberId: 'mem-102',
    memberName: 'Marcus Vance',
    memberEmail: 'marcus.vance@gmail.com',
    memberPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    timestamp: '2026-09-29T18:30:00Z',
    date: getFormattedDate(-1),
    time: '06:30 PM',
    method: 'qr_scan',
  },
  {
    id: 'att-004',
    memberId: 'mem-101',
    memberName: 'Sarah Connor',
    memberEmail: 'sarah.fitness@gmail.com',
    memberPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    timestamp: '2026-09-28T07:05:00Z',
    date: getFormattedDate(-2),
    time: '07:05 AM',
    method: 'qr_scan',
  },
  {
    id: 'att-005',
    memberId: 'mem-102',
    memberName: 'Marcus Vance',
    memberEmail: 'marcus.vance@gmail.com',
    memberPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    timestamp: '2026-09-28T19:10:00Z',
    date: getFormattedDate(-2),
    time: '07:10 PM',
    method: 'qr_scan',
  },
];

const DEFAULT_PAYMENTS: PaymentRecord[] = [
  {
    id: 'pay-001',
    invoiceNo: 'INV-2026-0914',
    memberId: 'mem-101',
    memberName: 'Sarah Connor',
    memberEmail: 'sarah.fitness@gmail.com',
    planId: 'plan-quarterly',
    planName: '3 Months Pro',
    amount: 129,
    status: 'verified',
    paymentMethod: 'upi',
    transactionRef: 'UPI-778844112233',
    date: getFormattedDate(-45),
    expiryExtendedTo: getFormattedDate(45),
    verifiedBy: 'System Auto-Verify',
  },
  {
    id: 'pay-002',
    invoiceNo: 'INV-2026-0922',
    memberId: 'mem-102',
    memberName: 'Marcus Vance',
    memberEmail: 'marcus.vance@gmail.com',
    planId: 'plan-monthly',
    planName: '1 Month Standard',
    amount: 49,
    status: 'verified',
    paymentMethod: 'card',
    transactionRef: 'STRIPE-CH_8829910',
    date: getFormattedDate(-27),
    expiryExtendedTo: getFormattedDate(3),
    verifiedBy: 'System Auto-Verify',
  },
  {
    id: 'pay-003',
    invoiceNo: 'INV-2026-0810',
    memberId: 'mem-103',
    memberName: 'David Kim',
    memberEmail: 'david.kim@gmail.com',
    planId: 'plan-half-year',
    planName: '6 Months Elite',
    amount: 229,
    status: 'verified',
    paymentMethod: 'netbanking',
    transactionRef: 'HDFC-TXN-901824',
    date: getFormattedDate(-60),
    expiryExtendedTo: getFormattedDate(120),
    verifiedBy: 'Owner (Aakash)',
  },
  {
    id: 'pay-004',
    invoiceNo: 'INV-2026-0701',
    memberId: 'mem-105',
    memberName: 'Jessica Miller',
    memberEmail: 'jess.m@gmail.com',
    planId: 'plan-annual',
    planName: '12 Months VIP Transformation',
    amount: 399,
    status: 'verified',
    paymentMethod: 'card',
    transactionRef: 'STRIPE-CH_1928374',
    date: getFormattedDate(-110),
    expiryExtendedTo: getFormattedDate(255),
    verifiedBy: 'System Auto-Verify',
  },
];

const DEFAULT_PROGRESS: ProgressLog[] = [
  {
    id: 'prog-01',
    memberId: 'mem-101',
    date: getFormattedDate(-30),
    weightKg: 63.5,
    bodyFatPercent: 21.4,
    chestCm: 89,
    waistCm: 68,
    bicepsCm: 29,
    notes: 'Initial checkup. Strength is climbing nicely.',
  },
  {
    id: 'prog-02',
    memberId: 'mem-101',
    date: getFormattedDate(0),
    weightKg: 62.8,
    bodyFatPercent: 19.8,
    chestCm: 90,
    waistCm: 66,
    bicepsCm: 30,
    notes: 'Down 0.7kg, body fat down 1.6%! Noticeable ab definition.',
  },
];

class DatabaseManager {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
    this.refreshMemberStatuses();
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DATA_FILE)) {
        const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        return {
          settings: parsed.settings || DEFAULT_SETTINGS,
          plans: parsed.plans || DEFAULT_PLANS,
          members: parsed.members || DEFAULT_MEMBERS,
          attendance: parsed.attendance || DEFAULT_ATTENDANCE,
          payments: parsed.payments || DEFAULT_PAYMENTS,
          workouts: parsed.workouts || DEFAULT_WORKOUTS,
          diets: parsed.diets || DEFAULT_DIETS,
          progress: parsed.progress || DEFAULT_PROGRESS,
          announcements: parsed.announcements || DEFAULT_ANNOUNCEMENTS,
        };
      }
    } catch (e) {
      console.error('Error loading data from file, falling back to defaults', e);
    }

    const initialData: DatabaseSchema = {
      settings: DEFAULT_SETTINGS,
      plans: DEFAULT_PLANS,
      members: DEFAULT_MEMBERS,
      attendance: DEFAULT_ATTENDANCE,
      payments: DEFAULT_PAYMENTS,
      workouts: DEFAULT_WORKOUTS,
      diets: DEFAULT_DIETS,
      progress: DEFAULT_PROGRESS,
      announcements: DEFAULT_ANNOUNCEMENTS,
    };
    this.persist(initialData);
    return initialData;
  }

  private persist(dataToSave: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save gym data to file', e);
    }
  }

  public save() {
    this.persist(this.data);
  }

  public getRawData(): DatabaseSchema {
    return this.data;
  }

  public restoreData(newData: DatabaseSchema) {
    this.data = newData;
    this.refreshMemberStatuses();
    this.save();
  }

  public refreshMemberStatuses() {
    const today = new Date('2026-09-30T08:55:00Z').toISOString().split('T')[0];
    const todayTime = new Date(today).getTime();

    for (const mem of this.data.members) {
      if (mem.status === 'frozen' || mem.status === 'inactive') {
        continue;
      }
      const expiryTime = new Date(mem.expiryDate).getTime();
      const diffDays = Math.ceil((expiryTime - todayTime) / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        mem.status = 'expired';
      } else if (diffDays <= 5) {
        mem.status = 'expiring';
      } else {
        mem.status = 'active';
      }
    }
  }

  // Settings
  public getSettings(): GymSettings {
    return this.data.settings;
  }

  public updateSettings(newSettings: Partial<GymSettings>): GymSettings {
    this.data.settings = { ...this.data.settings, ...newSettings };
    this.save();
    return this.data.settings;
  }

  // Plans
  public getPlans(): MembershipPlan[] {
    return this.data.plans;
  }

  public addPlan(plan: MembershipPlan): MembershipPlan {
    this.data.plans.push(plan);
    this.save();
    return plan;
  }

  public updatePlan(id: string, updates: Partial<MembershipPlan>): MembershipPlan | null {
    const idx = this.data.plans.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    this.data.plans[idx] = { ...this.data.plans[idx], ...updates };
    this.save();
    return this.data.plans[idx];
  }

  public deletePlan(id: string): boolean {
    const prevLen = this.data.plans.length;
    this.data.plans = this.data.plans.filter((p) => p.id !== id);
    if (this.data.plans.length !== prevLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Members
  public getMembers(): Member[] {
    this.refreshMemberStatuses();
    return this.data.members;
  }

  public getMemberById(id: string): Member | null {
    this.refreshMemberStatuses();
    return this.data.members.find((m) => m.id === id) || null;
  }

  public getMemberByEmail(email: string): Member | null {
    this.refreshMemberStatuses();
    return this.data.members.find((m) => m.email.toLowerCase().trim() === email.toLowerCase().trim()) || null;
  }

  public addMember(member: Member): Member {
    this.data.members.push(member);
    this.refreshMemberStatuses();
    this.save();
    return member;
  }

  public updateMember(id: string, updates: Partial<Member>): Member | null {
    const idx = this.data.members.findIndex((m) => m.id === id);
    if (idx === -1) return null;
    this.data.members[idx] = { ...this.data.members[idx], ...updates };
    this.refreshMemberStatuses();
    this.save();
    return this.data.members[idx];
  }

  public deleteMember(id: string): boolean {
    const prev = this.data.members.length;
    this.data.members = this.data.members.filter((m) => m.id !== id);
    if (this.data.members.length !== prev) {
      this.save();
      return true;
    }
    return false;
  }

  // Red List Calculation (10-day automatic inactivity)
  public getRedList(): { member: Member; daysAbsent: number; lastSeenDate: string | null; riskLevel: 'high' | 'critical' }[] {
    this.refreshMemberStatuses();
    const thresholdDays = this.data.settings.redListThresholdDays || 10;
    const today = new Date('2026-09-30T08:55:00Z').getTime();

    const redList: { member: Member; daysAbsent: number; lastSeenDate: string | null; riskLevel: 'high' | 'critical' }[] = [];

    for (const mem of this.data.members) {
      if (mem.status === 'inactive' || mem.status === 'frozen') continue;

      let lastSeen: string | null = mem.lastVisit || null;
      let daysAbsent = 0;

      if (lastSeen) {
        const lastSeenTime = new Date(lastSeen).getTime();
        daysAbsent = Math.floor((today - lastSeenTime) / (1000 * 60 * 60 * 24));
      } else {
        // Never checked in, use creation date
        const createdTime = new Date(mem.createdAt).getTime();
        daysAbsent = Math.floor((today - createdTime) / (1000 * 60 * 60 * 24));
      }

      if (daysAbsent >= thresholdDays) {
        redList.push({
          member: mem,
          daysAbsent,
          lastSeenDate: lastSeen,
          riskLevel: daysAbsent >= 20 ? 'critical' : 'high',
        });
      }
    }

    // Sort descending by days absent
    return redList.sort((a, b) => b.daysAbsent - a.daysAbsent);
  }

  // Attendance
  public getAttendance(): AttendanceRecord[] {
    return this.data.attendance;
  }

  public getMemberAttendance(memberId: string): AttendanceRecord[] {
    return this.data.attendance
      .filter((a) => a.memberId === memberId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public recordCheckIn(
    memberId: string,
    method: 'qr_scan' | 'manual_owner' = 'qr_scan'
  ): { success: boolean; message: string; record?: AttendanceRecord; streak?: number } {
    const member = this.getMemberById(memberId);
    if (!member) {
      return { success: false, message: 'Member not found.' };
    }

    if (member.status === 'expired') {
      return { success: false, message: 'Membership has expired. Please renew to check in.' };
    }
    if (member.status === 'frozen') {
      return { success: false, message: `Membership is currently paused (${member.freezeReason || 'Medical/Leave'}). Unfreeze with owner to check in.` };
    }
    if (member.status === 'inactive') {
      return { success: false, message: 'Membership account is inactive.' };
    }

    const todayDate = new Date('2026-09-30T08:55:00Z').toISOString().split('T')[0];
    const nowTime = '08:55 AM';

    // Check if already checked in today
    const already = this.data.attendance.find(
      (a) => a.memberId === memberId && a.date === todayDate
    );
    if (already) {
      return {
        success: false,
        message: `Already checked in today at ${already.time}! Keep up the great work!`,
        streak: member.streak,
      };
    }

    // Calculate streak
    let newStreak = 1;
    if (member.lastVisit) {
      const lastVisitTime = new Date(member.lastVisit).getTime();
      const todayTime = new Date(todayDate).getTime();
      const diffDays = Math.floor((todayTime - lastVisitTime) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        newStreak = (member.streak || 0) + 1;
      } else if (diffDays === 0) {
        newStreak = member.streak || 1;
      } else {
        newStreak = 1; // Streak broken
      }
    }

    const longest = Math.max(member.longestStreak || 0, newStreak);
    const newRecord: AttendanceRecord = {
      id: 'att-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      memberId: member.id,
      memberName: member.fullName,
      memberEmail: member.email,
      memberPhoto: member.photo,
      timestamp: new Date('2026-09-30T08:55:00Z').toISOString(),
      date: todayDate,
      time: nowTime,
      method,
    };

    this.data.attendance.unshift(newRecord);

    // Update member record
    this.updateMember(memberId, {
      lastVisit: todayDate,
      streak: newStreak,
      longestStreak: longest,
      totalVisits: (member.totalVisits || 0) + 1,
      monthlyVisits: (member.monthlyVisits || 0) + 1,
    });

    return {
      success: true,
      message: `Check-in successful! Welcome to FitPulse, ${member.fullName}!`,
      record: newRecord,
      streak: newStreak,
    };
  }

  // Payments
  public getPayments(): PaymentRecord[] {
    return this.data.payments.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  public getMemberPayments(memberId: string): PaymentRecord[] {
    return this.data.payments
      .filter((p) => p.memberId === memberId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public processRenewal(
    memberId: string,
    planId: string,
    paymentMethod: 'upi' | 'card' | 'cash' | 'netbanking',
    txRef?: string
  ): { success: boolean; message: string; payment?: PaymentRecord; newExpiry?: string } {
    const member = this.getMemberById(memberId);
    if (!member) return { success: false, message: 'Member not found.' };

    const plan = this.data.plans.find((p) => p.id === planId);
    if (!plan) return { success: false, message: 'Selected plan not found.' };

    const todayDate = new Date('2026-09-30T08:55:00Z').toISOString().split('T')[0];
    const todayTime = new Date(todayDate).getTime();
    const currentExpiryTime = new Date(member.expiryDate).getTime();

    let baseTime = todayTime;
    if (currentExpiryTime > todayTime) {
      // Extend from current expiry
      baseTime = currentExpiryTime;
    }

    const newExpiryDateObj = new Date(baseTime);
    newExpiryDateObj.setDate(newExpiryDateObj.getDate() + plan.durationDays);
    const newExpiry = newExpiryDateObj.toISOString().split('T')[0];

    const invoiceNo = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const paymentRecord: PaymentRecord = {
      id: 'pay-' + Date.now(),
      invoiceNo,
      memberId: member.id,
      memberName: member.fullName,
      memberEmail: member.email,
      planId: plan.id,
      planName: plan.name,
      amount: plan.price,
      status: 'verified',
      paymentMethod,
      transactionRef: txRef || `TXN-${paymentMethod.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date('2026-09-30T08:55:00Z').toISOString(),
      expiryExtendedTo: newExpiry,
      verifiedBy: 'System Instant Renewal',
    };

    this.data.payments.unshift(paymentRecord);

    this.updateMember(member.id, {
      planId: plan.id,
      planName: plan.name,
      expiryDate: newExpiry,
      status: 'active',
      amountPaid: (member.amountPaid || 0) + plan.price,
    });

    return {
      success: true,
      message: `Membership renewed successfully! Valid until ${newExpiry}.`,
      payment: paymentRecord,
      newExpiry,
    };
  }

  // Workouts & Diets
  public getWorkouts(): WorkoutPlan[] {
    return this.data.workouts;
  }

  public getWorkoutById(id: string): WorkoutPlan | null {
    return this.data.workouts.find((w) => w.id === id) || null;
  }

  public saveWorkout(plan: WorkoutPlan): WorkoutPlan {
    const idx = this.data.workouts.findIndex((w) => w.id === plan.id);
    if (idx >= 0) {
      this.data.workouts[idx] = plan;
    } else {
      this.data.workouts.push(plan);
    }
    this.save();
    return plan;
  }

  public getDiets(): DietPlan[] {
    return this.data.diets;
  }

  public getDietById(id: string): DietPlan | null {
    return this.data.diets.find((d) => d.id === id) || null;
  }

  public saveDiet(plan: DietPlan): DietPlan {
    const idx = this.data.diets.findIndex((d) => d.id === plan.id);
    if (idx >= 0) {
      this.data.diets[idx] = plan;
    } else {
      this.data.diets.push(plan);
    }
    this.save();
    return plan;
  }

  // Progress Logs
  public getMemberProgress(memberId: string): ProgressLog[] {
    return this.data.progress
      .filter((p) => p.memberId === memberId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public addProgressLog(log: ProgressLog): ProgressLog {
    this.data.progress.unshift(log);
    this.save();
    return log;
  }

  // Announcements
  public getAnnouncements(): Announcement[] {
    return this.data.announcements.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  public addAnnouncement(ann: Announcement): Announcement {
    this.data.announcements.unshift(ann);
    this.save();
    return ann;
  }

  public deleteAnnouncement(id: string): boolean {
    const prev = this.data.announcements.length;
    this.data.announcements = this.data.announcements.filter((a) => a.id !== id);
    if (this.data.announcements.length !== prev) {
      this.save();
      return true;
    }
    return false;
  }
}

export const dbManager = new DatabaseManager();
