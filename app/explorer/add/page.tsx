import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { AddLocationClient } from '../AddLocationClient'
import { FormPageLayout } from '@/components/layout/FormPageLayout'

export const metadata: Metadata = {
  title: '위치 추가 - DAITJI',
  description: '새 위치를 만들어 보관함을 정리하세요',
}

export default async function AddLocationPage() {
  const supabase = await createClient()

  const { data: locations } = await supabase
    .from('locations')
    .select('id, name, level, parent_id, icon, color, description')
    .order('level', { ascending: true })
    .order('sort_order', { ascending: true })

  return (
    <FormPageLayout title="위치 추가">
      <AddLocationClient locations={locations || []} mode="page" />
    </FormPageLayout>
  )
}
