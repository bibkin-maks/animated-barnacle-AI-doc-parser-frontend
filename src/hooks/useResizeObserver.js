import { useState, useRef, useEffect } from 'react';

export default function useResizeObserver() {
    const [size, setSize] = useState({ width: 0, height: 0 });
    const ref = useRef(null);

    useEffect(() => {
        if (!ref.current) return;
        const observer = new ResizeObserver((entries) => {
            const entry = entries[0];
            // Use contentRect for precise content box size
            setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
        });
        observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return [ref, size];
}
