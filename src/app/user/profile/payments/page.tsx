"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, CheckCircle, XCircle, Loader, TrashIcon } from "lucide-react";
import { formatDistance } from "date-fns";

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
  showToast,
} from "@/components";
import { getAllPayments } from "@/controllers";
import { useSelector } from "react-redux";
import { RootState } from "@/lib";
import { useAppDispatch } from "@/hooks";

const Packages = [
  {
    id: "67ad57ba0628c9cc6546ab27",
    name: "Semester Access",
  },
  {
    id: "67ad57cc0628c9cc6546ab2d",
    name: "Weekly Access",
  },
  {
    id: "67ad57ea0628c9cc6546ab33",
    name: "Daily Access",
  },
  {
    id: "67ad58830628c9cc6546ab39",
    name: "1 Credit Hour Course",
  },
  {
    id: " 67ad58a00628c9cc6546ab3f",
    name: "2 Credit Hours Course",
  },
  {
    id: "67ad58af0628c9cc6546ab45",
    name: "3 Credit Hours Course",
  },
  {
    id: "67ad59370628c9cc6546ab57",
    name: "1 Credit Hour Quiz",
  },
  {
    id: "67ad59250628c9cc6546ab51",
    name: "2 Credit Hours Quiz",
  },
  {
    id: "67ad58fe0628c9cc6546ab4b",
    name: "1 Credit Hour Quiz",
  },
  {
    id: "67ad5adf0628c9cc6546ab64",
    name: "Bulk Quiz Purchase",
  },
];

interface Payment {
  _id: string;
  accessCode: string;
  package: string;
  date: string;
  amount: number;
  status: "success" | "pending" | "failed";
  description: string;
  reference: string;
}

export default function PaymentsPage() {
  const dispatch = useAppDispatch();
  const { credentials } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const paymentsDoc = (await dispatch(
          getAllPayments(credentials.accessToken)
        )) as unknown as Payment[];
        const paymentsArr = Array.isArray(paymentsDoc)
          ? paymentsDoc
          : [paymentsDoc];

        const filteredPayments = paymentsArr
          .map((payment) => {
            const packageDoc = Packages.find(
              (pkg) => payment.package === pkg.id
            );
            return {
              _id: payment._id,
              accessCode: payment.accessCode,
              package: payment.package,
              date: payment.date,
              amount: payment.amount,
              status: payment.status,
              description: packageDoc ? packageDoc.name : "Custom",
              reference: payment.reference,
            };
          })
          .sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);

            if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
              return 0;
            }

            return dateA.getTime() - dateB.getTime();
          });
        setPayments(filteredPayments);
        setLoading(false);
      } catch (error: any) {
        showToast(error.message, "error");
      }
    };
    fetchPayments();
  }, [payments, credentials.accessToken, dispatch]);

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
            className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-primary"
          >
            <Link href="/user/pay">Make a Payment</Link>
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
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="animate-spin h-8 w-8 text-teal-500" />
                <span className="ml-2 text-lg text-zinc-400">
                  Loading payments...
                </span>
              </div>
            ) : payments ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-foreground hidden md:block">
                      Date
                    </TableHead>
                    <TableHead className="text-foreground hidden md:block">
                      Description
                    </TableHead>
                    <TableHead className="text-foreground">Amount</TableHead>
                    <TableHead className="text-foreground">Status</TableHead>
                    <TableHead className="text-foreground">Retry</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment._id}>
                      <TableCell className="text-muted-foreground hidden md:block">
                        {formatDistance(new Date(payment.date), new Date(), {
                          addSuffix: true,
                        })}
                      </TableCell>
                      <TableCell className="text-muted-foreground hidden md:block">
                        {payment.description}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        ₵ {payment.amount / 100}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {getStatusIcon(payment.status)}
                          <span className="ml-2 capitalize text-muted-foreground">
                            {payment.status}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link
                          onClick={() => {
                            localStorage.setItem(
                              "reference",
                              payment.reference
                            );
                          }}
                          className={`inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                            payment.status === "success"
                              ? "opacity-10 pointer-events-none bg-teal-600"
                              : "button-gradient"
                          } h-10 px-4 py-2 sm:h-9 sm:rounded-md sm:px-3 lg:h-11 lg:rounded-md lg:px-8`}
                          href={`${
                            payment.status !== "success" &&
                            payment.package !== "Custom"
                              ? `https://checkout.paystack.com/${payment.accessCode}`
                              : payment.status !== "success" &&
                                payment.package === "Custom"
                              ? "/user/pay/verify"
                              : "#"
                          }`}
                        >
                          {payment.status !== "success"
                            ? "Complete"
                            : "Success"}
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex items-center justify-center py-8">
                <TrashIcon className="h-8 w-8 text-teal-500" />
                <span className="ml-2 text-lg text-zinc-400">
                  No Payments Found
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
