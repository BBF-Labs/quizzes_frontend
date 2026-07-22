"use client";
import React, { useEffect } from "react";
import { logout, RootState } from "@/lib";
import { useSelector, Provider } from "react-redux";
import { showToast } from "@/components";
import { usePathname, useRouter } from "next/navigation";
import { store } from "@/lib";
import { useAppDispatch } from "@/hooks";

// Roles allowed into /admin, mirroring the backend's authorizeRoles("super_admin",
// "creator", "moderator") guard on the learning module's adminRouter.
const ADMIN_ROLES = ["super_admin", "creator", "moderator"];

const AdminAuthLayout = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const returnUrl = usePathname();
  const router = useRouter();
  const auth = useSelector((state: RootState) => state.auth);
  const isAdmin = ADMIN_ROLES.includes(auth.user.role);

  useEffect(() => {
    if (!auth.isAuthenticated) {
      localStorage.setItem("returnUrl", returnUrl);
      router.push("/auth/login");
      return;
    }

    if (auth.hasMultipleSessions) {
      localStorage.setItem("returnUrl", returnUrl);
      dispatch(logout());
      showToast("Multiple sessions detected", "error");
      router.push("/auth/login");
      return;
    }

    if (!isAdmin) {
      showToast("You don't have access to this page", "error");
      router.push("/");
    }
  }, [
    auth.isAuthenticated,
    auth.hasMultipleSessions,
    isAdmin,
    router,
    returnUrl,
    dispatch,
  ]);

  if (!auth.isAuthenticated || !isAdmin) return null;

  return <>{children}</>;
};

export default function AdminWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      <AdminAuthLayout>
        <div className="admin-shell">{children}</div>
      </AdminAuthLayout>
    </Provider>
  );
}
