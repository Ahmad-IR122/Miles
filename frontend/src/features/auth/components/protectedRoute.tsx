import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { routesPaths } from "../../../routes/routesPaths";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <Navigate to={routesPaths.signIn} replace />
      </SignedOut>
    </>
  );
};

export default ProtectedRoute;
