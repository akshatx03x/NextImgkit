"use client"
import { useRouter } from 'next/router';
import React, {useState} from 'react'

const RegisterPage = () => {
    const [email, setEmail]= useState("");
    const [password, setPassword]= useState("");
    const [confirmPassword, setConfirmPassword]= useState("")
    const router= useRouter();
    
    const handleSubmit=(e: React.FormEvent)=>{
        
    }
  return (
    <div>

    </div>
  )
}

export default RegisterPage
