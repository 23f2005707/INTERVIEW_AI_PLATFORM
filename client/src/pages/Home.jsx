import React from 'react'
import Navbar from '../components/Navbar'
import { HiSparkles } from "react-icons/hi2"
import { motion } from "framer-motion"
import { useSelector } from 'react-redux'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthModel } from '../components/AuthModel.jsx'


import {
  BsRobot,
  BsMic,
  BsClock,
  BsBarChart,
  BsFileEarmarkText
} from "react-icons/bs";

const Home = () => {
  // 1. take userdata from store 
  const { userData } = useSelector((state) => state.user)

  // 4. show auth model state
  const [showAuth, setShowAuth] = useState(false)

  // 5. navigate hook
  const navigate = useNavigate()

  return (
    <div className='min-h-screen flex flex-col bg-[#f3f3f3]'>

      <Navbar />

      <div className='flex-1 px-6 py-20'>
        <div className='flex justify-center mb-6'>

          {/* 2. Small Heading */}
          <div className='bg-gray-100 text-gray-600 text-sm px-4 py-2 roundeed-full flex items-center gap-2'>

            <HiSparkles size={16} className="bg-green-50 text-green-600" />
            AI Powered Smart Interview Platform

          </div>

        </div>

        {/* 3. Main Heading */}
        <div className='text-center mb-28'>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className='text-4xl md:text-6xl font-semibold leading-tight max-w-4xl mx-auto'>
            Practice Interviews with
            <span className='relative inline-block'>
              <span className='bg-green-100 text-green-600 px-5 py-1 rounded-full'>
                AI Intelligence
              </span>
            </span>
          </motion.h1>

          {/* paragraph */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className='text-gray-500 mt-6 max-w-2xl mx-auto text-lg'>
            Role-based mock interviews with AI-generated questions and real-time feedback to help you ace your next interview.
          </motion.p>

          {/* 4. Add button start interview */}
          <div className='flex flex-wrap justify-center gap-4 mt-10'>

            {/* START INTERVIEW BUTTON   */}
            <motion.button
              onClick={() => {
                if (!userData) {
                  setShowAuth(true)
                  return;
                }

                navigate("/interview")
              }}

              whileHover={{ opacity: 0.9, scale: 1.03 }}
              whileTap={{ opacity: 1, scale: 0.98 }}
              className='bg-black text-white px-10 py-3 rounded-full hover:opacity-90 transition shadow-md'>
              Start Interview
            </motion.button>

            {/* VIEW history BUTTON */}
            <motion.button
              onClick={() => {
                if (!userData) {
                  setShowAuth(true)
                  return;
                }

                navigate("/history")
              }}

              whileHover={{ opacity: 0.9, scale: 1.03 }}
              whileTap={{ opacity: 1, scale: 0.98 }}
              className='border border-gray-300 px-10 py-3 rounded-full  hover:bg-gray-100 transition'>
              View Interview History
            </motion.button>

          </div>
        </div>

        {/* 6. FEATURES SECTION */}
        <div className='flex flex-col md:flex-row justify-center items-center gap-10 mb-28'>
          {
            [
              {
                icon: <BsRobot size={24} />,
                step: "STEP 1",
                title: "Role & Experience Selection",
                desc: "AI adjusts difficulty based on selected job role."
              },
              {
                icon: <BsMic size={24} />,
                step: "STEP 2",
                title: "Smart Voice Interview",
                desc: "Dynamic follow-up questions based on your answers."
              },
              {
                icon: <BsClock size={24} />,
                step: "STEP 3",
                title: "Time Based Simulation",
                desc: "Real interview pressure with time tracking and countdowns."
              }
            ].map((item, index) => (
              <motion.div key={index}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ rotate: 0, scale: 1.06 }}
                className={`relative bg-white rounded-3xl border-2 border-green-100 hover:border-green-500 p-10 w-80 max-w-[90%] shadow-md hover:shadow-2xl transition-all duration-300
                ${index === 0 ? "rotate-[-4deg]" : ""}
                ${index === 1 ? "rotate-[3deg] md:-mt-6 shadow-xl" : ""}
                ${index === 2 ? "rotate-[-3deg]" : ""}
                `}>
                <div className='text-green-600 mb-4'>{item.icon}</div>
                <p className='text-green-600 text-sm font-semibold mb-2'>{item.step}</p>
                <h3 className='text-xl font-bold mb-3'>{item.title}</h3>
                <p className='text-gray-600'>{item.desc}</p>


                {/* SHOW THE THREE BOXES */}
                  <div className = 'absolute -top-8 left-1/2 -translate-x-1/2 bg-white border-2 border-green-500 text-green-600 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg'>
                    {item.icon}
                  </div>
                  
                  <div className = 'text-center pt-10'>
                    <div className = 'text-xs text-green-600 font-semibold mb-3 text-lg'>{item.step}</div>
                    <h3 className = 'text-sm text-gray-500 leading-relaxed'>{item.title}</h3>
                    <p className = 'text-sm text-gray-500 leading-relaxed'></p>
                  </div>


              </motion.div>
            ))
          }
      </div>

    </div>

      {/* // close the authmodel  */ }
  { showAuth && <AuthModel onClose={() => setShowAuth(false)} /> }

    </div >
    
    )
}

export default Home
