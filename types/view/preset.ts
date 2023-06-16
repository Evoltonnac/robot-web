import * as PresetModel from '../model/preset'
import { withId } from './common'

export type Preset = withId<PresetModel.Preset>

export type PresetListItem = withId<Omit<PresetModel.Preset, 'prompt'>>
