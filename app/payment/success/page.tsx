"use client"

import { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import type { RootState } from "../../../store"
import { addPaymentToHistory } from "../../../store/paymentSlice"
import axios from "axios"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const PaymentSuccessPage = () => {
  const dispatch = useDispatch()
  const router = useRouter()
  const currentPayment = useSelector((state: RootState) => state.payment.currentPayment)

  useEffect(() => {
    if (currentPayment) {
      verifyPayment()
    }
  }, [currentPayment])

  const verifyPayment = async () => {
    try {
      const response = await axios.post("https://bbf-backend.onrender.com/api/payment/verify", {
        reference: currentPayment?.reference,
      })
      if (response.data.success) {
        dispatch(addPaymentToHistory(response.data.payment))
        alert("Payment verified successfully!")
      } else {
        alert("Payment verification failed. Please contact support.")
      }
    } catch (error) {
      console.error("Error verifying payment:", error)
      alert("Failed to verify payment. Please contact support.")
    }
  }

  const handleContinue = () => {
    router.push("/quizzes")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Payment Successful</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Thank you for your purchase!</p>
          <p className="mb-4">Your payment has been processed successfully.</p>
          <Button onClick={handleContinue} className="w-full">
            Continue to Quizzes
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default PaymentSuccessPage

