import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dbManager } from './server/db.ts';
import { UserRole, UserSession, Member, ProgressLog } from './src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Simple cryptographic token simulation for full-stack sessions
interface TokenPayload {
  role: UserRole;
  email: string;
  name: string;
  memberId?: string;
  avatar?: string;
  phone?: string;
  exp: number;
}

function createSessionToken(payload: Omit<TokenPayload, 'exp'>): string {
  const fullPayload: TokenPayload = {
    ...payload,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  return Buffer.from(JSON.stringify(fullPayload)).toString('base64');
}

function decodeSessionToken(token: string): TokenPayload | null {
  try {
    const raw = Buffer.from(token, 'base64').toString('utf-8');
    const parsed = JSON.parse(raw) as TokenPayload;
    if (parsed.exp < Date.now()) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      userSession?: TokenPayload;
    }
  }
}

// Middleware: Extract session
const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  const token = authHeader.substring(7);
  const session = decodeSessionToken(token);
  if (session) {
    req.userSession = session;
  }
  next();
};

// Middleware: Require Owner
const requireOwner = (req: Request, res: Response, next: NextFunction) => {
  if (!req.userSession || req.userSession.role !== 'owner') {
    return res.status(403).json({
      error: 'Forbidden: Owner administrative privileges required to access this resource.',
    });
  }
  next();
};

// Middleware: Require Authenticated User
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.userSession) {
    return res.status(401).json({ error: 'Unauthorized: Valid authentication token required.' });
  }
  next();
};

app.use('/api', authenticate);

// -------------------------------------------------------------
// AUTHENTICATION ROUTES
// -------------------------------------------------------------

// Google Login endpoint
app.post('/api/auth/google-login', (req: Request, res: Response) => {
  const { email, name, avatar, googleSub } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const settings = dbManager.getSettings();
  const normalizedEmail = email.toLowerCase().trim();

  // 1. Check if owner email
  if (normalizedEmail === settings.ownerEmail.toLowerCase().trim()) {
    const token = createSessionToken({
      role: 'owner',
      email: settings.ownerEmail,
      name: name || settings.ownerName,
      avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      phone: settings.ownerPhone,
    });
    return res.json({
      success: true,
      role: 'owner',
      session: {
        token,
        role: 'owner',
        email: settings.ownerEmail,
        name: settings.ownerName,
        phone: settings.ownerPhone,
        avatar,
      },
    });
  }

  // 2. Search for existing member with this email
  const existingMember = dbManager.getMemberByEmail(normalizedEmail);
  if (existingMember) {
    // Link Google account if not linked yet
    if (!existingMember.googleLinked || !existingMember.googleSub) {
      dbManager.updateMember(existingMember.id, {
        googleLinked: true,
        googleSub: googleSub || `google-${Date.now()}`,
        photo: existingMember.photo || avatar,
      });
    }

    const token = createSessionToken({
      role: 'member',
      email: existingMember.email,
      name: existingMember.fullName,
      memberId: existingMember.id,
      avatar: existingMember.photo || avatar,
      phone: existingMember.phone,
    });

    return res.json({
      success: true,
      role: 'member',
      session: {
        token,
        role: 'member',
        email: existingMember.email,
        name: existingMember.fullName,
        memberId: existingMember.id,
        avatar: existingMember.photo || avatar,
        phone: existingMember.phone,
      },
      member: dbManager.getMemberById(existingMember.id),
    });
  }

  // 3. New member needs profile completion
  return res.json({
    success: true,
    needsProfileSetup: true,
    profileData: {
      email: normalizedEmail,
      name: name || '',
      avatar: avatar || '',
      googleSub: googleSub || `google-${Date.now()}`,
    },
  });
});

