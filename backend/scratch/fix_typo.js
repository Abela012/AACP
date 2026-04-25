const mongoose = require('mongoose');
const MONGO_URI = 'mongodb+srv://wyaikob_db_user:UhDvzE6XK1RFVDCE@cluster1.a63ki5r.mongodb.net/?appName=Cluster1';

async function fixTypo() {
    try {
        await mongoose.connect(MONGO_URI);
        const UserSchema = new mongoose.Schema({}, { strict: false });
        const User = mongoose.model('User', UserSchema);
        
        const result = await User.updateMany({ role: 'amdin' }, { role: 'admin' });
        console.log(`Updated ${result.modifiedCount} users from 'amdin' to 'admin'.`);
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fixTypo();
