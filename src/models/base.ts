export type BaseModel = {
    id: number
    create_at: Date | string
    delete_at?: Date | string
    update_at?: Date | string
}