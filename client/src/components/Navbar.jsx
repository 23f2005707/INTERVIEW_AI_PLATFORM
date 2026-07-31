import React from 'react'
import { motion } from 'framer-motion';
import { BsRobot, BsCoin } from "react-icons/bs";
import { FaUserAstronaut } from "react-icons/fa";
import { HiOutlineLogout } from "react-icons/hi";
import { useSelector } from 'react-redux';

const Navbar = () => {

    // read the data from store 
    const {userData} = useSelector((state) => state.user)

  return (
    <div className=' bg-white flex justify-center px-4 pt-6'>
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
                <button className='flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full text-md hover:bg-gray-200 transition'>
                    <BsCoin size = {20} />
                    {userData?.credits || 0}
                </button>
            </div>

            <div className='relative'>
                <button className='w-9 h-9 bg-black text-white rounded-full flex items-center justify-center'>
                    <BsCoin size = {20} />
                    {userData?.credits || 0}
                </button>
            </div>


        </div>

      </motion.div>
    </div>
  )
}

export default Navbar
