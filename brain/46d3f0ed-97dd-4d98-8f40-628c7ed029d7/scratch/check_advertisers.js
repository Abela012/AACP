
const mongoose = require('mongoose');

const MONGO_URI = "mongodb+srv://wyaikob_db_user:UhDvzE6XK1RFVDCE@cluster1.a63ki5r.mongodb.net/?appName=Cluster1";

async function checkUsers() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to DB");

        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
        const users = await User.find({ role: 'advertiser' });
        
        console.log("Found", users.length, "advertisers");
        users.forEach(u => {
            console.log(`ID: ${u._id}, Username: ${u.username}, Status: ${u.status}, FirstName: ${u.firstName}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkUsers();
