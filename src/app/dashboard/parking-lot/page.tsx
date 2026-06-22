import { getParkingLotItems } from '@/lib/actions/parking-lot'
import { ParkingLotClient } from '@/components/parking-lot/parking-lot-client'

export default async function ParkingLotPage() {
  const { data: items, error } = await getParkingLotItems()

  if (error) {
    return (
      <div className="p-6">
        <p className="text-sm" style={{ color: '#EF4444' }}>Failed to load parking lot: {error}</p>
      </div>
    )
  }

  return <ParkingLotClient initialItems={items ?? []} />
}
