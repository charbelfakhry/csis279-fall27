import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'
import Header from './components/Header'
import Product from './components/Product'
import Footer from './components/Footer'
import UserForm from './components/UserForm'
import Student from './components/Student'
import UsersTable from './components/UsersTable'

function App() {

  const students = [
    {
      name: "studnet 1",
      age: 24,
      major: "CS"
    },
    {
      name: "studnet 1",
      age: 24,
      major: "CS"
    },
    {
      name: "studnet 1",
      age: 24,
      major: "CS"
    },
    {
      name: "studnet 1",
      age: 24,
      major: "CS"
    },
  ]
  
  

  return (
    <>
      <UsersTable />
    </>
  )
}

export default App
