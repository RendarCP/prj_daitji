import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ItemDetailClient } from './ItemDetailClient'

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  
  try {
    const supabase = await createClient()
    const { data: item } = await supabase
      .from('items')
      .select('name')
      .eq('id', id)
      .single()

    return {
      title: item ? `${item.name} - 물품 상세` : '물품 상세',
      description: '물품의 상세 정보를 확인하고 수정할 수 있습니다',
    }
  } catch (error) {
    return {
      title: '물품 상세',
      description: '물품의 상세 정보를 확인하고 수정할 수 있습니다',
    }
  }
}

export default async function ItemDetailPage({ params }: Props) {
  const { id } = await params
  
  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(id)) {
    notFound()
  }

  const supabase = await createClient()
  
  // Fetch item with location
  const { data: item, error: itemError } = await supabase
    .from('items')
    .select(`
      *,
      location:locations(*)
    `)
    .eq('id', id)
    .single()

  if (itemError || !item) {
    notFound()
  }

  // Fetch location path
  const { data: pathData } = await supabase
    .from('locations')
    .select('id, name, icon, parent_id')
    .eq('id', item.location_id)
    .single()

  let locationPath: Array<{ id: string; name: string; icon?: string | null }> = []
  
  if (pathData) {
    // Build path by traversing up
    let currentId: string | null = pathData.id
    const path: Array<{ id: string; name: string; icon?: string | null }> = []
    
    while (currentId) {
      const { data: loc } = await supabase
        .from('locations')
        .select('id, name, icon, parent_id')
        .eq('id', currentId)
        .single()
      
      if (!loc) break
      
      path.unshift({ id: loc.id, name: loc.name, icon: loc.icon })
      currentId = loc.parent_id
    }
    
    locationPath = path
  }

  // Fetch all locations for edit form
  const { data: locations } = await supabase
    .from('locations')
    .select('id, name, level, parent_id, icon')
    .order('level', { ascending: true })
    .order('sort_order', { ascending: true })

  return (
    <ItemDetailClient 
      item={item} 
      locationPath={locationPath}
      allLocations={locations || []}
    />
  )
}
