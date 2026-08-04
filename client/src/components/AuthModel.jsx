import React from 'react'
import {useSelector} from 'react-redux'
import { useEffect } from 'react'
import {FaTimes} from "react-icons/fa";

import Auth from '../pages/Auth.jsx';


export const AuthModel = ({ onClose }) => {

    // fetch user data from store
    const {userData} = useSelector((state) => state.user)

    useEffect(() => {
        if(userData) {
            // close the auth model if user is logged in
            onClose() 
        }
    }, [userData, onClose])

    return (
        <div className = 'fixed inset-0 bg-black/10 z-[999] flex items-center justify-center backdrop-blur-sm px-4'>
          
            <div className = 'relative w-full max-w-md'>

                <button onClick = {onClose} className = 'absolute top-8 right-5 text-gray-800 hover:text-black text-xl'>
                    <FaTimes size = {18} />
                </button>


                <Auth isModel = {true} />
            </div>
        </div>
    )
}
