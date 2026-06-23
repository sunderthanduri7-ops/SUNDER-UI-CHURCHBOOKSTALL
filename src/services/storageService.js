const BOOKS_KEY = 'books'
const COFFEES_KEY = 'coffees'
const USER_ROLE_KEY = 'userRole'
const SALES_KEY = 'sales'
const CART_KEY = 'cart'

const DEFAULT_BOOKS = [
  { id: 1, name: 'Knowing God', price: 250, category: 'Theology' },
  { id: 2, name: "Pilgrim's Progress", price: 180, category: 'Devotional' },
  { id: 3, name: 'Institutes of the Christian Religion', price: 750, category: 'Theology' },
  { id: 4, name: 'The Holiness of God', price: 350, category: 'Spirituality' },
  { id: 5, name: 'Desiring God', price: 300, category: 'Spirituality' }
]

const DEFAULT_COFFEES = [
  { id: 1, name: 'Espresso', price: 50, size: 'Single' },
  { id: 2, name: 'Americano', price: 70, size: 'Regular' },
  { id: 3, name: 'Cappuccino', price: 90, size: 'Regular' },
  { id: 4, name: 'Latte', price: 100, size: 'Regular' }
]

export const StorageService = {
  initDefaults(){
    const b = localStorage.getItem(BOOKS_KEY)
    if(!b){
      localStorage.setItem(BOOKS_KEY, JSON.stringify(DEFAULT_BOOKS))
    }
    const c = localStorage.getItem(COFFEES_KEY)
    if(!c){
      localStorage.setItem(COFFEES_KEY, JSON.stringify(DEFAULT_COFFEES))
    }
    if(!localStorage.getItem(USER_ROLE_KEY)){
      localStorage.setItem(USER_ROLE_KEY, JSON.stringify('customer'))
    }
    if(!localStorage.getItem(SALES_KEY)){
      localStorage.setItem(SALES_KEY, JSON.stringify([]))
    }
    if(!localStorage.getItem(CART_KEY)){
      localStorage.setItem(CART_KEY, JSON.stringify([]))
    }
  },
  getBooks(){
    return JSON.parse(localStorage.getItem(BOOKS_KEY) || '[]')
  },
  saveBooks(books){
    localStorage.setItem(BOOKS_KEY, JSON.stringify(books))
  },
  getCoffees(){
    return JSON.parse(localStorage.getItem(COFFEES_KEY) || '[]')
  },
  saveCoffees(coffees){
    localStorage.setItem(COFFEES_KEY, JSON.stringify(coffees))
  },
  getUserRole(){
    return JSON.parse(localStorage.getItem(USER_ROLE_KEY) || '"customer"')
  },
  setUserRole(role){
    localStorage.setItem(USER_ROLE_KEY, JSON.stringify(role))
  },
  getSales(){
    return JSON.parse(localStorage.getItem(SALES_KEY) || '[]')
  },
  saveSales(sales){
    localStorage.setItem(SALES_KEY, JSON.stringify(sales))
  }
  ,
  getCart(){
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]')
  },
  saveCart(cart){
    localStorage.setItem(CART_KEY, JSON.stringify(cart))
  },
  clearCart(){
    localStorage.setItem(CART_KEY, JSON.stringify([]))
  }
}
