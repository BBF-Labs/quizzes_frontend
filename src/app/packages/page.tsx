"use client";
import {
  Calendar,
  Clock,
  Book,
  FileText,
  Zap,
  AlertTriangle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Alert,
  AlertDescription,
  AlertTitle,
  LandingHeader,
} from "@/components";

export default function PackagesPage() {
  const standardPackages = [
    {
      icon: Calendar,
      name: "Semester Access",
      price: 9,
      description: "Full access for the entire semester",
    },
    {
      icon: Clock,
      name: "Weekly Access",
      price: 4,
      description: "Access for a full week",
    },
    {
      icon: Clock,
      name: "Daily Access",
      price: 1.5,
      description: "Daily access",
    },
  ];

  const coursePackages = [
    { icon: Book, name: "1 Credit Hour Course", price: 2 },
    { icon: Book, name: "2 Credit Hours Course", price: 2.5 },
    { icon: Book, name: "3 Credit Hours Course", price: 3 },
  ];

  const quizPackages = [
    {
      icon: FileText,
      name: "1 Credit Hour Quiz",
      price: 1.5,
      discount: "15% discount applied",
    },
    {
      icon: FileText,
      name: "2 Credit Hours Quiz",
      price: 2.25,
      discount: "15% discount applied",
    },
    {
      icon: FileText,
      name: "3 Credit Hours Quiz",
      price: 2.75,
      discount: "35% discount applied",
    },
    {
      icon: Zap,
      name: "Quiz Trial",
      price: 1,
      description: "Try before commitment",
    },
    {
      icon: FileText,
      name: "Bulk Quiz Purchase",
      description: "25% OFF when buying 5+ quizzes",
      example: "Example: 5 quizzes = 5 cedis → 3.75 cedis after discount",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingHeader />
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent">
            BBF Labs Pricing Structure
          </h1>
          <p className="text-foreground">
            Choose the package that best fits your needs
          </p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              Standard Packages
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {standardPackages.map((pkg, index) => (
                <Card key={index} className="bg-card border-border">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <pkg.icon className="h-6 w-6 text-teal-500" />
                      <CardTitle className="text-foreground">
                        {pkg.name}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-foreground">
                      {pkg.price} cedis
                    </p>
                    <p className="text-muted-foreground mt-2">
                      {pkg.description}
                    </p>
                    <Button className="w-full mt-4 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600">
                      Select
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              Course-Based Packages
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {coursePackages.map((pkg, index) => (
                <Card key={index} className="bg-card border-border">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <pkg.icon className="h-6 w-6 text-teal-500" />
                      <CardTitle className="text-foreground">
                        {pkg.name}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-foreground">
                      {pkg.price} cedis
                    </p>
                    <p className="text-muted-foreground mt-2">
                      Access by Credit Hour
                    </p>
                    <Button className="w-full mt-4 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600">
                      Select
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              Quiz Participation Packages
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {quizPackages.map((pkg, index) => (
                <Card key={index} className="bg-card border-border">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <pkg.icon className="h-6 w-6 text-teal-500" />
                      <CardTitle className="text-foreground">
                        {pkg.name}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {pkg.price && (
                      <p className="text-3xl font-bold text-foreground">
                        {pkg.price} cedis
                      </p>
                    )}
                    {pkg.discount && (
                      <p className="text-teal-500 mt-1">{pkg.discount}</p>
                    )}
                    {pkg.description && (
                      <p className="text-muted-foreground mt-2">
                        {pkg.description}
                      </p>
                    )}
                    {pkg.example && (
                      <p className="text-sm text-zinc-500 mt-2">
                        {pkg.example}
                      </p>
                    )}
                    <Button className="w-full mt-4 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600">
                      Select
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <Alert className="bg-yellow-500/10 border-yellow-500 text-yellow-500">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Disclaimer</AlertTitle>
            <AlertDescription>
              Quiz credit packages are not saved to your account. You will need
              to pay for the quiz again once you exhaust your credits. Other
              packages save the quiz to your account for future access.
            </AlertDescription>
          </Alert>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              Bonus Discounts
            </h2>
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">
                  Active Participant Discount
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Earn discounts by actively participating in quizzes and
                  courses!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-foreground">
                  Contact support for more information on how to qualify for
                  these exclusive discounts.
                </p>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
