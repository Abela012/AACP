import mongoose, { Schema, Document } from 'mongoose';

export interface IDispute extends Document {
  id: string; // Custom readable ID like DISP-1234
  title: string;
  description: string;
  reporter: mongoose.Types.ObjectId;
  against: mongoose.Types.ObjectId; // User or Entity being reported
  category: 'payment' | 'campaign' | 'collaboration' | 'account' | 'other';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'OPEN' | 'UNDER REVIEW' | 'RESOLVED' | 'ESCALATED';
  evidence: string[]; // URLs to screenshots/documents
  messages: {
    sender: mongoose.Types.ObjectId;
    text: string;
    createdAt: Date;
  }[];
  resolution?: {
    resolvedBy: mongoose.Types.ObjectId;
    reason: string;
    resolvedAt: Date;
  };
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
}

const DisputeSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    reporter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    against: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: { 
      type: String, 
      enum: ['payment', 'campaign', 'collaboration', 'account', 'other'], 
      default: 'other' 
    },
    priority: { 
      type: String, 
      enum: ['LOW', 'MEDIUM', 'HIGH'], 
      default: 'MEDIUM' 
    },
    status: { 
      type: String, 
      enum: ['OPEN', 'UNDER REVIEW', 'RESOLVED', 'ESCALATED'], 
      default: 'OPEN' 
    },
    evidence: [{ type: String }],
    messages: [
      {
        sender: { type: Schema.Types.ObjectId, ref: 'User' },
        text: { type: String },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    resolution: {
      resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      reason: { type: String },
      resolvedAt: { type: Date }
    },
    metadata: { type: Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

// Auto-generate DISP-XXXX ID before saving
DisputeSchema.pre('validate', async function(next) {
  if (this.isNew && !this.id) {
    const count = await mongoose.model('Dispute').countDocuments();
    this.id = `DISP-${1000 + count + 1}`;
  }
  next();
});

export default mongoose.model<IDispute>('Dispute', DisputeSchema);
