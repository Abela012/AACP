import { connectDB, disConnect } from './src/config/database';
import Wallet from './src/database/models/Wallet';
import User from './src/database/models/User';
import mongoose from 'mongoose';

async function checkWallet() {
    await connectDB();
    const userId = '69e0aee13262da0cbf50b033';
    const user = await User.findById(userId);
    console.log('User found:', user?.firstName, user?.lastName, user?.clerkId);
    
    const wallet = await Wallet.findOne({ user: userId });
    console.log('Wallet coins:', wallet?.totalCoins, 'locked:', wallet?.lockedCoins);
    await disConnect();
}

checkWallet().catch(console.error);
