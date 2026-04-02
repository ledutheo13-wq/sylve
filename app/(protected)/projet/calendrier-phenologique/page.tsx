import { plantes } from "@/lib/plantes";
import CalendrierPhenologique from "./CalendrierPhenologique";

export default function CalendrierPhenologiquePage() {
  return <CalendrierPhenologique plantes={plantes} />;
}
