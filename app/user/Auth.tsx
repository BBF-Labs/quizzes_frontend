"use client"

import { useState } from "react"
import { useDispatch } from "react-redux"
import { setAuth } from "../../store/authSlice"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const dispatch = useDispatch()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup"
      const payload = isLogin ? { username, password } : { username, email, password }

      const response = await axios.post(`https://bbf-backend.onrender.com${endpoint}`, payload)

      if (response.data.success) {
        dispatch(setAuth({ isAuthenticated: true, username }))
        localStorage.setItem("authStatus", JSON.stringify({ username, isAuthenticated: true }))
      } else {
        alert(response.data.message || "Authentication failed")
      }
    } catch (error) {
      console.error("Auth error:", error)
      alert("Authentication failed")
    }

    setIsLoading(false)
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>{isLogin ? "Login" : "Sign Up"}</CardTitle>
        <CardDescription>{isLogin ? "Enter your credentials" : "Create a new account"}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAuth} className="space-y-4">
          <Input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          {!isLogin && (
            <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          )}
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Processing..." : isLogin ? "Login" : "Sign Up"}
          </Button>
        </form>
        <Button variant="link" onClick={() => setIsLogin(!isLogin)} className="w-full mt-4">
          {isLogin ? "Need an account? Sign Up" : "Already have an account? Login"}
        </Button>
      </CardContent>
    </Card>
  )
}

export default Auth

