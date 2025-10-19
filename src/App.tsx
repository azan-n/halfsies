import { useMemo, useState } from "react"
import { Button } from "./components/button";
import { Menu, MenuItem, MenuPopover, MenuTrigger } from "./components/menu";
import { Label, FieldGroup, FieldError } from "./components/field";
import { TextField, Input } from "./components/input";
import { Plus, X, Users, Receipt, Users2, List } from "lucide-react";
import { Card, CardHeader } from "./components/card";
import { Avatar } from "./components/avatar";

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
      <nav className='py-2 px-8 border-b flex justify-between items-center'>
        <span className='font-mono font-black tracking-tighter uppercase'>halfsies</span>
        <CurrencyPicker currency={currency} setCurrency={(c) => setCurrency(c)} />
      </nav>
      <main className="px-8 py-6">
        <article className="grid grid-cols-2 gap-8">
          <PeopleManager people={people} setPeople={setPeople} />
          <ExpenseManager
            people={people}
            expenses={expenses}
            setExpenses={setExpenses}
            formatter={formatter}
          />
          <Card className="col-span-2 h-96">
            <CardHeader icon={List}>Balance</CardHeader>
          </Card>
        </article>
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

function PeopleManager({ people, setPeople }: {
  people: string[],
  setPeople: (people: string[]) => void
}) {
  const [newPersonName, setNewPersonName] = useState('');

  const addPerson = () => {
    if (newPersonName.trim()) {
      setPeople([...people, newPersonName.trim()]);
      setNewPersonName('');
    }
  };

  const removePerson = (index: number) => {
    setPeople(people.filter((_, i) => i !== index));
  };

  return (
    <Card className="grid grid-rows-subgrid grid-cols-1 row-span-3 gap-2">
      <CardHeader icon={Users}>People</CardHeader>
      {
        people.length === 0 && <div className="text-muted text-sm">No people added yet.</div>
      }
      <div className="flex flex-row flex-wrap gap-4 mb-8">
        {people.map((name, index) => (
          <UserPill key={`${name}-${index}`} name={name} action={() => removePerson(index)} />
        ))}
      </div>
      <div className="flex flex-col justify-end">
        <TextField>
          <Input
            value={newPersonName}
            onChange={(e) => setNewPersonName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addPerson()}
          />
          <Button variant="outline" onPress={addPerson} isDisabled={!newPersonName.trim()}>
            <Plus /> Add a person
          </Button>
        </TextField>
      </div>
    </Card>
  );
}

function UserPill({ name, action }: { name: string, action: () => void }) {
  return <div className="ps-2 border h-12 bg-popover rounded-full flex justify-between gap-3 items-center">
    <span className="select-none inline-flex items-center"><Avatar className="size-10" name={name} /><span className="text-muted">{name}</span></span>
    <Button
      onPress={action}
      className="rounded-full h-full"
    >
      <X className="size-4" />
    </Button>
  </div>;
}

function ExpenseManager({
  people,
  expenses,
  setExpenses,
  formatter
}: {
  people: string[],
  expenses: Expense[],
  setExpenses: (expenses: Expense[]) => void,
  formatter: Intl.NumberFormat
}) {
  const [newExpense, setNewExpense] = useState({
    amount: 0,
    paidBy: 0,
    involvedParties: people.map((_, i) => i)
  });

  const addExpense = () => {
    const amount = newExpense.amount;
    if (amount > 0 && newExpense.involvedParties.length > 0) {
      const expense: Expense = {
        pb: newExpense.paidBy,
        i: newExpense.involvedParties,
        a: amount
      };

      setExpenses([...expenses, expense]);
      setNewExpense({
        amount: 0,
        paidBy: 0,
        involvedParties: people.map((_, i) => i)
      });
    }
  };

  const removeExpense = (index: number) => {
    setExpenses(expenses.filter((_, i) => i !== index));
  };

  return (
    <Card className="grid grid-cols-1 grid-rows-subgrid row-span-3 gap-2">
      <CardHeader icon={Receipt}>Expenses</CardHeader>

      <ol>
        {expenses.length === 0 && <span className="text-sm text-muted">No expenses recorded</span>}
        {expenses.map((expense, index) => (
          <li className="grid grid-cols-2 body-sm items-center gap-8 mb-4" key={index}>
            <UserPill name={people[expense.pb]} action={() => removeExpense(index)} />
            <span className="tabular-nums">
              {formatter.format(expense.a)}
            </span>
          </li>
        ))}
      </ol>

      <div className="flex gap-4 items-end">
        <div className="flex flex-col gap-1">
          <Label>Amount</Label>
          <Input
            type="number"
            placeholder="0.00"
            value={newExpense.amount}
            onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) })}
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label>Paid by</Label>
          <MenuTrigger>
            <Button variant="outline">
              {people[newExpense.paidBy] && <span className="flex items-center">{people[newExpense.paidBy]}</span>}
            </Button>
            <MenuPopover>
              <Menu
                selectionMode="single"
                selectedKeys={[newExpense.paidBy]}
                onSelectionChange={(selection) => {
                  if (selection !== 'all') {
                    const selected = Array.from(selection)[0];
                    if (selected) {
                      setNewExpense({ ...newExpense, paidBy: parseInt(selected.toString()) });
                    }
                  }
                }}
              >
                {people.map((person, index) => (
                  <MenuItem key={index} id={index}>
                    {person}
                  </MenuItem>
                ))}
              </Menu>
            </MenuPopover>
          </MenuTrigger>
        </div>

        <div className="flex flex-col gap-1">
          <Label>Split between</Label>
          <MenuTrigger>
            <Button variant="outline">
              {newExpense.involvedParties.map(i => people[i]).join(', ')}
            </Button>
            <MenuPopover>
              <Menu
                selectionMode="multiple"
                selectedKeys={newExpense.involvedParties}
                onSelectionChange={(selection) => {
                  if (selection !== 'all') {
                    setNewExpense({ ...newExpense, involvedParties: Array.from(selection) as number[] });
                  } else {
                    setNewExpense({ ...newExpense, involvedParties: people.map((_, i) => i) })
                  }
                }}
              >
                <MenuItem onPress={() => setNewExpense({ ...newExpense, involvedParties: people.map((_, i) => i) })}><em>select all</em></MenuItem>
                {people.map((person, index) => (
                  <MenuItem key={`${person}-${index}`} id={index}>
                    {person}
                  </MenuItem>
                ))}
              </Menu>
            </MenuPopover>
          </MenuTrigger>
        </div>

        <Button
          onPress={addExpense}
          variant="outline"
          isDisabled={newExpense.amount <= 0 || newExpense.involvedParties.length === 0}
        >
          <Plus />
          Add an expense
        </Button>
      </div>
    </Card>
  );
}

