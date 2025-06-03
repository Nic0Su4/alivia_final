import Cookies from "js-cookie";
import { redirect } from "next/navigation";

export default function AdminPage() {
  // Comprobar en cookies si hay un admin usando js-cookie
  const admin = Cookies.get("admin");
  if (!admin) {
    redirect("/admin/login");
  } else {
    redirect("/admin/dashboard");
  }
}
