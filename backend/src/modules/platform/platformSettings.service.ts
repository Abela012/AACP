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
        });
    }
    return doc;
};

export const updatePlatformSettings = async (patch: {
    maintenanceMode?: boolean;
    supportContactEmail?: string;
}) => {
    const set: Record<string, unknown> = {};
    if (typeof patch.maintenanceMode === 'boolean') set.maintenanceMode = patch.maintenanceMode;
    if (typeof patch.supportContactEmail === 'string') set.supportContactEmail = patch.supportContactEmail.trim();

    const doc = await PlatformSettings.findOneAndUpdate(
        { key: SINGLETON_KEY },
        {
            $set: set,
            $setOnInsert: { key: SINGLETON_KEY, maintenanceMode: false, supportContactEmail: '' },
        },
        { new: true, upsert: true }
    );
    return doc;
};

export const isDatabaseConnected = () => mongoose.connection.readyState === 1;
