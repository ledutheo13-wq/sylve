import { plantes } from "@/lib/plantes";
import SelecteurEssences from "./SelecteurEssences";

export default function SelecteurEssencesPage() {
  return <SelecteurEssences plantes={plantes} />;
}
