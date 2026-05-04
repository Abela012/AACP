
const mongoose = require('mongoose');

const MONGO_URI = "mongodb+srv://wyaikob_db_user:UhDvzE6XK1RFVDCE@cluster1.a63ki5r.mongodb.net/?appName=Cluster1";

async function checkData() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to DB");

        const Opportunity = mongoose.model('Opportunity', new mongoose.Schema({}, { strict: false }));
        const opportunities = await Opportunity.find().limit(5);
        
        console.log("Found", opportunities.length, "opportunities");
        opportunities.forEach(o => {
            console.log("ID:", o._id);
            console.log("Title:", o.title);
            console.log("BusinessOwner:", o.businessOwner);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkData();
