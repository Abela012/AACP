const mongoose = require('mongoose');
const MONGO_URI = 'mongodb+srv://wyaikob_db_user:UhDvzE6XK1RFVDCE@cluster1.a63ki5r.mongodb.net/?appName=Cluster1';

async function listUsers() {
    try {
        await mongoose.connect(MONGO_URI);
        const UserSchema = new mongoose.Schema({}, { strict: false });
        const User = mongoose.model('User', UserSchema);
        
        const users = await User.find({});
        console.log('All users:');
        users.forEach(u => console.log(`- ${u.email} (${u.role}) [clerkId: ${u.clerkId}]`));
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

listUsers();
