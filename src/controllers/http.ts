export type ResponsData<T> = {
    data: T
    message: string
    error: Error | null
    status: number
}