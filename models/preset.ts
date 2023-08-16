import mongoose, { Model } from 'mongoose'
import { Preset as PresetType } from '@/types/model/preset'
const Schema = mongoose.Schema

const PresetSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        require: true,
    },
    avatar: {
        type: String,
        require: true,
    },
    prompt: {
        type: String,
        require: true,
    },
    temperature: {
        type: Number,
        require: true,
    },
})

const Preset: Model<PresetType> = mongoose.models.Preset || mongoose.model('Preset', PresetSchema)

export default Preset
