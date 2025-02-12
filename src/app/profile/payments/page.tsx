"use client";
import { useState } from "react";
import Link from "next/link";
import { Clock, CheckCircle, XCircle } from "lucide-react";

import {
  Card,
  Button,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components";

interface Payment {
  id: string;
  date: string;
  amount: number;
  status: "success" | "pending" | "failed";
  description: string;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([
    {
      id: "1",
      date: "2024-02-12",
      amount: 9,
      status: "success",
      description: "Semester Access",
    },
    {
      id: "2",
      date: "2024-02-10",
      amount: 4,
      status: "success",
      description: "Weekly Access",
    },
    {
      id: "3",
      date: "2024-02-08",
      amount: 1.5,
      status: "failed",
      description: "Daily Access",
    },
    {
      id: "4",
      date: "2024-02-05",
      amount: 2.25,
      status: "pending",
      description: "2 Credit Hours Quiz",
    },
    // Add more payment history items as needed
  ]);

  const getStatusIcon = (status: Payment["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent">
            Payment History
          </h1>
          <Button
            asChild
            className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600"
          >
            <Link href="/payment">Make a Payment</Link>
          </Button>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">
              Recent Transactions
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              View your payment history and transaction details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-foreground">Date</TableHead>
                  <TableHead className="text-foreground">Description</TableHead>
                  <TableHead className="text-foreground">Amount</TableHead>
                  <TableHead className="text-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="text-muted-foreground">
                      {payment.date}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {payment.description}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {payment.amount} cedis
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {getStatusIcon(payment.status)}
                        <span className="ml-2 capitalize text-muted-foreground">
                          {payment.status}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
