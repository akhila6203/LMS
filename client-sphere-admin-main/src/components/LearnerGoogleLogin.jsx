import { memo, useEffect, useRef, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";

/**
 * Renders Google sign-in once per login page visit (avoids duplicate GSI initialize).
 */
function LearnerGoogleLoginInner({ onSuccess, onError, disabled }) {
  const containerRef = useRef(null);
  const [width, setWidth] = useState(400);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;

    const updateWidth = () => {
      const next = Math.min(400, Math.max(240, Math.floor(el.clientWidth)));
      setWidth(next);
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="google-login-full w-full">
      <GoogleLogin
        onSuccess={onSuccess}
        onError={onError}
        text="continue_with"
        shape="pill"
        size="large"
        width={String(width)}
        theme="outline"
      />
    </div>
  );
}

export default memo(LearnerGoogleLoginInner);
