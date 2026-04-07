import { useToastStore } from '../stores/toast.store';
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from 'lucide-react';

const iconByType = {
  success: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
  error: XCircle,
} as const;

export default function Toasts() {
  const { toasts, remove } = useToastStore();
  return (
    <div className="fixed z-[1000] top-4 right-4 space-y-3 w-[calc(100%-2rem)] max-w-sm">
      {toasts.map(t => {
        const Icon = iconByType[t.type];
        const tone =
          t.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
          t.type === 'info' ? 'bg-blue-50 border-blue-200 text-blue-800' :
          t.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' :
          'bg-red-50 border-red-200 text-red-800';
        const iconTone =
          t.type === 'success' ? 'text-green-600' :
          t.type === 'info' ? 'text-blue-600' :
          t.type === 'warning' ? 'text-amber-600' :
          'text-red-600';
        return (
          <div key={t.id} className={`border rounded-xl shadow-sm p-3 pr-2 flex items-start gap-3 ${tone} animate-in slide-in-from-top-2 fade-in duration-200`}>
            <div className={`p-1 rounded-full ${iconTone}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              {t.title ? <div className="text-sm font-bold truncate">{t.title}</div> : null}
              <div className="text-sm">{t.message}</div>
            </div>
            <button onClick={() => remove(t.id)} className="p-1 rounded-md hover:bg-black/5">
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
