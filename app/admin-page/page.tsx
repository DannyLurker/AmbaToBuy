import React from "react";
import ShowPreOrderForAdmin from "@/components/admin/ShowPreOrderForAdmin";
import { Suspense } from "react";

function LoadingSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="animate-pulse flex justify-between items-center p-4 border rounded-lg"
        >
          <div className="w-1/3 h-4 bg-gray-300 rounded"></div>
          <div className="w-1/4 h-4 bg-gray-300 rounded"></div>
          <div className="w-1/6 h-4 bg-gray-300 rounded"></div>
        </div>
      ))}
    </div>
  );
}

const page = () => {
  return (
    <div>
      <Suspense fallback={<LoadingSkeleton />}>
        <ShowPreOrderForAdmin />
      </Suspense>
    </div>
  );
};

export default page;
