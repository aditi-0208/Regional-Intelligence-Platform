import React, { useEffect, useRef } from "react";
import { useAuth } from "../auth/AuthProvider";

export default function GoogleButton(){
  const divRef = useRef(null);
  const { googleLogin } = useAuth();
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    const google = window.google;
    if (!google || !clientId) return;
    google.accounts.id.initialize({
      client_id: clientId,
      callback: async (resp) => {
        try { await googleLogin(resp.credential); }
        catch (e) { alert(e.message); }
      },
      ux_mode: "popup"
    });
    if (divRef.current) {
      google.accounts.id.renderButton(divRef.current, { type:"standard", size:"large", theme:"outline", text:"signin_with" });
    }
  }, [clientId, googleLogin]);

  return <div ref={divRef}></div>;
}
