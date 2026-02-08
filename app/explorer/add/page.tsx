import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { AddLocationClient } from '../AddLocationClient'
import { Header } from '@/components/layout/Header'

export const metadata: Metadata = {
  title: 'Add Location - DAITJI',
  description: 'Create a new location in your inventory',
}

export default async function AddLocationPage() {
  const supabase = await createClient()
  
  // Fetch all locations for the hierarchical dropdown
  const { data: locations } = await supabase
    .from('locations')
    .select('id, name, level, parent_id, icon')
    .order('level', { ascending: true })
    .order('sort_order', { ascending: true })

  return (
    <>
      <Header />
      <AddLocationClient locations={locations || []} />
    </>
  )
}
