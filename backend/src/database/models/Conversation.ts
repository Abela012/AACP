import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IConversation extends Document {
    participants: mongoose.Types.ObjectId[];
    lastMessage?: mongoose.Types.ObjectId;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

const conversationSchema: Schema<IConversation> = new Schema(
    {
        participants: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
        ],
        lastMessage: {
            type: Schema.Types.ObjectId,
            ref: 'Message',
        },
        metadata: {
            type: Schema.Types.Mixed,
            default: {},
        },
    },
    { timestamps: true }
);

// Index for finding conversations by participants
conversationSchema.index({ participants: 1 });

const Conversation: Model<IConversation> = mongoose.model<IConversation>('Conversation', conversationSchema);
export default Conversation;
