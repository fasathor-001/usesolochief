import { getCommitments } from '@/lib/actions/commitments'
import { CommitmentsClient } from '@/components/commitments/commitments-client'

export default async function CommitmentsPage() {
  const { data: commitments, error } = await getCommitments()

  if (error) {
    return (
      <div className="p-6">
        <p className="text-sm text-[var(--sc-error)]">
          Failed to load commitments: {error}
        </p>
      </div>
    )
  }

  return <CommitmentsClient commitments={commitments ?? []} />
}
