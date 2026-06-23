export function showToast(message, type='success', timeout=3000){
  const containerId = 'app-toast-container'
  let container = document.getElementById(containerId)
  if(!container){
    container = document.createElement('div')
    container.id = containerId
    container.className = 'toast-container'
    document.body.appendChild(container)
  }
  const toast = document.createElement('div')
  toast.className = `toast align-items-center text-bg-${type} border-0 show`
  toast.role = 'alert'
  toast.ariaLive = 'assertive'
  toast.ariaAtomic = 'true'
  toast.innerHTML = `<div class="d-flex"><div class="toast-body">${message}</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div>`
  container.appendChild(toast)
  setTimeout(()=>{
    toast.classList.remove('show')
    try{ container.removeChild(toast) }catch(e){}
  }, timeout)
}
