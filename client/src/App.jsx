import React from 'react'
import Home from './pages/Home'
import Auth from './pages/Auth'
import { Route, Routes } from 'react-router-dom'
import './App.css'

  // serverURL 
export const ServerUrl = "http://localhost:8000"

const App = () => {

  return (
   <Routes>
      <Route path = '/' element = {<Home />} />
      <Route path = '/auth' element = {<Auth />} />
   </Routes>
  )
}

export default App
