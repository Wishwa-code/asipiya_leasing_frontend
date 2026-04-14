import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { ChevronDownIcon, BuildingIcon } from "../../icons";

export default function BranchSwitcher() {
  const { user, currentBranchId, switchBranch } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // If user doesn't have multiple branch access, don't show the switcher or show it as static
  if (!user || user.branch_access !== 1 || !user.branches) {
    return (
      <div className="flex items-center gap-3 px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
        <BuildingIcon className="w-5 h-5 text-gray-500" />
        <div className="flex flex-col items-start leading-none text-left">
          <span className="text-xs font-bold text-gray-900 dark:text-white uppercase">{user?.branch_name}</span>
          <span className="text-[10px] text-gray-500">Active</span>
        </div>
      </div>
    );
  }

  const currentBranch = user.branches.find(b => b.idBranch === currentBranchId) || { Name: user.branch_name, idBranch: user.branch_id };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors"
      >
        <BuildingIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <div className="flex flex-col items-start leading-none text-left min-w-[100px]">
          <span className="text-xs font-bold text-gray-900 dark:text-white uppercase truncate max-w-[120px]">
            {currentBranch.Name}
          </span>
          <span className="text-[10px] text-gray-500 uppercase">
             Branch ID: {currentBranch.idBranch}
          </span>
        </div>
        <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-2 shadow-theme-lg z-50"
      >
        <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          Switch Branch
        </div>
        <div className="flex flex-col gap-1 max-h-60 overflow-y-auto custom-scrollbar">
          {user.branches.map((branch) => (
            <button
              key={branch.idBranch}
              onClick={() => {
                switchBranch(branch.idBranch);
                setIsOpen(false);
              }}
              className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl text-left transition-colors ${
                currentBranchId === branch.idBranch
                  ? "bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-400"
              }`}
            >
              <BuildingIcon className={`w-4 h-4 ${currentBranchId === branch.idBranch ? "text-brand-500" : "text-gray-400"}`} />
              <div className="flex flex-col overflow-hidden">
                 <span className="text-xs font-semibold truncate">{branch.Name}</span>
                 <span className="text-[10px] opacity-70">ID: {branch.idBranch}</span>
              </div>
            </button>
          ))}
        </div>
      </Dropdown>
    </div>
  );
}
