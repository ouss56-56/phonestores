import { Download, FileText } from "lucide-react";

interface ExportButtonsProps {
    onExportCSV?: () => void;
    onExportPDF?: () => void;
}

export function ExportButtons({ onExportCSV, onExportPDF }: ExportButtonsProps) {
    return (
        <div className="flex gap-2">
            {onExportCSV && (
                <button
                    onClick={onExportCSV}
                    className="bg-admin-card border border-admin-border px-4 py-2.5 rounded-xl text-[10px] font-bold text-admin-primary uppercase tracking-widest flex items-center gap-2 hover:bg-admin-bg transition-all shadow-sm active:scale-95"
                >
                    <Download className="w-3.5 h-3.5" /> CSV
                </button>
            )}
            {onExportPDF && (
                <button
                    onClick={onExportPDF}
                    className="bg-admin-card border border-admin-border px-4 py-2.5 rounded-xl text-[10px] font-bold text-admin-primary uppercase tracking-widest flex items-center gap-2 hover:bg-admin-bg transition-all shadow-sm active:scale-95"
                >
                    <FileText className="w-3.5 h-3.5" /> PDF
                </button>
            )}
        </div>
    );
}
