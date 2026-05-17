import { useEffect } from 'react';

type PageMeta = {
    title: string;
    description: string;
};

export function usePageMeta({ title, description }: PageMeta) {
    useEffect(() => {
        const previousTitle = document.title;
        document.title = title;

        let meta = document.querySelector('meta[name="description"]');
        const created = !meta;
        if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute('name', 'description');
            document.head.appendChild(meta);
        }
        const previousDescription = meta.getAttribute('content');
        meta.setAttribute('content', description);

        return () => {
            document.title = previousTitle;
            if (created) {
                meta?.remove();
            } else if (previousDescription) {
                meta?.setAttribute('content', previousDescription);
            }
        };
    }, [title, description]);
}
