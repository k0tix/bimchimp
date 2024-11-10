import React from "react";
import { Loader } from "lucide-react";
import "tailwindcss/tailwind.css";

const Spinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center">
      <Loader className="animate-spin h-4 w-4 text-gray-500" />
    </div>
  );
};

export default Spinner;
