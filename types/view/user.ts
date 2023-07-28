import * as UserModal from '../model/user'

export type User = Omit<UserModal.User, 'password'>
