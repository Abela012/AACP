import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMessage extends Document {
    conversation: mongoose.Types.ObjectId;
    sender: mongoose.Types.ObjectId;
    text: string;
    attachments: Array<{
        fileName: string;
        fileUrl: string;
        fileType: string;
    }>;
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const messageSchema: Schema<IMessage> = new Schema(
    {
        conversation: {
            type: Schema.Types.ObjectId,
            ref: 'Conversation',
            required: true,
        },
        sender: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        text: {
            type: String,
            required: [true, 'Message text is required'],
            trim: true,
        },
        attachments: [
            {
                fileName: String,
                fileUrl: String,
                fileType: String,
            },
        ],
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

// Index for fetching messages in a conversation
messageSchema.index({ conversation: 1, createdAt: 1 });

const Message: Model<IMessage> = mongoose.model<IMessage>('Message', messageSchema);
export default Message;
