import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'
import Header from './components/Header'
import Product from './components/Product'
import Footer from './components/Footer'
import UserForm from './components/UserForm'

function App() {
  
  

  return (
    <>
      <Header />
      <hr />
      <Product />
      <hr />
      <UserForm />
      <hr />
      <Footer />
    </>
  )
}

export default App
