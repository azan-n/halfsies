import { useMemo, useState } from "react"
import { Button } from "./components/button";
import { Menu, MenuItem, MenuPopover, MenuTrigger } from "./components/menu";

type Expense = {
  // Paid by (index)
  pb: number;
  // Involved parties
  i: number[];
  // Amount
  a: number
  // Percentages of i
  s?: number[]
}

const getCurrencyFormatter = (currencyCode: string) => Intl.NumberFormat(navigator.language, {
  style: 'currency',
  currency: currencyCode,
  currencyDisplay: 'symbol'
})
const supportedCurrencies = Intl.supportedValuesOf('currency');

export function App() {
  const [people, setPeople] = useState<string[]>(['Calra', 'Ankur', 'Azan']);
  const [currency, setCurrency] = useState<string>(supportedCurrencies[0]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const formatter = getCurrencyFormatter(currency);
  return (
    <>
      <nav className='py-2 px-8 border-b'>
        <span className='font-mono font-black tracking-tighter'>halfsies</span>
      </nav>
      <main className="px-8 py-6">
        <CurrencyPicker currency={currency} setCurrency={(c) => setCurrency(c)} />
      </main>
    </>
  )
}


function CurrencyPicker({ currency, setCurrency }: { currency: string, setCurrency: (c: string) => void }) {

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
    return <>{currencyItems.map((items) => <MenuItem className='cursor-pointer' id={items.code}>{items.code}</MenuItem>)}</>
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

