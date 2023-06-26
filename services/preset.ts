import Preset from '@/models/preset'
import { Preset as PresetType } from '@/types/model/preset'
import { Types } from 'mongoose'
import Boom from '@hapi/boom'
import { ErrorData } from '@/types/server/common'
import { tryOrBoom } from './middlewares/customRouter'

const getPresetById = tryOrBoom(
    async (presetId: string) => {
        const preset = await Preset.findById(presetId)
        if (!preset) {
            throw Boom.notFound<ErrorData>('', {
                errno: 'A0502',
                errmsg: '预设不存在',
            })
        }
        return preset
    },
    {
        errno: 'B0501',
        errmsg: '获取预设失败',
    }
)

// add new preset belong to current user
const addPreset = tryOrBoom(
    async (userId: Types.ObjectId, preset: Omit<PresetType, 'user'>) => {
        const newPreset = new Preset({
            user: userId,
            ...preset,
        })
        newPreset.save()
        return newPreset
    },
    {
        errno: 'B0502',
        errmsg: '添加预设失败',
    }
)

// delete preset
const deletePresetById = tryOrBoom(
    async (userId: Types.ObjectId, presetId: string) => {
        await Preset.findOneAndDelete({ user: userId, _id: presetId })
        return
    },
    {
        errno: 'B0503',
        errmsg: '删除聊天失败',
    }
)

// update preset
const updatePresetById = tryOrBoom(
    async (userId: Types.ObjectId, presetId: string, preset: Omit<PresetType, 'user'>) => {
        const targetPreset = await Preset.findOneAndUpdate({ user: userId, _id: presetId }, { $set: preset })
        if (!targetPreset) {
            throw Boom.notFound<ErrorData>('', {
                errno: 'A0503',
                errmsg: '预设不存在',
            })
        }
        return targetPreset
    },
    {
        errno: 'B0503',
        errmsg: '删除聊天失败',
    }
)

// get preset list of a user
const getPresetList = tryOrBoom(
    async (userId: Types.ObjectId) => {
        const presets = await Preset.find({
            user: userId,
        })
        return presets
    },
    {
        errno: 'B0504',
        errmsg: '获取预设列表失败',
    }
)

export { getPresetById, addPreset, deletePresetById, updatePresetById, getPresetList }
