import { encodeUriBase64, decodeUriBase64, decodeUriJson } from "./encoder";
import type { Expense } from "../src/App";

export const PEOPLE_SEARCH_KEY = "p";
export const EXPENSE_SEARCH_KEY = "e";

export type URLStateResult = {
  people: string[];
  expenses: Expense[];
};

/**
 * Loads state from URL (hash or query params) and migrates old format to new format
 * @param location - window.location object (or mock for testing)
 * @param peopleKey - URL parameter key for people
 * @param expenseKey - URL parameter key for expenses
 * @returns Object containing people and expenses arrays
 */
export function loadStateFromURL(): URLStateResult {
  // Check if we have old query params that need migration
  if (window.location.search) {
    const queryParams = new URLSearchParams(window.location.search);
    const queryParamPeople = queryParams.get(PEOPLE_SEARCH_KEY);
    const queryParamExpenses = queryParams.get(EXPENSE_SEARCH_KEY);

    if (queryParamPeople && queryParamExpenses) {
      // Migrate from query params to hash
      const params = new URLSearchParams();
      params.set(
        PEOPLE_SEARCH_KEY,
        encodeUriBase64(decodeUriJson(queryParamPeople)),
      );
      params.set(
        EXPENSE_SEARCH_KEY,
        encodeUriBase64(decodeUriJson(queryParamExpenses)),
      );

      // Clean URL by removing query params and using hash
      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}#${params.toString()}`,
      );
    }
  }

  const hash = window.location.hash.slice(1); // Remove the '#'
  const hashParams = new URLSearchParams(hash);
  const peopleFromParams = hashParams.get(PEOPLE_SEARCH_KEY);
  const expensesFromParams = hashParams.get(EXPENSE_SEARCH_KEY);

  return {
    people: decodeUriBase64(peopleFromParams || "[]"),
    expenses: decodeUriBase64(expensesFromParams || "[]"),
  };
}
