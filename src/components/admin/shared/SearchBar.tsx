import { Search, Filter } from "lucide-react";

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    onFilter?: () => void;
}

export function SearchBar({ value, onChange, placeholder = "Rechercher...", onFilter }: SearchBarProps) {
    return (
        <div className="flex gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-admin-secondary" />
                <input
                    type="text"
                    placeholder={placeholder}
                    className="w-full bg-admin-card border border-admin-border rounded-2xl py-4 pl-14 pr-6 text-admin-primary text-sm outline-none focus:border-admin-secondary/40 transition-all font-mono-tech shadow-sm placeholder:text-admin-secondary/50"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
            </div>
            {onFilter && (
                <button
                    onClick={onFilter}
                    className="bg-admin-card border border-admin-border p-4 rounded-2xl hover:bg-admin-bg transition-all text-admin-secondary hover:text-admin-primary shadow-sm"
                >
                    <Filter className="w-5 h-5" />
                </button>
            )}
        </div>
    );
}
