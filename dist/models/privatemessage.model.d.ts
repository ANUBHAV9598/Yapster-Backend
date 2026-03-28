import mongoose from "mongoose";
declare const _default: mongoose.Model<{
    isGroup: boolean;
    members: mongoose.Types.ObjectId[];
    admins: mongoose.Types.ObjectId[];
    title?: string | null;
} & mongoose.DefaultTimestampProps, {}, {}, {
    id: string;
}, mongoose.Document<unknown, {}, {
    isGroup: boolean;
    members: mongoose.Types.ObjectId[];
    admins: mongoose.Types.ObjectId[];
    title?: string | null;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, {
    timestamps: true;
}> & Omit<{
    isGroup: boolean;
    members: mongoose.Types.ObjectId[];
    admins: mongoose.Types.ObjectId[];
    title?: string | null;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    isGroup: boolean;
    members: mongoose.Types.ObjectId[];
    admins: mongoose.Types.ObjectId[];
    title?: string | null;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, {
    isGroup: boolean;
    members: mongoose.Types.ObjectId[];
    admins: mongoose.Types.ObjectId[];
    title?: string | null;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, Omit<mongoose.DefaultSchemaOptions, "timestamps"> & {
    timestamps: true;
}> & Omit<{
    isGroup: boolean;
    members: mongoose.Types.ObjectId[];
    admins: mongoose.Types.ObjectId[];
    title?: string | null;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, unknown, {
    isGroup: boolean;
    members: mongoose.Types.ObjectId[];
    admins: mongoose.Types.ObjectId[];
    title?: string | null;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {
    isGroup: boolean;
    members: mongoose.Types.ObjectId[];
    admins: mongoose.Types.ObjectId[];
    title?: string | null;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
export default _default;
//# sourceMappingURL=privatemessage.model.d.ts.map