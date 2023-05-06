export type FCProps = {
    children?: React.ReactNode
}

export type withId<T> = T & {
    _id: string
}
