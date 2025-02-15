"use client";
import React, { useEffect } from "react";
import { logout, RootState } from "@/lib";
import { useSelector, Provider } from "react-redux";
import { Header, showToast } from "@/components";
import { usePathname, useRouter } from "next/navigation";
import { store } from "@/lib";
import { useAppDispatch } from "@/hooks";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const returnUrl = usePathname();
  const router = useRouter();
  const auth = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!auth.isAuthenticated) {
      localStorage.setItem("returnUrl", returnUrl);
      router.push("/auth/login");
    }

    if (auth.hasMultipleSessions) {
      localStorage.setItem("returnUrl", returnUrl);
      dispatch(logout());
      showToast("Multiple sessions detected", "error");
      router.push("/auth/login");
    }
  }, [
    auth.isAuthenticated,
    router,
    returnUrl,
    auth.hasMultipleSessions,
    dispatch,
  ]);

  return <>{children}</>;
};

export default function ProfileWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
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
