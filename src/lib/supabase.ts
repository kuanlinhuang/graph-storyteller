import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Network counter functions
export const getNetworkCounter = async () => {
  try {
    const { data, error } = await supabase
      .from('network_counter')
      .select('count')
      .eq('id', 'global')
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('Error fetching counter:', error)
      return 0
    }
    
    return data?.count || 0
  } catch (error) {
    console.error('Error in getNetworkCounter:', error)
    return 0
  }
}

export const incrementNetworkCounter = async () => {
  try {
    const { data, error } = await supabase.rpc('increment_network_counter')
    
    if (error) {
      console.error('Error incrementing counter:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error in incrementNetworkCounter:', error)
    return false
  }
}