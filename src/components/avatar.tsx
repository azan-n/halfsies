import { useMemo } from 'react';
import { createAvatar } from '@dicebear/core';
import { lorelei } from '@dicebear/collection';

export function Avatar({ name, className }: { name: string, className?: string }) {
    const Svg = useMemo(() => {
        return createAvatar(lorelei, {
            seed: name,
        }).toString();
    }, []);

    return <span className={className} dangerouslySetInnerHTML={{__html: Svg}} />;
}