import { FamilleView } from "../_components/FamilleView";
import { familleBySlug } from "@/lib/tools-catalog";

const fam = familleBySlug("ouvrages")!;
export const metadata = { title: fam.seoTitle, description: fam.seoDescription };

export default function Page() {
  return <FamilleView familleSlug="ouvrages" />;
}
