import { DollarLineIcon, ListIcon, TransferIcon, ApprovalIcon } from "../../icons";

export default function HeaderActions() {
  const actions = [
    { icon: <DollarLineIcon className="w-5 h-5" />, badge: null },
    { icon: <ListIcon className="w-5 h-5" />, badge: null },
    { icon: <TransferIcon className="w-5 h-5" />, badge: null },
    { icon: <ApprovalIcon className="w-5 h-5" />, badge: 4 },
    { icon: <DollarLineIcon className="w-5 h-5" />, badge: null }, // Using DollarLineIcon for "Cash" as well
  ];

  return (
    <div className="flex items-center gap-2">
      {actions.map((action, index) => (
        <button
          key={index}
          className="relative flex items-center justify-center w-10 h-10 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors text-gray-500 dark:text-gray-400 group"
        >
          <span className="group-hover:text-brand-500 transition-colors">
            {action.icon}
          </span>
          {action.badge && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-orange-500 rounded-full border border-white dark:border-gray-900">
              {action.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
