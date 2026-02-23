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
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                    type="text"
                    placeholder={placeholder}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white text-sm outline-none focus:border-primary/50 transition-all font-mono-tech shadow-inner"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
            </div>
            {onFilter && (
                <button
                    onClick={onFilter}
                    className="bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition-all text-muted-foreground hover:text-white"
                >
                    <Filter className="w-5 h-5" />
                </button>
            )}
        </div>
    );
}
