require('dotenv').config();
const mongoose = require('mongoose');
const College = require('./models/College');
const User = require('./models/User');
const Branch = require('./models/Branch');
const Student = require('./models/Student');
const Attendance = require('./models/Attendance');

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function migrateStudentEmails() {
  try {
    const coll = mongoose.connection.db.collection('students');
    const r = await coll.updateMany(
      {
        parentEmail: { $exists: true, $nin: [null, ''] },
        $or: [{ email: { $exists: false } }, { email: null }, { email: '' }],
      },
      [{ $set: { email: '$parentEmail' } }]
    );
    if (r.modifiedCount) console.log(`Migrated parentEmail → email for ${r.modifiedCount} students`);
  } catch (e) {
    console.warn('Student email migration:', e.message);
  }
}

async function purgeLegacyAttendance() {
  try {
    const r = await Attendance.deleteMany({
      $or: [
        { subjectId: { $exists: false } },
        { branchId: { $exists: false } },
        { year: { $exists: false } },
      ],
    });
    if (r.deletedCount) {
      console.log(
        `Removed ${r.deletedCount} legacy attendance row(s). Re-mark attendance per subject in the app.`
      );
    }
  } catch (e) {
    console.warn('Attendance purge:', e.message);
  }
}

async function migrateStudentsToBranches() {
  try {
    const coll = mongoose.connection.db.collection('students');
    const colleges = await College.find().lean();
    for (const college of colleges) {
      const docs = await coll.find({ collegeId: college._id }).toArray();
      for (const raw of docs) {
        if (raw.branchId) continue;
        const courseName = (raw.course && String(raw.course).trim()) || 'General';
        const re = new RegExp(`^${escapeRegex(courseName)}$`, 'i');
        let branch = await Branch.findOne({ collegeId: college._id, name: re });
        if (!branch) {
          branch = await Branch.create({ name: courseName, collegeId: college._id });
          console.log(`Created branch "${courseName}" for ${college.name}`);
        }
        await coll.updateOne(
          { _id: raw._id },
          { $set: { branchId: branch._id }, $unset: { course: '' } }
        );
      }
    }
    console.log('Student branch migration finished (course → branch where needed).');
  } catch (e) {
    console.warn('Branch migration:', e.message);
  }
}

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    await migrateStudentEmails();
    await migrateStudentsToBranches();
    await purgeLegacyAttendance();

    let college = await College.findOne({ name: 'Demo College' });
    if (!college) {
      college = await College.create({
        name: 'Demo College',
        email: 'admin@democollege.com',
      });
      console.log('Created college:', college.name);
    } else {
      console.log('College already exists:', college.name);
    }

    let admin = await User.findOne({ email: 'admin@demo.com', collegeId: college._id });
    if (!admin) {
      admin = await User.create({
        name: 'Admin User',
        email: 'admin@demo.com',
        password: 'Admin@Coll3ge#2026',
        role: 'admin',
        collegeId: college._id,
      });
      console.log('Created admin user:', admin.email);
    } else {
      admin.password = 'Admin@Coll3ge#2026';
      await admin.save();
      console.log('Admin password updated:', admin.email);
    }

    console.log('\n--- Seed Complete ---');
    console.log('Login with:');
    console.log('  1) admin@demo.com / Admin@Coll3ge#2026');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
