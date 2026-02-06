import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { ItemAddClient } from './ItemAddClient'

export const metadata: Metadata = {
  title: '물품 추가 - DAITJI',
  description: '새로운 물품을 등록하세요',
}

export default async function ItemAddPage() {
  const supabase = await createClient()
  
  // Fetch all locations for the dropdown
  const { data: locations } = await supabase
    .from('locations')
    .select('id, name, level, parent_id, icon')
    .order('level', { ascending: true })
    .order('sort_order', { ascending: true })

  return <ItemAddClient locations={locations || []} />
}
