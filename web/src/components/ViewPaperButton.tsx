import { MdiOpenInNew } from "../assets/MdiOpenInNew";

export default function ViewPaperButton() {
  return (
    <a
      className="p-3 px-5 w-fit rounded-4xl text-md font-semibold bg-blue-400 
            text-white cursor-pointer hover:bg-blue-500
            flex gap-2 items-center"
      href="https://doi.org/10.3390/risks13010017"
      target="_blank"
      rel="noreferrer"
    >
      <MdiOpenInNew height={20} width={20} />
      View Paper
    </a>
  );
}
