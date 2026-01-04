import { redirect } from "next/navigation";

/**
 * Root page - redirects based on auth state
 * This is a temporary placeholder until we implement auth
 */
export default function HomePage() {
  // TODO: Check auth state and redirect accordingly
  // For now, redirect to a coming soon page
  redirect("/coming-soon");
}
