import React, { Suspense } from "react";
import ResetPasswordForm from "@/components/auth/ResetPassword";

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fefae0] to-[#faedcd] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#bc6c25] mx-auto"></div>
        <p className="mt-4 text-[#606c38] font-medium">Loading...</p>
      </div>
    </div>
  );
}

// Wrapper component that uses useSearchParams
function ResetPasswordWrapper() {
  return <ResetPasswordForm />;
}

const ResetPasswordPage = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ResetPasswordWrapper />
    </Suspense>
  );
};

export default ResetPasswordPage;
