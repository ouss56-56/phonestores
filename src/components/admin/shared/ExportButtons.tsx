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
                    className="glass border border-white/10 px-4 py-2.5 rounded-xl text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-2 hover:bg-white/10 transition-all"
                >
                    <Download className="w-3.5 h-3.5" /> CSV
                </button>
            )}
            {onExportPDF && (
                <button
                    onClick={onExportPDF}
                    className="glass border border-white/10 px-4 py-2.5 rounded-xl text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-2 hover:bg-white/10 transition-all"
                >
                    <FileText className="w-3.5 h-3.5" /> PDF
                </button>
            )}
        </div>
    );
}
