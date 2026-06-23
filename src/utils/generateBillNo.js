import { StorageService } from '../services/storageService'

export default function generateBillNo(){
  const sales = StorageService.getSales()
  if(!sales || sales.length===0) return 'BS1001'
  const last = sales[sales.length-1].billNumber || 'BS1000'
  const n = parseInt(last.replace(/[^0-9]/g,''),10)
  return `BS${n+1}`
}
