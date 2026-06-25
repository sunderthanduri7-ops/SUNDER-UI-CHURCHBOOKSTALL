export function generateUpiLink(amount){
  const pa = 'subodhrethan-1@oksbi'
  const pn = encodeURIComponent('ChurchBookStall')
  const am = Number(amount).toFixed(2)
  return `upi://pay?pa=${pa}&pn=${pn}&am=${am}&cu=INR`
}
