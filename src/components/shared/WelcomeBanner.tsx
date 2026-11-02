"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "aws-amplify/auth";

export function WelcomeBanner() {
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    async function checkUser() {
      try {
        const user = await getCurrentUser();
        // Use email as display name (Cognito username is the email)
        const email = user.signInDetails?.loginId ?? user.username;
        // Extract name part before @
        const name = email.includes("@") ? email.split("@")[0] : email;
        setUserName(name);
      } catch {
        // Not authenticated
        setUserName(null);
      }
    }
    checkUser();
  }, []);

  if (userName) {
    return (
      <>
        <h1 className="text-3xl font-bold text-white">
          ¡Hola, <span className="text-violet-400">{userName}</span>! 👋
        </h1>
        <p className="mt-2 text-slate-300">
          Bienvenido de vuelta. Explora nuestro catálogo de productos exclusivos.
        </p>
      </>
    );
  }

  return (
    <>
      <h1 className="text-3xl font-bold text-white">Catálogo de productos</h1>
      <p className="mt-2 text-slate-300">Explora nuestra selección de productos exclusivos</p>
    </>
  );
}
