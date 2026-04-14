import { GridIcon } from "../../icons";

export default function SystemsButton() {
  return (
    <a
      href="https://accountcenter.asipiya.com/systems"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors group"
    >
      <GridIcon className="w-5 h-5 text-gray-500 group-hover:text-brand-500 transition-colors" />
      <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wide">
        Systems
      </span>
    </a>
  );
}
