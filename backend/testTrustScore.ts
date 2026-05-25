import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Adjust path to env file if needed
dotenv.config({ path: path.join(__dirname, '.env') });

import { calculateTrustScore } from './src/services/admin/adminAnalytics.service';
import User from './src/database/models/User';

async function test() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/aacp';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Find any user to test
    const user = await User.findOne();
    if (!user) {
      console.log('No users found in database');
      process.exit(0);
    }

    console.log(`Testing trust score for user: ${user._id} (${user.email})`);
    
    const score = await calculateTrustScore(user._id.toString());
    console.log('Trust score calculated successfully:', score);
  } catch (error: any) {
    console.error('Error occurred during test:');
    console.error(error);
    if (error.stack) {
        console.error(error.stack);
    }
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

test();
