"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Clock,
  BookOpen,
  GraduationCap,
  Timer,
  Package2,
  ArrowLeft,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PackageOption } from "@/types";

const OtherPackagesPage = () => {
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState<PackageOption[]>([]);

  // Simulate API fetch
  useEffect(() => {
    const mockPackages: PackageOption[] = [
      {
        id: "1",
        title: "1 Credit Hour Course",
        description: "Access for a 1 credit hour course",
        price: 2,
        type: "course",
        icon: <Clock className="w-5 h-5" />,
      },
      {
        id: "2",
        title: "2 Credit Hours Course",
        description: "Access for a 2 credit hours course",
        price: 2.5,
        type: "course",
        icon: <BookOpen className="w-5 h-5" />,
      },
      {
        id: "3",
        title: "3 Credit Hours Course",
        description: "Access for a 3 credit hours course",
        price: 3,
        type: "course",
        icon: <GraduationCap className="w-5 h-5" />,
      },
      {
        id: "4",
        title: "1 Credit Hour Quiz",
        description: "Participation in a 1-credit hour quiz (15% discount)",
        price: 1.5,
        type: "quiz",
        icon: <Timer className="w-5 h-5" />,
        discount: 15,
      },
      {
        id: "5",
        title: "2 Credit Hours Quiz",
        description: "Participation in a 2-credit hours quiz (15% discount)",
        price: 2.25,
        type: "quiz",
        icon: <Timer className="w-5 h-5" />,
        discount: 15,
      },
      {
        id: "6",
        title: "3 Credit Hours Quiz",
        description: "Participation in a 3-credit hours quiz (35% discount)",
        price: 2.75,
        type: "quiz",
        icon: <Timer className="w-5 h-5" />,
        discount: 35,
      },
      {
        id: "7",
        title: "Quiz Trial",
        description: "Try a single quiz before commitment",
        price: 1,
        type: "special",
        icon: <Timer className="w-5 h-5" />,
      },
      {
        id: "8",
        title: "Bulk Quiz Purchase",
        description: "25% discount when buying 5+ quizzes",
        price: 0,
        type: "special",
        icon: <Package2 className="w-5 h-5" />,
        discount: 25,
      },
    ];

    setTimeout(() => {
      setPackages(mockPackages);
      setLoading(false);
    }, 1000);
  }, []);

  const handlePackageSelect = (packageId: string) => {
    console.log("Selected package:", packageId);
  };

  return (
    <div className="min-h-screen  text-white py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-3">
            Other <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">Package</span>{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">Options</span>
          </h1>
          <p className="text-gray-400">
            Explore our course-based and quiz participation packages
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {loading
            ? [...Array(8)].map((_, i) => (
                <Card key={i} className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 bg-gray-800" />
                    <Skeleton className="h-4 w-1/2 bg-gray-800 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-1/3 bg-gray-800" />
                  </CardContent>
                </Card>
              ))
            : packages.map((pkg) => (
                <Card
                  key={pkg.id}
                  className={`group bg-transparent  border-gray-800 hover:border-gray-700 transition-all duration-300 ${
                    pkg.type === "special" ? "md:col-span-2 lg:col-span-1" : ""
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-gray-800 group-hover:bg-gray-750 transition-colors">
                        {pkg.icon}
                      </div>
                      <CardTitle className="text-lg">{pkg.title}</CardTitle>
                    </div>
                    <p className="text-sm text-gray-400">{pkg.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-1">
                        {pkg.price > 0 ? (
                          <>
                            <span className="text-2xl font-bold text-emerald-400">
                              {pkg.price}
                            </span>
                            <span className="text-gray-400">cedis</span>
                          </>
                        ) : pkg.discount ? (
                          <span className="text-2xl font-bold text-emerald-400">
                            {pkg.discount}% OFF
                          </span>
                        ) : null}
                      </div>
                      <Button
                        onClick={() => handlePackageSelect(pkg.id)}
                        className=" text-white bg-gradient-to-r from-emerald-400 to-blue-400 transition-colors"
                      >
                        Select
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
        </div>

        <div className="mt-8 text-center">
          <Button
            variant="ghost"
            className="text-gray-400 hover:text-white"
            onClick={() => console.log("Navigate back")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Standard Packages
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OtherPackagesPage;
