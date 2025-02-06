"use client"

import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { setPackages, setSelectedPackage } from "../../store/packageSlice"
import type { RootState } from "../../store"
import axios from "axios"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const PackagesPage = () => {
  const dispatch = useDispatch()
  const router = useRouter()
  const packages = useSelector((state: RootState) => state.package.packages)

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await axios.get("https://bbf-backend.onrender.com/api/packages")
        dispatch(setPackages(response.data))
      } catch (error) {
        console.error("Error fetching packages:", error)
      }
    }

    fetchPackages()
  }, [dispatch])

  const handleSelectPackage = (pkg: any) => {
    dispatch(setSelectedPackage(pkg))
    router.push("/payment")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Choose a Package</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <Card key={pkg._id.toString()}>
            <CardHeader>
              <CardTitle>{pkg.name}</CardTitle>
              <CardDescription>{pkg.access} access</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold mb-2">${pkg.price}</p>
              <p>Duration: {pkg.duration} days</p>
              {pkg.numberOfQuizzes && <p>Quizzes: {pkg.numberOfQuizzes}</p>}
              {pkg.numberOfCourses && <p>Courses: {pkg.numberOfCourses}</p>}
              <Button onClick={() => handleSelectPackage(pkg)} className="mt-4 w-full">
                Select Package
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default PackagesPage

