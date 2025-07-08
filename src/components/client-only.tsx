"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * A component that only renders its children on the client side, after the initial mount.
 * This is useful for components that rely on browser-specific APIs or hooks that are
 * not compatible with Server-Side Rendering or Static Site Generation.
 * @param {object} props
 * @param {ReactNode} props.children The content to render on the client.
 * @param {ReactNode} [props.fallback] A fallback to render on the server and during initial client render.
 */
export function ClientOnly({ children, fallback }: { children: ReactNode, fallback?: ReactNode }) {
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    if (!hasMounted) {
        return <>{fallback}</> || null;
    }

    return <>{children}</>;
}
