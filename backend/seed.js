require('dotenv').config();
const mongoose = require('mongoose');
const College = require('./models/College');
const User = require('./models/User');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

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
