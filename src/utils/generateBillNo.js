import { StorageService } from '../services/storageService'

export default function generateBillNo(mobile){
  // If mobile provided, use a mobile+timestamp based id to avoid cross-client duplicates
  try{
    if(mobile){
      const digits = (''+mobile).replace(/\D/g,'')
      if(digits){
        // keep full mobile digits and add small timestamp suffix for uniqueness
        const time = Date.now().toString().slice(-4)
        return `BS${digits}${time}`
      }
    }
  }catch(e){/* fallthrough */}

  // Fallback: preserve existing incremental behaviour with small timestamp suffix
  const sales = StorageService.getSales()
  if(!sales || sales.length===0) return 'BS1001'
  const last = sales[sales.length-1].billNumber || 'BS1000'
  const n = parseInt((last.match(/\d+/)||['1000'])[0].replace(/[^0-9]/g,''),10)
  const suffix = Date.now().toString().slice(-4)
  return `BS${n+1}${suffix}`
}
