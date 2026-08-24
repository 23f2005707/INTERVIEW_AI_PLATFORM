import React from 'react'
import { motion } from 'framer-motion';
import { BsRobot, BsCoin } from "react-icons/bs";
import { FaUserAstronaut } from "react-icons/fa";
import { HiOutlineLogout } from "react-icons/hi";
import { useSelector } from 'react-redux';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {setUserData} from '../redux/userSlice.js';
import axios from 'axios';
import { ServerUrl } from '../App.jsx';
import {AuthModel} from './AuthModel.jsx';


const Navbar = () => {

    // read the data from store 
    const {userData} = useSelector((state) => state.user)

    // SHOW POPUP STATE
    const [showCreditPopup, setShowCreditPopup] = useState(false)
    const [showUserPopup, setShowUserPopup] = useState(false)

    const [showAuth, setShowAuth] = useState(false)

    const navigate = useNavigate()
    const dispatch = useDispatch() 

    // logout function 
    const handleLogout = async () => {
        try{
            await axios.get(ServerUrl + "/api/auth/logout", 
                {withCredentials: true}
            );

            dispatch(setUserData(null)); // logout krne ke baad store me user data null krdo

            setShowUserPopup(false)
            setShowCreditPopup(false)
            
            setShowAuth(false) 

            navigate("/")

            // show the auth model after logout
        }
        catch(err) {
            console.log("Logout error:", err)
        }
    }

    console.log("Navbar userData:", userData)
    console.log("Navbar showAuth:", showAuth)

  return (
    <div className=' bg-white flex justify-center px-4 pt-6'>
    {/* CREATE NAVBAR COMPONENT */}
      <motion.div
      initial = {{opacity:0, y:-40}}
      animate = {{opacity:1, y:0}}
      transition = {{duration: 0.3}}
      className = 'w-full max-w-6xl bg-white rounded-[24px] shadow-sm border border-gray-200 px-8 py-4 flex justify-between items-center relative'>

        {/* ICON */}
        <div className='flex items-center gap-3 cursor-pointer'>
            <div className='bg-[#070B14] text-white p-2 rounded-lg'>
                <BsRobot size = {18}/>
            </div>
            <h1 className='font semi-bold hidden md:block text-lg'>InterviewIQ.AI</h1>
        </div>


        {/* CREDITS POINTS */}
        <div className='flex items-center  gap-6 relative'>
            <div className='relative'>
            {/* CREDITS POPUP ADD */}
                <button 
                onClick = {() => {
                    // if user is not logged in then show auth model
                    if(!userData) {
                        setShowAuth(true)
                        return;
                    }
                    setShowCreditPopup(!showCreditPopup);
                    setShowUserPopup(false)
                    
                }}
                className='flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full text-md hover:bg-gray-200 transition'>
                    <BsCoin size = {20} />
                    {userData?.credits || 0}
                </button>
                
                {/* credits popup */}

                {showCreditPopup && (
                    <div className='absolute right-[-50px] mt-3 w-64 bg-white shadow-xl border border-gray-200 rounded p-5 z-50'>
                    <p className='text-sm text-gray-600 mb-4'>
                        Need more credits to continue interview?</p>
                        <button onClick = {() =>navigate("/pricing")}
                        className='w-full bg-black text-white py-2 rounded-lg text-sm'>
                            Buy more credits
                        </button>
                    </div>
                    
                )}
            </div>

            
            {/* USER FIRST LETTER ICON */}
            <div className='relative'>

                <button
                onClick = {() => {
                    // if user is not logged in then show auth model
                    if(!userData) {
                        setShowAuth(true)
                        return;
                    }
                    setShowUserPopup(!showUserPopup);
                    setShowCreditPopup(false)
                }}
                className='w-9 h-9 bg-black text-white rounded-full flex items-center justify-center font-semibold'>

                    {userData ? userData?.name.slice(0, 1).toUpperCase() : <FaUserAstronaut size = {16}/>}

                </button>


                {showUserPopup && (
                    <div className='absolute right-[-50px] mt-3 w-64 bg-white shadow-xl border border-gray-200 rounded p-5 z-50'>
                        <p className='text-md text-bue-500 font-medium mb-1'>
                        {userData?.name}
                        </p>

                        {/* History Button */}
                        <button 
                        onClick = {() => navigate("/history")}
                         className= 'w-full text-left text-sm py-2 hover:text-black text-gray-600'>
                            Interview History
                        </button>

                        {/* LOGOUT BUTTON    */}
                        <button onClick = {handleLogout} className= 'w-full text-left text-sm py-2 flex items-center gap-2 text-red-500'>
                            <HiOutlineLogout size = {16}/>
                            Logout
                        </button>

                    </div>
                )}
            </div>


        </div>

      </motion.div>

      {/* // close the authmodel  */}
      {showAuth && <AuthModel onClose = {() => setShowAuth(false)}/>}
    </div>
  )
}

export default Navbar
