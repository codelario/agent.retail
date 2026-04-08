export interface ISlot {
  id: string
  location_id: string
  provider: string
  date: string      // ISO (YYYY-MM-DD)
  time: string
  available: boolean
}
