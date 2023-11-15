import { User as UserType } from '@/types/model/user'
import _ from 'lodash'
import mongoose, { Model } from 'mongoose'
const Schema = mongoose.Schema

const ConfigSchema = new Schema(
    {
        serpEnabled: {
            type: Boolean,
            default: false,
            get: _.toNumber,
            set: (v: unknown) => !!v,
        },
        temperature: {
            type: Number,
            default: 0.7,
        },
        activePlugins: {
            type: Array,
            default: [],
        },
    },
    {
        id: false,
        toObject: { getters: true },
        toJSON: { getters: true },
    }
)

const UserSchema = new Schema(
    {
        username: {
            type: String,
            require: true,
        },
        password: {
            type: String,
            require: true,
        },
        config: {
            type: ConfigSchema,
            default: {
                serpEnabled: false,
            },
            require: false,
        },
        usage: {
            type: Map,
            of: Number,
        },
    },
    {
        id: false,
        toObject: { getters: true },
        toJSON: { getters: true },
    }
)

const User: Model<UserType> = mongoose.models.User || mongoose.model('User', UserSchema)

export default User
