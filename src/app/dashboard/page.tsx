import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();

  // Redirect to sign in if not authenticated
  if (!session?.user) {
    return redirect("/auth/signin");
  }

  // Redirect to role-specific dashboard
  switch (session.user.role) {
    case "admin":
      return redirect("/dashboard/admin");
    case "vendor":
      return redirect("/dashboard/vendor");
    case "itops":
      return redirect("/dashboard/itops");
    case "customer":
      return redirect("/dashboard/customer");
    default:
      // If role is not recognized, default to customer
      return redirect("/dashboard/customer");
  }
}
