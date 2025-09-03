import * as React from "react"
import { Check, ChevronRight, Circle } from "lucide-react"
import {
  Header as AriaHeader,
  Keyboard as AriaKeyboard,
  Menu as AriaMenu,
  MenuItem as AriaMenuItem,
  type MenuItemProps as AriaMenuItemProps,
  type MenuProps as AriaMenuProps,
  MenuTrigger as AriaMenuTrigger,
  type MenuTriggerProps as AriaMenuTriggerProps,
  Separator as AriaSeparator,
  type SeparatorProps as AriaSeparatorProps,
  SubmenuTrigger as AriaSubmenuTrigger,
  composeRenderProps,
  type PopoverProps,
} from "react-aria-components"

import { clsx } from "clsx"

import { Button } from "./button"
import { ListBoxCollection } from "./list-box"
import { SelectPopover } from "./select"

export const MenuTrigger = AriaMenuTrigger
export const MenuSubTrigger = AriaSubmenuTrigger
export const MenuCollection = ListBoxCollection

export function MenuPopover({ className, ...props }: PopoverProps) {
  return (
    <SelectPopover
      className={composeRenderProps(className, (className) =>
        clsx("w-auto", className)
      )}
      {...props}
    />
  )
}

export function Menu<T extends object>({ className, ...props }: AriaMenuProps<T>) {
  return (
    <AriaMenu
      className={clsx(
        "max-h-56 overflow-auto p-1 outline-none",
        className
      )}
      {...props}
    />
  )
}

export function MenuItem({ children, className, ...props }: AriaMenuItemProps) {
  return (
    <AriaMenuItem
      textValue={
        props.textValue || (typeof children === "string" ? children : undefined)
      }
      className={composeRenderProps(className, (className) =>
        clsx(
          "relative flex select-none items-center gap-2 px-2 py-1.5 text-sm outline-none transition-colors",
          /* Disabled */
          "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
          /* Focused */
          "data-[focused]:bg-accent data-[focused]:text-accent-foreground ",
          /* Selection Mode */
          "data-[selection-mode]:pl-8",
          className
        )
      )}
      {...props}
    >
      {composeRenderProps(children, (children, renderProps) => (
        <>
          <span className="absolute left-2 flex size-4 items-center justify-center">
            {renderProps.isSelected && (
              <>
                {renderProps.selectionMode == "single" && (
                  <Circle className="size-2 fill-current" />
                )}
                {renderProps.selectionMode == "multiple" && (
                  <Check className="size-4" />
                )}
              </>
            )}
          </span>

          {children}

          {renderProps.hasSubmenu && <ChevronRight className="ml-auto size-4" />}
        </>
      ))}
    </AriaMenuItem>
  )
}

interface MenuHeaderProps extends React.ComponentProps<typeof AriaHeader> {
  inset?: boolean
  separator?: boolean
}

export function MenuHeader({
  className,
  inset,
  separator = true,
  ...props
}: MenuHeaderProps) {
  return (
    <AriaHeader
      className={clsx(
        "px-3 py-1.5 text-sm font-semibold",
        inset && "pl-8",
        separator && "-mx-1 mb-1 border-b border-b-border pb-2.5",
        className
      )}
      {...props}
    />
  )
}

export function MenuSeparator({ className, ...props }: AriaSeparatorProps) {
  return (
    <AriaSeparator
      className={clsx("-mx-1 my-1 h-px bg-muted", className)}
      {...props}
    />
  )
}

export function MenuKeyboard({
  className,
  ...props
}: React.ComponentProps<typeof AriaKeyboard>) {
  return (
    <AriaKeyboard
      className={clsx("ml-auto text-xs tracking-widest opacity-60", className)}
      {...props}
    />
  )
}
interface JollyMenuProps<T>
  extends AriaMenuProps<T>,
  Omit<AriaMenuTriggerProps, "children"> {
  label?: string
}
export function JollyMenu<T extends object>({
  label,
  children,
  ...props
}: JollyMenuProps<T>) {
  return (
    <MenuTrigger {...props}>
      <Button>
        {label}
      </Button>
      <MenuPopover className="min-w-[--trigger-width]">
        <Menu {...props}>{children}</Menu>
      </MenuPopover>
    </MenuTrigger>
  )
}