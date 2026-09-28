"use client";

import { useClerk } from "@clerk/nextjs";

export default function SignOutControl() {
  const { signOut } = useClerk();
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  return (
    <button className="textButton" onClick={() => signOut({ redirectUrl: `${base}/sign-in` })}>
      SIGN OUT
    </button>
  );
}
