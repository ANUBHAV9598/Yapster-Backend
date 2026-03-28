import mongoose from "mongoose";
declare const _default: mongoose.Model<{
    username: string;
    role: "admin" | "user";
    email?: string | null;
    password?: string | null;
} & mongoose.DefaultTimestampProps, {}, {}, {
    id: string;
}, mongoose.Document<unknown, {}, {
    username: string;
    role: "admin" | "user";
    email?: string | null;
    password?: string | null;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, {
    timestamps: true;
}> & Omit<{
    username: string;
    role: "admin" | "user";
    email?: string | null;
    password?: string | null;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    username: string;
    role: "admin" | "user";
    email?: string | null;
    password?: string | null;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, {
    username: string;
    role: "admin" | "user";
    email?: string | null;
    password?: string | null;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, Omit<mongoose.DefaultSchemaOptions, "timestamps"> & {
    timestamps: true;
}> & Omit<{
    username: string;
    role: "admin" | "user";
    email?: string | null;
    password?: string | null;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, unknown, {
    username: string;
    role: "admin" | "user";
    email?: string | null;
    password?: string | null;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {
    username: string;
    role: "admin" | "user";
    email?: string | null;
    password?: string | null;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
export default _default;
//# sourceMappingURL=user.model.d.ts.map