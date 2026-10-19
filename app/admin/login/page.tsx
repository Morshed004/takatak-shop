import { auth } from "@/lib/auth";
import LoginForm from "./login-form";
import { headers } from "next/headers";
import { redirect } from "next/navigation";


export default async function AdminLoginPage() {
  
// Fetch session on server side
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // If user is not logged in, redirect to login
  if (session) {
    redirect("/admin/dashboard");
  }
  return (
    <LoginForm />
  );
}