import clsx from "clsx"
import type { LucideIcon } from "lucide-react"

export function Card({ className, ...props }: React.ComponentProps<'div'>) {
    return <div className={clsx(className, "bg-card p-4 border")} {...props} />
}

export function CardHeader({ icon: Icon, children, className, ...props }: React.ComponentProps<'div'> & { icon: LucideIcon }) {
    return <div className={clsx("flex items-center gap-1 pb-4 mb-4 border-b", className)} {...props}>
        <Icon className="size-4" />
        <h2 className="text-sm uppercase font-mono">{children}</h2>
    </div>

}