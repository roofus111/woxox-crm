/**
 * Seed legacy crmserver admin + demo company in production MongoDB.
 * Run inside the crmserver container (models + bcrypt hooks available).
 *
 * Usage (from repo root on EC2):
 *   bash deploy/aws/seed-legacy-admin.sh
 */
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongo:27017/woxox_crm';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@woxox.local';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

async function seed() {
  const User = require('../models/User');
  const Company = require('../models/Company');

  await mongoose.connect(MONGODB_URI);
  console.log('[seed] Connected to MongoDB');

  let company = await Company.findOne({ email: ADMIN_EMAIL });
  if (!company) {
    company = await Company.create({
      name: 'WOXOX Demo Co',
      email: ADMIN_EMAIL,
      phone: '+91-0000000000',
      industry: 'Software',
      employees: 25,
      address: {
        street: '1 Demo Street',
        city: 'Bengaluru',
        state: 'KA',
        country: 'IN',
        postalCode: '560001',
      },
      Module: {
        Customer: true,
        lead: true,
        pipeline: true,
        finance: true,
        documentation: true,
      },
      enabledProducts: [
        'crm',
        'projectsLite',
        'projectsMax',
        'finance',
        'hrms',
        'legalos',
        'docsign',
        'academy',
        'ecommerce',
      ],
    });
    console.log('[seed] Created company', company._id.toString());
  } else {
    console.log('[seed] Company already exists', company._id.toString());
  }

  let admin = await User.findOne({ email: ADMIN_EMAIL });
  if (!admin) {
    admin = await User.create({
      email: ADMIN_EMAIL,
      name: 'WOXOX Admin',
      firstName: 'WOXOX',
      lastName: 'Admin',
      password: ADMIN_PASSWORD,
      role: 'admin',
      isActive: true,
      isEmailVerified: true,
      company: company._id,
    });
    console.log(`[seed] Created admin ${ADMIN_EMAIL}`);
  } else {
    if (!admin.company) {
      admin.company = company._id;
      await admin.save();
      console.log('[seed] Attached company to existing admin');
    } else {
      console.log(`[seed] Admin already exists: ${ADMIN_EMAIL}`);
    }
  }

  console.log(`[seed] Login ready → ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log('[seed] Change the password after first login.');
}

seed()
  .then(() => mongoose.disconnect())
  .catch((err) => {
    console.error('[seed] Failed:', err);
    process.exit(1);
  });
