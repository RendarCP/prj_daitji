import { Metadata } from 'next'
import { AddLocationClient } from '../AddLocationClient'
import { FormPageLayout } from '@/components/layout/FormPageLayout'
import { getCurrentUserLocationsForSelection } from '@/lib/supabase/locations'

export const metadata: Metadata = {
  title: '위치 추가 - DAITJI',
  description: '새 위치를 만들어 보관함을 정리하세요',
}

export default async function AddLocationPage() {
  const locations = await getCurrentUserLocationsForSelection()

  return (
    <FormPageLayout title="위치 추가">
      <AddLocationClient locations={locations} mode="page" />
    </FormPageLayout>
  )
}
