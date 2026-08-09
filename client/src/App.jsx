import React from 'react'
import Home from './pages/Home'
import Auth from './pages/Auth'
import { Route, Routes } from 'react-router-dom'
import './App.css'
import { use } from 'react'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setUserData } from './redux/userSlice.js'
import axios from 'axios'
import InterviewPage from './pages/InterviewPage.jsx'

// serverURL 
export const ServerUrl = "http://localhost:8000"

const App = () => {

  // useDispatch to set data in store
  const dispatch = useDispatch()

  useEffect(() => {
    // getCurrent User from server api 
    const getCurrentUser = async () => {
      try {
        const result = await axios.get(ServerUrl + "/api/user/current-user", { withCredentials: true })
        // console.log(result.data)
        dispatch(setUserData(result.data))

      }
      catch (err) {
        console.log(err)
        dispatch(setUserData(null))
      }
    }

    getCurrentUser()
  })

  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/auth' element={<Auth />} />
      <Route path = '/interview' element={<InterviewPage />} />
    </Routes>
  )
}

export default App