// Complete profile for new member
app.post('/api/auth/complete-profile', (req: Request, res: Response) => {
  const { fullName, email, phone, address, dob, photo, googleSub } = req.body;

  if (!fullName || !email || !phone || !address) {
    return res.status(400).json({ error: 'Full Name, Email, Phone, and Address are required.' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Prevent duplicate member profiles
  const existing = dbManager.getMemberByEmail(normalizedEmail);
  if (existing) {
    return res.status(409).json({
      error: 'A member with this email already exists. Please log in to link your account.',
    });
  }

  // Default initial trial / 1 month membership for self-onboarded members
  const plans = dbManager.getPlans();
  const defaultPlan = plans[0] || { id: 'plan-monthly', name: '1 Month Standard', price: 49, durationDays: 30 };
  const today = '2026-09-30';
  const expDateObj = new Date('2026-09-30T08:55:00Z');
  expDateObj.setDate(expDateObj.getDate() + defaultPlan.durationDays);
  const expiryDate = expDateObj.toISOString().split('T')[0];

  const newMember: Member = {
    id: 'mem-' + Date.now(),
    fullName: fullName.trim(),
    email: normalizedEmail,
    phone: phone.trim(),
    address: address.trim(),
    dob: dob || '1998-01-01',
    photo: photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    googleLinked: true,
    googleSub: googleSub || `google-${Date.now()}`,
    status: 'active',
    planId: defaultPlan.id,
    planName: defaultPlan.name,
    startDate: today,
    expiryDate,
    amountPaid: defaultPlan.price,
    createdAt: today,
    streak: 0,
    longestStreak: 0,
    totalVisits: 0,
    monthlyVisits: 0,
    workoutPlanId: 'workout-ppl',
    dietPlanId: 'diet-muscle',
    notes: 'Self-registered via Google Auth.',
  };

  dbManager.addMember(newMember);

  // Add initial payment record
  dbManager.processRenewal(newMember.id, defaultPlan.id, 'card', `INIT-${Date.now()}`);

  const token = createSessionToken({
    role: 'member',
    email: newMember.email,
    name: newMember.fullName,
    memberId: newMember.id,
    avatar: newMember.photo,
    phone: newMember.phone,
  });

  return res.json({
    success: true,
    session: {
      token,
      role: 'member',
      email: newMember.email,
      name: newMember.fullName,
      memberId: newMember.id,
      avatar: newMember.photo,
      phone: newMember.phone,
    },
    member: newMember,
  });
});

// Direct Owner Login (for testing / owner portal)
app.post('/api/auth/owner-login', (req: Request, res: Response) => {
  const settings = dbManager.getSettings();
  const token = createSessionToken({
    role: 'owner',
    email: settings.ownerEmail,
    name: settings.ownerName,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: settings.ownerPhone,
  });

  return res.json({
    success: true,
    session: {
      token,
      role: 'owner',
      email: settings.ownerEmail,
      name: settings.ownerName,
      phone: settings.ownerPhone,
    },
  });
});

// Current user profile
app.get('/api/auth/me', requireAuth, (req: Request, res: Response) => {
  const session = req.userSession!;
  if (session.role === 'owner') {
    return res.json({
      role: 'owner',
      user: {
        email: session.email,
        name: session.name,
        phone: session.phone,
      },
    });
  }

  const member = dbManager.getMemberById(session.memberId!);
  if (!member) {
    return res.status(404).json({ error: 'Member profile not found' });
  }

  return res.json({
    role: 'member',
    member,
  });
});

// -------------------------------------------------------------
// MEMBER ENDPOINTS (STRICT RBAC)
// -------------------------------------------------------------

// List all members -> OWNER ONLY
app.get('/api/members', requireOwner, (req: Request, res: Response) => {
  const members = dbManager.getMembers();
  res.json(members);
});

// Add member manually -> OWNER ONLY
app.post('/api/members', requireOwner, (req: Request, res: Response) => {
  const {
    fullName,
    email,
    phone,
    address,
    dob,
    photo,
    planId,
    startDate,
    expiryDate,
    amount,
    notes,
    emergencyContact,
  } = req.body;

  if (!fullName || !email || !phone || !address || !planId) {
    return res.status(400).json({ error: 'Required fields: Full Name, Email, Phone, Address, and Plan.' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existing = dbManager.getMemberByEmail(normalizedEmail);
  if (existing) {
    return res.status(409).json({ error: 'A member with this email already exists!' });
  }

  const plans = dbManager.getPlans();
  const selectedPlan = plans.find((p) => p.id === planId) || plans[0];
  const sDate = startDate || '2026-09-30';

  let eDate = expiryDate;
  if (!eDate) {
    const d = new Date(sDate);
    d.setDate(d.getDate() + (selectedPlan?.durationDays || 30));
    eDate = d.toISOString().split('T')[0];
  }

  const newMember: Member = {
    id: 'mem-' + Date.now(),
    fullName: fullName.trim(),
    email: normalizedEmail,
    phone: phone.trim(),
    address: address.trim(),
    dob: dob || '1995-01-01',
    photo: photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    googleLinked: false, // will link when member signs in with Google!
    status: 'active',
    planId: selectedPlan.id,
    planName: selectedPlan.name,
    startDate: sDate,
    expiryDate: eDate,
    amountPaid: Number(amount) || selectedPlan.price,
    createdAt: '2026-09-30',
    streak: 0,
    longestStreak: 0,
    totalVisits: 0,
    monthlyVisits: 0,
    workoutPlanId: 'workout-ppl',
    dietPlanId: 'diet-muscle',
    notes,
    emergencyContact,
  };

  dbManager.addMember(newMember);

  // Record initial payment
  const payment: any = {
    id: 'pay-' + Date.now(),
    invoiceNo: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    memberId: newMember.id,
    memberName: newMember.fullName,
    memberEmail: newMember.email,
    planId: selectedPlan.id,
    planName: selectedPlan.name,
    amount: newMember.amountPaid,
    status: 'verified',
    paymentMethod: 'cash',
    transactionRef: 'OWNER-ONBOARD-' + Math.floor(10000 + Math.random() * 90000),
    date: '2026-09-30T08:55:00Z',
    expiryExtendedTo: eDate,
    verifiedBy: req.userSession?.name || 'Owner',
  };
  dbManager.getPayments().unshift(payment);
  dbManager.save();

  res.status(201).json(newMember);
});

// View single member details -> Owner can view any; Member can ONLY view their own ID!
app.get('/api/members/:id', requireAuth, (req: Request, res: Response) => {
  const session = req.userSession!;
  const targetId = req.params.id;

  if (session.role === 'member' && session.memberId !== targetId) {
    return res.status(403).json({
      error: 'Forbidden: Security violation. Members cannot view other members data.',
    });
  }

  const member = dbManager.getMemberById(targetId);
  if (!member) {
    return res.status(404).json({ error: 'Member not found.' });
  }

  res.json(member);
});

// Update member -> Owner can update all; Member can only update profile fields on themselves
app.put('/api/members/:id', requireAuth, (req: Request, res: Response) => {
  const session = req.userSession!;
  const targetId = req.params.id;

  if (session.role === 'member' && session.memberId !== targetId) {
    return res.status(403).json({
      error: 'Forbidden: You cannot modify another member profile.',
    });
  }

  if (session.role === 'member') {
    // Member is strictly forbidden from changing status, plan, expiry, or amount
    const { phone, address, photo, dob, emergencyContact } = req.body;
    const updated = dbManager.updateMember(targetId, {
      phone,
      address,
      photo,
      dob,
      emergencyContact,
    });
    return res.json(updated);
  }

  // Owner can update everything
  const updated = dbManager.updateMember(targetId, req.body);
  res.json(updated);
});

// Pause / Freeze membership -> OWNER ONLY
app.post('/api/members/:id/freeze', requireOwner, (req: Request, res: Response) => {
  const { reason } = req.body;
  const member = dbManager.getMemberById(req.params.id);
  if (!member) return res.status(404).json({ error: 'Member not found.' });

  const updated = dbManager.updateMember(member.id, {
    status: 'frozen',
    frozenAt: '2026-09-30',
    freezeReason: reason || 'Temporary hold requested by member',
  });
  res.json({ success: true, member: updated });
});

// Unfreeze membership -> OWNER ONLY
app.post('/api/members/:id/unfreeze', requireOwner, (req: Request, res: Response) => {
  const member = dbManager.getMemberById(req.params.id);
  if (!member) return res.status(404).json({ error: 'Member not found.' });

  // Calculate days frozen and extend expiry date accordingly
  let extraDays = 0;
  if (member.frozenAt) {
    const frozenTime = new Date(member.frozenAt).getTime();
    const nowTime = new Date('2026-09-30T08:55:00Z').getTime();
    extraDays = Math.max(0, Math.floor((nowTime - frozenTime) / (1000 * 60 * 60 * 24)));
  }

  const expObj = new Date(member.expiryDate);
  expObj.setDate(expObj.getDate() + extraDays);
  const newExpiry = expObj.toISOString().split('T')[0];

  const updated = dbManager.updateMember(member.id, {
    status: 'active',
    frozenAt: undefined,
    freezeReason: undefined,
    expiryDate: newExpiry,
  });
  res.json({ success: true, member: updated, extraDaysAdded: extraDays });
});

// Extend membership days -> OWNER ONLY
app.post('/api/members/:id/extend', requireOwner, (req: Request, res: Response) => {
  const { days, reason } = req.body;
  const numDays = parseInt(days, 10);
  if (isNaN(numDays) || numDays <= 0) {
    return res.status(400).json({ error: 'Valid number of days required.' });
  }

  const member = dbManager.getMemberById(req.params.id);
  if (!member) return res.status(404).json({ error: 'Member not found.' });

  const expObj = new Date(member.expiryDate);
  expObj.setDate(expObj.getDate() + numDays);
  const newExpiry = expObj.toISOString().split('T')[0];

  const updated = dbManager.updateMember(member.id, {
    expiryDate: newExpiry,
    status: 'active',
    notes: `${member.notes ? member.notes + '\n' : ''}[Extended ${numDays} days by owner on 2026-09-30: ${reason || 'Complimentary'}]`,
  });

  res.json({ success: true, member: updated, newExpiry });
});

// Deactivate / Delete member -> OWNER ONLY
app.delete('/api/members/:id', requireOwner, (req: Request, res: Response) => {
  const success = dbManager.deleteMember(req.params.id);
  if (!success) return res.status(404).json({ error: 'Member not found' });
  res.json({ success: true, message: 'Member deactivated and removed.' });
});

// -------------------------------------------------------------
// RED LIST & ATTENDANCE
// -------------------------------------------------------------

// Automated 10-day Red List -> OWNER ONLY
app.get('/api/attendance/red-list', requireOwner, (req: Request, res: Response) => {
  const redList = dbManager.getRedList();
  res.json(redList);
});

// View all attendance logs -> OWNER ONLY
app.get('/api/attendance/all', requireOwner, (req: Request, res: Response) => {
  const logs = dbManager.getAttendance();
  res.json(logs);
});

// View personal attendance logs -> MEMBER (their own) or OWNER
app.get('/api/attendance/my', requireAuth, (req: Request, res: Response) => {
  const session = req.userSession!;
  if (session.role === 'owner') {
    return res.json(dbManager.getAttendance().slice(0, 30));
  }

  const myLogs = dbManager.getMemberAttendance(session.memberId!);
  res.json(myLogs);
});

// Get Live Gym QR Code Token for Display / Scanning -> OWNER ONLY
app.get('/api/attendance/qr-code', requireOwner, (req: Request, res: Response) => {
  const settings = dbManager.getSettings();
  const today = '2026-09-30';
  const qrPayload = JSON.stringify({
    gym: settings.gymName,
    secret: settings.attendanceQrSecret,
    date: today,
    venue: 'Metropolis Main Facility',
  });

  res.json({
    qrPayload,
    secret: settings.attendanceQrSecret,
    today,
  });
});

// Check-in via QR scan -> MEMBER checks themselves in using scanned QR token
app.post('/api/attendance/check-in-qr', requireAuth, (req: Request, res: Response) => {
  const session = req.userSession!;
  const memberId = session.role === 'member' ? session.memberId! : req.body.memberId;

  if (!memberId) {
    return res.status(400).json({ error: 'Member identity missing.' });
  }

  const { qrPayload } = req.body;
  const settings = dbManager.getSettings();

  // Validate QR payload
  let isValidQr = false;
  try {
    const parsed = JSON.parse(qrPayload);
    if (parsed.secret === settings.attendanceQrSecret) {
      isValidQr = true;
    }
  } catch {
    // If sent as raw secret string
    if (qrPayload === settings.attendanceQrSecret) {
      isValidQr = true;
    }
  }

  if (!isValidQr) {
    return res.status(400).json({
      error: 'Invalid QR Code. Please scan the official FitPulse Gym reception QR code.',
    });
  }

  const result = dbManager.recordCheckIn(memberId, 'qr_scan');
  if (!result.success) {
    return res.status(400).json(result);
  }

  const updatedMember = dbManager.getMemberById(memberId);
  res.json({
    ...result,
    member: updatedMember,
  });
});

// Manual Check-In by Owner -> OWNER ONLY
app.post('/api/attendance/manual-checkin', requireOwner, (req: Request, res: Response) => {
  const { memberId } = req.body;
  if (!memberId) return res.status(400).json({ error: 'Member ID required.' });

  const result = dbManager.recordCheckIn(memberId, 'manual_owner');
  if (!result.success) {
    return res.status(400).json(result);
  }
  res.json(result);
});

// -------------------------------------------------------------
// MEMBERSHIP PLANS & PAYMENTS
// -------------------------------------------------------------

// Plans list -> PUBLIC
app.get('/api/plans', (req: Request, res: Response) => {
  res.json(dbManager.getPlans());
});

// Manage plans -> OWNER ONLY
app.post('/api/plans', requireOwner, (req: Request, res: Response) => {
  const newPlan = { ...req.body, id: 'plan-' + Date.now() };
  dbManager.addPlan(newPlan);
  res.status(201).json(newPlan);
});

app.put('/api/plans/:id', requireOwner, (req: Request, res: Response) => {
  const updated = dbManager.updatePlan(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Plan not found.' });
  res.json(updated);
});

// View all payments -> OWNER ONLY
app.get('/api/payments', requireOwner, (req: Request, res: Response) => {
  res.json(dbManager.getPayments());
});

// View my payments -> MEMBER ONLY (their own)
app.get('/api/payments/my', requireAuth, (req: Request, res: Response) => {
  const session = req.userSession!;
  if (session.role === 'owner') {
    return res.json(dbManager.getPayments());
  }
  res.json(dbManager.getMemberPayments(session.memberId!));
});

// Online Membership Renewal -> MEMBER or OWNER
app.post('/api/payments/renew', requireAuth, (req: Request, res: Response) => {
  const session = req.userSession!;
  const targetMemberId = session.role === 'member' ? session.memberId! : req.body.memberId;

  if (!targetMemberId) {
    return res.status(400).json({ error: 'Member identity missing.' });
  }

  const { planId, paymentMethod, transactionRef } = req.body;
  if (!planId) {
    return res.status(400).json({ error: 'Plan selection required.' });
  }

  const result = dbManager.processRenewal(
    targetMemberId,
    planId,
    paymentMethod || 'upi',
    transactionRef
  );

  if (!result.success) {
    return res.status(400).json(result);
  }

  const updatedMember = dbManager.getMemberById(targetMemberId);
  res.json({
    ...result,
    member: updatedMember,
  });
});

// -------------------------------------------------------------
// WORKOUT PLANS & DIET GUIDANCE
// -------------------------------------------------------------

app.get('/api/workouts', (req: Request, res: Response) => {
  res.json(dbManager.getWorkouts());
});

app.post('/api/workouts', requireOwner, (req: Request, res: Response) => {
  const plan = { ...req.body, id: req.body.id || 'workout-' + Date.now() };
  dbManager.saveWorkout(plan);
  res.status(201).json(plan);
});

app.get('/api/diets', (req: Request, res: Response) => {
  res.json(dbManager.getDiets());
});

app.post('/api/diets', requireOwner, (req: Request, res: Response) => {
  const plan = { ...req.body, id: req.body.id || 'diet-' + Date.now() };
  dbManager.saveDiet(plan);
  res.status(201).json(plan);
});

// -------------------------------------------------------------
// PROGRESS TRACKING
// -------------------------------------------------------------

app.get('/api/progress/my', requireAuth, (req: Request, res: Response) => {
  const session = req.userSession!;
  if (session.role === 'owner') {
    return res.json([]);
  }
  res.json(dbManager.getMemberProgress(session.memberId!));
});

app.post('/api/progress/my', requireAuth, (req: Request, res: Response) => {
  const session = req.userSession!;
  if (session.role !== 'member' || !session.memberId) {
    return res.status(403).json({ error: 'Only members can log progress.' });
  }

  const { weightKg, bodyFatPercent, chestCm, waistCm, bicepsCm, notes } = req.body;
  if (!weightKg) {
    return res.status(400).json({ error: 'Body weight is required.' });
  }

  const newLog: ProgressLog = {
    id: 'prog-' + Date.now(),
    memberId: session.memberId,
    date: '2026-09-30',
    weightKg: Number(weightKg),
    bodyFatPercent: bodyFatPercent ? Number(bodyFatPercent) : undefined,
    chestCm: chestCm ? Number(chestCm) : undefined,
    waistCm: waistCm ? Number(waistCm) : undefined,
    bicepsCm: bicepsCm ? Number(bicepsCm) : undefined,
    notes,
  };

  dbManager.addProgressLog(newLog);
  res.status(201).json(newLog);
});

app.get('/api/progress/member/:id', requireOwner, (req: Request, res: Response) => {
  res.json(dbManager.getMemberProgress(req.params.id));
});

// -------------------------------------------------------------
// ANNOUNCEMENTS
// -------------------------------------------------------------

app.get('/api/announcements', (req: Request, res: Response) => {
  res.json(dbManager.getAnnouncements());
});

app.post('/api/announcements', requireOwner, (req: Request, res: Response) => {
  const { title, content, tag } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content required.' });
  }

  const newAnn = dbManager.addAnnouncement({
    id: 'ann-' + Date.now(),
    title,
    content,
    date: '2026-09-30',
    tag: tag || 'General',
    author: req.userSession?.name || 'Owner',
  });

  res.status(201).json(newAnn);
});

app.delete('/api/announcements/:id', requireOwner, (req: Request, res: Response) => {
  const ok = dbManager.deleteAnnouncement(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Announcement not found.' });
  res.json({ success: true });
});

// -------------------------------------------------------------
// GYM SETTINGS & BACKUP / RESTORE
// -------------------------------------------------------------

app.get('/api/settings', (req: Request, res: Response) => {
  res.json(dbManager.getSettings());
});

app.put('/api/settings', requireOwner, (req: Request, res: Response) => {
  const updated = dbManager.updateSettings(req.body);
  res.json(updated);
});

// Full database backup export -> OWNER ONLY
app.get('/api/backup/export', requireOwner, (req: Request, res: Response) => {
  const data = dbManager.getRawData();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename=fitpulse-backup-2026-09-30.json`);
  res.json(data);
});

// Full database restore -> OWNER ONLY
app.post('/api/backup/restore', requireOwner, (req: Request, res: Response) => {
  const { backupData } = req.body;
  if (!backupData || !backupData.members || !backupData.settings) {
    return res.status(400).json({ error: 'Invalid backup file structure.' });
  }
  dbManager.restoreData(backupData);
  res.json({ success: true, message: 'Database successfully restored from backup.' });
});

// -------------------------------------------------------------
// VITE MIDDLEWARE OR STATIC SERVING
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FitPulse Gym Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
