"use client";
import React from "react";
import { MultiStepLoader as Loader } from "@/components/ui/multi-step-loader";
import { IconSquareRoundedX } from "@tabler/icons-react";
 
const loadingStates = [
  {
    text: "Creating Secure Connection...",
  },
  {
    text: "Secure Connection Established!",
  },
  {
    text: "Generating Contract...",
  },
  {
    text: "Contract Generation Successful!",
  },
  {
    text: "Adding Lead Information...",
  },
  {
    text: "Lead Information Injected Successfully!",
  },
  {
    text: "Your Document Is Ready To Sign!",
  },
];
 
interface ContractLoaderProps {
  loading: boolean;
  onClose: () => void;
}

export function ContractLoader({ loading, onClose }: ContractLoaderProps) {
  return (
    <div className="w-full h-[60vh] flex items-center justify-center">
      {/* Core Loader Modal */}
      <Loader loadingStates={loadingStates} loading={loading} duration={1500} loop={false} />
 
      {loading && (
        <button
          className="fixed top-4 right-4 text-[#32CD32] z-[120] hover:text-[#32CD32]/80 transition-colors"
          onClick={onClose}
          title="Close loader"
          aria-label="Close loader"
        >
          <IconSquareRoundedX className="h-10 w-10" />
        </button>
      )}
    </div>
  );
} 