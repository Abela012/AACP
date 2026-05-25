import { useState } from 'react';
import { Download, Eye, FileText, ExternalLink } from 'lucide-react';

type Props = {
  url?: string | null;
  title?: string;
};

const isPdfUrl = (url: string) => /\.pdf(\?|$)/i.test(url) || url.includes('/raw/upload/');

export default function AdminTradeLicensePreview({ url, title = 'Trade license' }: Props) {
  const [imgFailed, setImgFailed] = useState(false);

  if (!url?.trim()) {
    return (
      <div className="aspect-video rounded-3xl border border-dashed border-gray-200 dark:border-white/10 flex items-center justify-center bg-gray-50 dark:bg-white/5">
        <p className="text-xs font-bold text-gray-500">No trade license uploaded</p>
      </div>
    );
  }

  const showAsPdf = isPdfUrl(url) || imgFailed;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-blue hover:bg-primary-blue text-white rounded-xl text-xs font-bold transition-colors"
        >
          <Eye size={14} /> View full document
        </a>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          download
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-white/10 border border-[#EFEFEF] dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl text-xs font-bold transition-colors"
        >
          <Download size={14} /> Download
        </a>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-primary-blue text-xs font-bold hover:underline"
        >
          <ExternalLink size={14} /> Open in new tab
        </a>
      </div>

      <div className="aspect-video rounded-3xl overflow-hidden bg-gray-50 dark:bg-white/5 border border-[#EFEFEF] dark:border-white/10 relative">
        {showAsPdf ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-6 text-center">
            <FileText size={48} className="text-primary-blue" />
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{title}</p>
            <p className="text-xs text-gray-500 max-w-sm break-all">{url}</p>
            <iframe
              title={title}
              src={url}
              className="w-full flex-1 min-h-[200px] rounded-xl border border-gray-100 dark:border-white/10 bg-white"
            />
          </div>
        ) : (
          <img
            src={url}
            alt={title}
            className="w-full h-full object-contain bg-gray-100 dark:bg-black/20"
            onError={() => setImgFailed(true)}
          />
        )}
      </div>
    </div>
  );
}
