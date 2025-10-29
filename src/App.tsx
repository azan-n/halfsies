import { createContext, use, useEffect, useMemo, useState } from "react"
import { Button } from "./components/button";
import { Menu, MenuHeader, MenuItem, MenuPopover, MenuTrigger } from "./components/menu";
import { TextField, Input } from "./components/input";
import { Plus, X, Users, Receipt, List, Coins, Share2, Check } from "lucide-react";
import { Card, CardHeader } from "./components/card";
import { Avatar } from "./components/avatar";
import { encodeUri, decodeUri } from '../lib/encoder'
type Expense = {
  // Name
  n: string;
  // Paid by (index)
  pb: number;
  // Involved parties
  i: number[];
  // Amount
  a: number
  // Percentages of i
  s?: number[]
}

const PEOPLE_SEARCH_KEY = 'p';
const EXPENSE_SEARCH_KEY = 'e';

type ExpenseContextType = {
  people: string[];
  setPeople: React.Dispatch<React.SetStateAction<string[]>>;
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
};
const ExpenseContext = createContext<ExpenseContextType | null>(null);

// Custom hook for easy access
export function useExpenses() {
  const ctx = use(ExpenseContext);
  if (!ctx) {
    throw new Error("useExpenses must be used within an ExpenseProvider");
  }
  return ctx;
};

