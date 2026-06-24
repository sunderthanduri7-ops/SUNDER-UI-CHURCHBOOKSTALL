export function generateUpiLink(amount){
  const pa = 'sundharthanduri7-1@okicici'
  const pn = encodeURIComponent('ChurchBookStall')
  const am = Number(amount).toFixed(2)
  return `upi://pay?pa=${pa}&pn=${pn}&am=${am}&cu=INR`
}
