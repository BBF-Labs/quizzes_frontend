"use client"

import { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import type { RootState } from "../../store"
import { setCurrentPayment } from "../../store/paymentSlice"
import axios from "axios"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const PaymentPage = () => {
  const dispatch = useDispatch()
  const router = useRouter()
  const selectedPackage = useSelector((state: RootState) => state.package.selectedPackage)
  const [paymentUrl, setPaymentUrl] = useState("")

  useEffect(() => {
    if (!selectedPackage) {
      router.push("/packages")
    } else {
      initializePayment()
    }
  }, [selectedPackage, router])

  const initializePayment = async () => {
    try {
      const response = await axios.post("https://bbf-backend.onrender.com/api/payment/initialize", {
        packageId: selectedPackage?._id,
      })
      setPaymentUrl(response.data.authorizationUrl)
      dispatch(setCurrentPayment(response.data.payment))
    } catch (error) {
      console.error("Error initializing payment:", error)
      alert("Failed to initialize payment. Please try again.")
    }
  }

  const handlePayment = () => {
    if (paymentUrl) {
      window.location.href = paymentUrl
    }
  }

  if (!selectedPackage) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Complete Your Payment</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Package: {selectedPackage.name}</p>
          <p className="mb-4">Price: ${selectedPackage.price}</p>
          <Button onClick={handlePayment} className="w-full">
            Proceed to Payment
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default PaymentPage