export function App() {
  const [people, setPeople] = useState<string[]>(['Calra', 'Ankur', 'Nazia']);
  const [expenses, setExpenses] = useState<Expense[]>([{ a: 500, i: [0, 1], n: 'Fuel', pb: 0 }]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const peopleFromParams = params.get(PEOPLE_SEARCH_KEY)
    const expensesFromParams = params.get(EXPENSE_SEARCH_KEY)

    setPeople(decodeUri(peopleFromParams || "[]"))
    setExpenses(decodeUri(expensesFromParams || "[]"))
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();

    params.set(PEOPLE_SEARCH_KEY, encodeUri(people))
    params.set(EXPENSE_SEARCH_KEY, encodeUri(expenses))

    window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`)

  }, [people, expenses])

  // Compute final balances for each person
  const balances = useMemo(() => {
    const bal = Array(people.length).fill(0);

    for (const e of expenses) {
      const { pb, i, a, s } = e;
      const shares =
        s && s.length === i.length
          ? s.map((p) => (p / 100) * a)
          : Array(i.length).fill(a / i.length);

      i.forEach((personIndex, idx) => {
        bal[personIndex] -= shares[idx];
      });

      bal[pb] += a;
    }

    return bal;
  }, [people, expenses]);

  // Compute settlement transactions
  const settlements = useMemo(() => {
    const creditors: { name: string; amount: number }[] = [];
    const debtors: { name: string; amount: number }[] = [];

    balances.forEach((b, i) => {
      if (b > 0) creditors.push({ name: people[i], amount: b });
      else if (b < 0) debtors.push({ name: people[i], amount: -b });
    });

    creditors.sort((a, b) => b.amount - a.amount);
    debtors.sort((a, b) => b.amount - a.amount);

    const txns: { from: string; to: string; amount: number }[] = [];

    let ci = 0;
    let di = 0;

    while (ci < creditors.length && di < debtors.length) {
      const credit = creditors[ci];
      const debt = debtors[di];
      const amount = Math.min(credit.amount, debt.amount);

      txns.push({ from: debt.name, to: credit.name, amount });

      credit.amount -= amount;
      debt.amount -= amount;

      if (credit.amount === 0) ci++;
      if (debt.amount === 0) di++;
    }

    return txns;
  }, [balances, people]);
  return (
    <>
      <ExpenseContext value={{ people, setPeople, expenses, setExpenses }}>
        <nav className='py-2 px-8 border-b flex justify-between items-center gap-4'>
          <span className='font-mono font-black tracking-tighter uppercase select-none'>halfsies<sup className="stacked-fractions">&frac12;</sup> | Split bills with complete privacy. No accounts, no data collection, everything stored in the URL.</span>
          {/* <CopyButton /> */}
        </nav>
        <main className="p-8">
          <article className="grid grid-cols-1 2xl:grid-cols-3 2xl:h-[calc(100vh_-_12em)] gap-4">
            <PeopleManager />
            <ExpenseManager />
            <Card className="min-h-96">
              <CardHeader icon={List}>Settlements</CardHeader>
              <section>
                {settlements.length > 0 ? (
                  <ul>
                    {settlements.map((t, i) => (
                      <li className="grid grid-cols-2" key={i}>
                        <span className="text-muted">{t.from} ➜ {t.to}</span>
                        <span><Coins className="inline size-4 me-1" />{Intl.NumberFormat(navigator.language).format(t.amount)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted">All settled 🎉</p>
                )}
              </section>
            </Card>
          </article>
        </main>
      </ExpenseContext>
      <footer className="border-t p-8">
        <div className="font-mono font-bold uppercase text-xs text-center w-full">Made with love, by <a className="text-indigo-700" href="https://azan-n.com">azan-n</a></div>
      </footer>
    </>
  )
}

function PeopleManager() {
  const [newPersonName, setNewPersonName] = useState('');

  const { setPeople, people, expenses, setExpenses } = useExpenses();

  const addPerson = () => {
    if (newPersonName.trim()) {
      setPeople([...people, newPersonName.trim()]);
      setNewPersonName('');
    }
  };

  const removePerson = (index: number) => {
    setExpenses(expenses.filter(e => e.pb !== index).map(e => ({ ...e, i: e.i.filter(ix => ix !== index) })))
    setPeople(people.filter((_, i) => i !== index));
  };

  return (
    <Card className="flex flex-col min-h-0">
      <CardHeader icon={Users}>People</CardHeader>
      {
        people.length === 0 && <div className="text-muted text-sm">No people here. Use the input field below to add people.</div>
      }
      <div className="flex flex-row flex-wrap gap-4 mb-6 min-h-0 overflow-auto">
        {people.map((name, index) => (
          <PersonPill key={`${name}-${index}`} name={name} action={() => removePerson(index)} />
        ))}
      </div>
      <div className="border-t pt-4 mt-auto">
        <TextField>
          <Input
            placeholder="Enter a name"
            value={newPersonName}
            onChange={(e) => setNewPersonName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addPerson()}
          />
          <Button aria-label="Add person" variant="outline" onPress={addPerson} isDisabled={!newPersonName.trim()}>
            <Plus />
          </Button>
        </TextField>
      </div>
    </Card>
  );
}

function PersonPill({ name, action }: { name: string, action?: () => void }) {
  return <div className="border bg-popover h-12 rounded-full flex justify-between gap-2 items-center">
    <span className="select-none inline-flex items-center"><Avatar className="size-12 me-1" name={name} /><span className="text-muted">{name}</span></span>
    {action && <Button
      onPress={action}
      className="rounded-full h-full size-full"
      aria-label="Remove person"
    >
      <X />
    </Button>}
  </div>;
}

function ExpenseManager() {
  const { people, expenses, setExpenses } = useExpenses();
  const [newExpense, setNewExpense] = useState<Expense>({
    n: "",
    a: 0,
    pb: 0,
    i: people.map((_, i) => i)
  });

  useEffect(() => {
    setNewExpense({ ...newExpense, i: people.map((_, i) => i), pb: 0 })
  }, [people])

  const addExpense = () => {
    setExpenses([...expenses, newExpense]);
    setNewExpense({
      a: 0,
      pb: 0,
      i: people.map((_, i) => i),
      n: ""
    });
  };

  const removeExpense = (index: number) => {
    setExpenses(expenses.filter((_, i) => i !== index));
  };

  return (
    <Card className="flex flex-col min-h-0">
      <CardHeader icon={Receipt}>Expenses</CardHeader>
      <ol className="mb-4 block min-h-0 overflow-auto">
        {expenses.length === 0 && <li className="text-sm text-muted">No expenses recorded.</li>}
        {expenses.map((expense, index) => (
          <li className="flex justify-between gap-8 mb-2 animate-in fade-in slide-in-from-top-5" key={`${expense.a}-${expense.pb}-${index}`}>
            <span className="text-muted">
              <Avatar className="size-8" key={people[expense.pb]} name={people[expense.pb]} /> {people[expense.pb]} paid <span className="tabular-nums inline-flex font-bold items-center gap-1">
                <Coins className="inline stroke-muted size-4" />{Intl.NumberFormat(navigator.language).format(expense.a)}
              </span> {expense.n && <span>for <span className="font-bold">{expense.n}</span></span>} split between <span className="inline-flex items-center">
                {expense.i.map(i => <Avatar className="size-8 not-first:-ms-3 bg-popover" name={people[i]} />)}
              </span> <span>{expense.i.map(i => people[i]).join(', ')}</span>
            </span>
            <Button aria-label="Remove expense" variant="outline" onPress={() => removeExpense(index)}>
              <X />
            </Button>
          </li>
        ))}
      </ol>
      {/* Input */}
      <div className="mt-auto border-t pt-4 flex gap-4 items-end justify-between flex-wrap">
        <Input
          value={newExpense.n}
          className={'max-w-32'}
          placeholder="Expense name"
          onChange={(e) => setNewExpense({ ...newExpense, n: e.target.value })}
        />
        <div className="relative w-32">
          <Coins className="absolute right-2 top-3 opacity-70" />
          <Input
            aria-label="Expense amount"
            type="number"
            style={{ appearance: 'textfield' }}
            value={newExpense.a}
            onChange={(e) => setNewExpense({ ...newExpense, a: parseFloat(e.target.value) })}
          />
        </div>

        <MenuTrigger>
          <Button aria-label="Select person who paid" isDisabled={people.length === 0} key={people[newExpense.pb]} className={'rounded-full px-0 border-0'} variant="outline">
            <Avatar className="size-12" name={people[newExpense.pb]} />
          </Button>
          <MenuPopover>
            <MenuHeader>Paid by</MenuHeader>
            <Menu
              selectionMode="single"
              selectedKeys={[newExpense.pb.toString()]}
              onSelectionChange={(selection) => {
                if (selection !== 'all') {
                  const selected = Array.from(selection)[0];
                  if (selected) {
                    setNewExpense({ ...newExpense, pb: parseInt(selected.toString()) });
                  }
                }
              }}
            >
              {people.map((person, index) => (
                <MenuItem key={`${person}-${index}`} id={index.toString()}>
                  <span className="inline-flex items-center gap-2">
                    <Avatar className="size-8" name={person} /><span>{person}</span>
                  </span>
                </MenuItem>
              ))}
            </Menu>
          </MenuPopover>
        </MenuTrigger>
        <MenuTrigger>
          <Button aria-label="Select people expense is split between" className={'px-0 rounded-full border-0 gap-0 bg-transparent'}>
            {newExpense.i.slice(0, 3).map(i => <Avatar key={`${people[i]}-${i}`} name={people[i]} className="bg-popover size-12 not-first:-ms-4 not-first:z-0" />)}
          </Button>
          <MenuPopover>
            <MenuHeader>Split between</MenuHeader>
            <Menu
              selectionMode="multiple"
              selectedKeys={newExpense.i}
              onSelectionChange={(selection) => {
                if (selection !== 'all') {
                  setNewExpense({ ...newExpense, i: Array.from(selection) as number[] });
                } else {
                  setNewExpense({ ...newExpense, i: people.map((_, i) => i) })
                }
              }}
            >
              {people.map((person, index) => (
                <MenuItem key={`${person}-${index}`} id={index}>
                  <span className="inline-flex items-center gap-2">
                    <Avatar className="size-8" name={person} /><span>{person}</span>
                  </span>
                </MenuItem>
              ))}
            </Menu>
          </MenuPopover>
        </MenuTrigger>

        <Button
          onPress={addExpense}
          variant="outline"
          isDisabled={newExpense.a <= 0 || newExpense.i.length === 0}
          aria-label="Add expense"
        >
          <Plus />
        </Button>
      </div>
    </Card>
  );
}


function CopyButton() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Button
      variant="outline"
      className="h-8"
      onClick={handleCopy}
    >
      {copied ? (
        <>
          Copied <Check />
        </>
      ) : (
        <>
          Share <Share2 />
        </>
      )}
    </Button>
  );
}