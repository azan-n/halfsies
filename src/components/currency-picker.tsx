import { MenuTrigger } from "react-aria-components";
import { Button } from "./button";
import { Menu, MenuItem, MenuPopover } from "./menu";
import { useMemo } from "react";

export const getCurrencyFormatter = (currencyCode: string) => Intl.NumberFormat(navigator.language, {
  style: 'currency',
  currency: currencyCode,
  currencyDisplay: 'symbol'
})
const supportedCurrencies = Intl.supportedValuesOf('currency');


export function CurrencyPicker({ currency, setCurrency }: { currency: string, setCurrency: (c: string) => void }) {

  const currencyItems = useMemo(() => {
    return supportedCurrencies.map(c => {
      const formattedName = Intl.NumberFormat(navigator.language, {
        style: 'currency',
        currency: c,
        currencyDisplay: 'name'
      }).format(0);

      return {
        code: c,
        formattedName: formattedName
      }
    })
  }, [])

  const CurrencyItems = useMemo(() => {
    return <>{currencyItems.map((items) => <MenuItem className='btn' id={items.code}>{items.code}</MenuItem>)}</>
  }, [currencyItems])

  return <MenuTrigger>
    <Button>{currency}</Button>
    <MenuPopover>
      <Menu
        selectionMode="single"
        selectedKeys={currency}
        onSelectionChange={(s) => {
          if (s === 'all') return null;

          const value = Array.from(s)[0];
          if (value && typeof value === 'string') {
            setCurrency(value);
          }
        }}
      >
        {CurrencyItems}
      </Menu>
    </MenuPopover>
  </MenuTrigger>;
}