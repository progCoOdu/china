import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nldbiaofjbsyusscxrol.supabase.co'
const supabaseKey = 'sb_publishable_P3LQtdX6VmTY6I1b_XVN_w_eaqHO0Je'

export const supabase = createClient(supabaseUrl, supabaseKey)
