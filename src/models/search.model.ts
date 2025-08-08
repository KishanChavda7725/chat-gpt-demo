import mongoose, { Schema, Document } from 'mongoose';

export interface ISearch extends Document {
  prompt: string;
  images: string[];
  result: string;
  resImages:string[];
  createdAt: Date;
}

const SearchSchema: Schema = new Schema<ISearch>(
  {
    prompt: { type: String, required: true },
    images: [{ type: String }], // Store image paths
    result: { type: String },
    resImages:[{ type: String }],
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const Search = mongoose.model<ISearch>('Search', SearchSchema);
