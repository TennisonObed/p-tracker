import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProject extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  status: "todo" | "in-progress" | "completed";
  user: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema: Schema<IProject> = new Schema(
  {
    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["todo", "in-progress", "completed"],
      default: "todo",
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User association is required"],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent re-creating the model during Next.js hot module reloads
export const Project: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);
