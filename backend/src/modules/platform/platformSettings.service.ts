import mongoose from 'mongoose';
import PlatformSettings from '../../database/models/PlatformSettings';

const SINGLETON_KEY = 'singleton';

export const getPlatformSettings = async () => {
    let doc = await PlatformSettings.findOne({ key: SINGLETON_KEY });
    if (!doc) {
        doc = await PlatformSettings.create({
            key: SINGLETON_KEY,
            maintenanceMode: false,
            supportContactEmail: '',
            allowPublicSignup: true,
            newUserStartingCoins: 1000,
        });
    }
    return doc;
};

export const updatePlatformSettings = async (patch: {
    maintenanceMode?: boolean;
    supportContactEmail?: string;
    allowPublicSignup?: boolean;
    newUserStartingCoins?: number;
}) => {
    const set: Record<string, unknown> = {};
    if (typeof patch.maintenanceMode === 'boolean') set.maintenanceMode = patch.maintenanceMode;
    if (typeof patch.supportContactEmail === 'string') set.supportContactEmail = patch.supportContactEmail.trim();
    if (typeof patch.allowPublicSignup === 'boolean') set.allowPublicSignup = patch.allowPublicSignup;
    if (typeof patch.newUserStartingCoins === 'number') set.newUserStartingCoins = patch.newUserStartingCoins;

    const doc = await PlatformSettings.findOneAndUpdate(
        { key: SINGLETON_KEY },
        {
            $set: set,
            $setOnInsert: {
                key: SINGLETON_KEY,
                maintenanceMode: false,
                supportContactEmail: '',
                allowPublicSignup: true,
                newUserStartingCoins: 1000,
            },
        },
        { new: true, upsert: true }
    );
    return doc;
};

export const isDatabaseConnected = () => mongoose.connection.readyState === 1;
