export interface User {
    username: string
    password: string
    config?: UserConfig
}

export interface UserConfig {
    serpEnabled: 0 | 1
}
