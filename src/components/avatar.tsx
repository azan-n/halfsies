import { useMemo } from 'react';
import { createAvatar } from '@dicebear/core';
import { openPeeps } from '@dicebear/collection';
import clsx from 'clsx';

export function Avatar({ name, className }: { name: string, className?: string }) {
    const Svg = useMemo(() => {
        return createAvatar(openPeeps, {
            seed: name,
        }).toString();
    }, []);

    return <span className={clsx('inline-flex overflow-hidden items-center rounded-full border', className)} dangerouslySetInnerHTML={{__html: Svg}} />;
}