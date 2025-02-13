"use client";
import React, { useEffect } from "react";
import { RootState } from "@/lib";
import { useSelector, Provider } from "react-redux";
import { Header } from "@/components";
import { usePathname, useRouter } from "next/navigation";
import { store } from "@/lib";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const returnUrl = usePathname();
  const router = useRouter();
  const auth = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!auth.isAuthenticated) {
      localStorage.setItem("returnUrl", returnUrl);
      router.push("/auth/login");
    }
  }, [auth.isAuthenticated, router, returnUrl]);

  return <>{children}</>;
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthLayout>
        <div className="min-h-screen text-foreground">
          <Header />
          <main>{children}</main>
        </div>
      </AuthLayout>
    </Provider>
  );
}
