import { memo, useEffect, useRef } from "react";
import { useGoogleOAuth } from "@react-oauth/google";

/** Avoid calling google.accounts.id.initialize() more than once per client ID. */
let gsiInitializedClientId = null;

function LearnerGoogleLoginInner({ onSuccess, onError, disabled }) {
  const btnContainerRef = useRef(null);
  const { clientId, scriptLoadedSuccessfully } = useGoogleOAuth();
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  onSuccessRef.current = onSuccess;
  onErrorRef.current = onError;

  useEffect(() => {
    if (!scriptLoadedSuccessfully || !clientId) return;

    const googleId = window.google?.accounts?.id;
    const container = btnContainerRef.current;
    if (!googleId || !container) return;

    if (gsiInitializedClientId !== clientId) {
      googleId.initialize({
        client_id: clientId,
        callback: (credentialResponse) => {
          if (!credentialResponse?.credential) {
            onErrorRef.current?.();
            return;
          }
          onSuccessRef.current?.({
            credential: credentialResponse.credential,
            clientId: credentialResponse.client_id || clientId,
            select_by: credentialResponse.select_by,
          });
        },
      });
      gsiInitializedClientId = clientId;
    }

    container.replaceChildren();

    const width = Math.min(
      400,
      Math.max(240, Math.floor(container.clientWidth || 382))
    );

    googleId.renderButton(container, {
      type: "standard",
      theme: "outline",
      size: "large",
      text: "continue_with",
      shape: "pill",
      width: String(width),
    });
  }, [clientId, scriptLoadedSuccessfully]);

  return (
    <div
      ref={btnContainerRef}
      className={`google-login-full w-full ${disabled ? "pointer-events-none opacity-60" : ""}`}
      style={{ minHeight: 40 }}
    />
  );
}

export default memo(LearnerGoogleLoginInner);
