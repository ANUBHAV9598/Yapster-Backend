import mongoose from "mongoose";
declare const _default: mongoose.Model<{
    text: string;
    chatId: mongoose.Types.ObjectId;
    senderId: mongoose.Types.ObjectId;
    status: "read" | "sent" | "delivered";
    readAt?: NativeDate | null;
} & mongoose.DefaultTimestampProps, {}, {}, {
    id: string;
}, mongoose.Document<unknown, {}, {
    text: string;
    chatId: mongoose.Types.ObjectId;
    senderId: mongoose.Types.ObjectId;
    status: "read" | "sent" | "delivered";
    readAt?: NativeDate | null;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, {
    timestamps: true;
}> & Omit<{
    text: string;
    chatId: mongoose.Types.ObjectId;
    senderId: mongoose.Types.ObjectId;
    status: "read" | "sent" | "delivered";
    readAt?: NativeDate | null;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    text: string;
    chatId: mongoose.Types.ObjectId;
    senderId: mongoose.Types.ObjectId;
    status: "read" | "sent" | "delivered";
    readAt?: NativeDate | null;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, {
    text: string;
    chatId: mongoose.Types.ObjectId;
    senderId: mongoose.Types.ObjectId;
    status: "read" | "sent" | "delivered";
    readAt?: NativeDate | null;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, Omit<mongoose.DefaultSchemaOptions, "timestamps"> & {
    timestamps: true;
}> & Omit<{
    text: string;
    chatId: mongoose.Types.ObjectId;
    senderId: mongoose.Types.ObjectId;
    status: "read" | "sent" | "delivered";
    readAt?: NativeDate | null;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, unknown, {
    text: string;
    chatId: mongoose.Types.ObjectId;
    senderId: mongoose.Types.ObjectId;
    status: "read" | "sent" | "delivered";
    readAt?: NativeDate | null;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {
    text: string;
    chatId: mongoose.Types.ObjectId;
    senderId: mongoose.Types.ObjectId;
    status: "read" | "sent" | "delivered";
    readAt?: NativeDate | null;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
export default _default;
//# sourceMappingURL=message.model.d.ts.map