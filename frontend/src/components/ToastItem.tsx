import { motion } from "framer-motion";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

type Toast = {
  id: string;
  message: string;
  type: "success" | "info" | "error";
};

export const ToastItem: React.FC<{ toast: Toast }> = ({ toast }) => {
  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <CheckCircleIcon className="w-6 h-6 text-green-600" />;
      case "info":
        return <ExclamationCircleIcon className="w-6 h-6 text-yellow-600" />;
      case "error":
        return <XCircleIcon className="w-6 h-6 text-red-600" />;
    }
  };

  const ringColor = {
    success: "border-green-400",
    info: "border-yellow-400",
    error: "border-red-400",
  }[toast.type];

  return (
    <motion.div
      initial={{ opacity: 0, x: 80 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 80 }}
      className="flex items-center gap-3 p-4 bg-white border shadow-md rounded-xl w-80 relative overflow-hidden"
    >
      <div className="relative">
        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 border">
          {getIcon()}
        </div>
        <div
          className={`absolute top-0 left-0 w-10 h-10 border-2 ${ringColor} border-opacity-60 rounded-full animate-toast-ring`}
          style={{
            borderRightColor: "transparent",
            borderTopColor: "transparent",
          }}
        />
      </div>
      <span className="text-sm text-gray-800">{toast.message}</span>
    </motion.div>
  );
};
