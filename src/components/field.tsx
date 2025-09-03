import clsx from "clsx"
import {
  FieldError as AriaFieldError,
  type FieldErrorProps as AriaFieldErrorProps,
  Group as AriaGroup,
  type GroupProps as AriaGroupProps,
  Label as AriaLabel,
  type LabelProps as AriaLabelProps,
  Text as AriaText,
  type TextProps as AriaTextProps,
  composeRenderProps,
} from "react-aria-components"

export function Label({ className, ...props }: AriaLabelProps) {
  return (
    <AriaLabel className={clsx(
      "text-sm font-medium leading-none",
      /* Disabled */
      "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-70",
      /* Invalid */
      "group-data-[invalid]:text-destructive", className)} {...props} />
  )
}

export function FormDescription({ className, ...props }: AriaTextProps) {
  return (
    <AriaText
      className={clsx("text-sm text-muted-foreground", className)}
      {...props}
      slot="description"
    />
  )
}

export function FieldError({ className, ...props }: AriaFieldErrorProps) {
  return (
    <AriaFieldError
      className={clsx("text-sm font-medium text-destructive", className)}
      {...props}
    />
  )
}


interface GroupProps
  extends AriaGroupProps { }

export function FieldGroup({ className, ...props }: GroupProps) {
  return (
    <AriaGroup
      className={composeRenderProps(className, (className) =>
        clsx("relative flex h-10 w-full items-center overflow-hidden border border-input bg-background px-3 py-2 text-sm ring-offset-background",
          /* Focus Within */
          "data-[focus-within]:outline-none data-[focus-within]:ring-2 data-[focus-within]:ring-ring data-[focus-within]:ring-offset-2",
          /* Disabled */
          "data-[disabled]:opacity-50", className)
      )}
      {...props}
    />
  )
}
