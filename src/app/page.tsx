import { getDealers } from "./actions";
import { ClientPage } from "./client-page";

export default async function HomePage() {
  const dealers = await getDealers();

  return <ClientPage initialDealers={dealers} />;
}
