import { redirect } from "next/navigation";

/**
 * Root page - redirects based on auth state
 * For now, redirect to sign-in (auth state check is client-side)
 */
export default function HomePage() {
  redirect("/sign-in");
}
