import { HeaderClient } from "@/components/header-client";
import { canSell, getCurrentUser } from "@/lib/auth";
import { cartCount } from "@/lib/cart";

export async function SiteHeader() {
  const [user, count] = await Promise.all([getCurrentUser(), cartCount()]);
  return (
    <HeaderClient
      user={user}
      cartCount={count}
      canSell={user ? canSell(user.role) : false}
    />
  );
}
