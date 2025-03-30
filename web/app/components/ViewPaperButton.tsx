import Link from "next/link";
import { MdiOpenInNew } from "./assets/MdiOpenInNew";

export default function ViewPaperButton() {
  return (
    <Link
      className="bg-blue-400 hover:bg-blue-500 text-white font-medium py-3 px-6 rounded-4xl transition-colors cursor-pointer flex items-center gap-2"
      href="https://doi.org/10.3390/risks13010017"
      target="_blank"
      rel="noreferrer"
    >
      <MdiOpenInNew height={20} width={20} />
      View Paper
    </Link>
  );
}
