import { FamilleView } from "../_components/FamilleView";
import { familleBySlug } from "@/lib/tools-catalog";

const fam = familleBySlug("gestion-eaux-pluviales")!;
export const metadata = { title: fam.seoTitle, description: fam.seoDescription };

export default function Page() {
  return <FamilleView familleSlug="gestion-eaux-pluviales" />;
}
