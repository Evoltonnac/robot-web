export interface ErrorData {
    errno: string
    errmsg: string
}

export interface CommonResponse<T> extends ErrorData {
    data: T
}
