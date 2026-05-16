const mongoose = require('mongoose');

const uri = "mongodb+srv://wyaikob_db_user:UhDvzE6XK1RFVDCE@cluster1.a63ki5r.mongodb.net/aacp?appName=Cluster1";

async function checkUser() {
    try {
        await mongoose.connect(uri);
        console.log("Connected to MongoDB");
        
        const User = mongoose.model('User', new mongoose.Schema({
            email: String,
            profileData: Object,
            pendingProfileData: Object,
            status: String
        }), 'users');

        const emails = ['birhanudaniel724@gmail.com', 'youtubedan8@gmail.com'];
        for (const email of emails) {
            const user = await User.findOne({ email }).lean();
            if (user) {
                console.log(`\nUser Found: ${email}`);
                console.log(`Status: ${user.status}`);
                console.log(`ProfileData: ${JSON.stringify(user.profileData, null, 2)}`);
                console.log(`PendingProfileData: ${JSON.stringify(user.pendingProfileData, null, 2)}`);
            } else {
                console.log(`\nUser Not Found: ${email}`);
            }
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

checkUser();
