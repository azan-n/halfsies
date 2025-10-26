"use client"
import { clsx } from 'clsx'
import {
  type ButtonProps as AriaButtonProps,
  ListBox as AriaListBox,
  type ListBoxProps as AriaListBoxProps,
  type PopoverProps as AriaPopoverProps,
  Select as AriaSelect,
  type SelectProps as AriaSelectProps,
  SelectValue as AriaSelectValue,
  type SelectValueProps as AriaSelectValueProps,
  type ValidationResult as AriaValidationResult,
  composeRenderProps,
  Text,
} from "react-aria-components"


import { FieldError, Label } from "./field"
import {
  ListBoxCollection,
  ListBoxHeader,
  ListBoxItem,
} from "./list-box"
import { Popover } from "./popover"
import { Button } from './button'

const Select = AriaSelect
const SelectItem = ListBoxItem
const SelectHeader = ListBoxHeader
const SelectCollection = ListBoxCollection

const SelectValue = <T extends object>({
  className,
  ...props
}: AriaSelectValueProps<T>) => (
  <AriaSelectValue
    className={composeRenderProps(className, (className) =>
      clsx(
        "line-clamp-1 data-[placeholder]:text-muted-foreground",
        /* Description */
        "[&>[slot=description]]:hidden",
        className
      )
    )}
    {...props}
  />
)

function SelectTrigger({ ...props }: AriaButtonProps) {
  return (<Button {...props} />)
}

const SelectPopover = ({ className, ...props }: AriaPopoverProps) => (
  <Popover
    className={composeRenderProps(className, (className) =>
      clsx("w-[--trigger-width]", className)
    )}
    {...props}
  />
)

const SelectListBox = <T extends object>({
  className,
  ...props
}: AriaListBoxProps<T>) => (
  <AriaListBox
    className={composeRenderProps(className, (className) =>
      clsx(
        "max-h-56 overflow-auto p-1 outline-none",
        className
      )
    )}
    {...props}
  />
)

interface JollySelectProps<T extends object>
  extends Omit<AriaSelectProps<T>, "children"> {
  label?: string
  description?: string
  errorMessage?: string | ((validation: AriaValidationResult) => string)
  items?: Iterable<T>
  children: React.ReactNode | ((item: T) => React.ReactNode)
}

function JollySelect<T extends object>({
  label,
  description,
  errorMessage,
  children,
  className,
  items,
  ...props
}: JollySelectProps<T>) {
  return (
    <Select
      className={composeRenderProps(className, (className) =>
        clsx("group flex flex-col gap-2", className)
      )}
      {...props}
    >
      <Label>{label}</Label>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      {description && (
        <Text className="text-sm text-muted-foreground" slot="description">
          {description}
        </Text>
      )}
      <FieldError>{errorMessage}</FieldError>
      <SelectPopover>
        <SelectListBox items={items}>{children}</SelectListBox>
      </SelectPopover>
    </Select>
  )
}

export {
  Select,
  SelectValue,
  SelectTrigger,
  SelectItem,
  SelectPopover,
  SelectHeader,
  SelectListBox,
  SelectCollection,
  JollySelect,
}
export type { JollySelectProps }
