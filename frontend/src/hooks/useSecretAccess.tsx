import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function useSecretAccess(triggerElementId: string, onTrigger?: () => void) {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === "m") {
        onTrigger ? onTrigger() : navigate("/admin-login");
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onTrigger, navigate]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const handleTouchStart = () => {
      timeout = setTimeout(() => {
        onTrigger ? onTrigger() : navigate("/admin-login");
      }, 2000); // 2-second press
    };

    const handleTouchEnd = () => {
      clearTimeout(timeout);
    };

    const element = document.getElementById(triggerElementId);
    if (element) {
      element.addEventListener("touchstart", handleTouchStart);
      element.addEventListener("touchend", handleTouchEnd);
      element.addEventListener("touchmove", handleTouchEnd);
    }

    return () => {
      if (element) {
        element.removeEventListener("touchstart", handleTouchStart);
        element.removeEventListener("touchend", handleTouchEnd);
        element.removeEventListener("touchmove", handleTouchEnd);
      }
    };
  }, [triggerElementId, onTrigger, navigate]);
}
