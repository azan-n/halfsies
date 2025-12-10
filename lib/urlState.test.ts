import { describe, it, expect, beforeEach, vi } from "vitest";
import { loadStateFromURL } from "./urlState";
import { encodeUriBase64, encodeUriJson } from "./encoder";

describe("urlState", () => {
  // Mock window.history.replaceState
  beforeEach(() => {
    global.window = {
      history: {
        replaceState: vi.fn(),
      },
    } as any;
  });

  describe("loadStateFromURL", () => {
    it("should load state from hash parameters", () => {
      const people = ["Alice", "Bob"];
      const expenses = [{ n: "Fuel", pb: 0, i: [0, 1], a: 500 }];

      const mockLocation: Location = {
        search: "",
        hash: `#p=${encodeUriBase64(people)}&e=${encodeUriBase64(expenses)}`,
        pathname: "/",
      };

      const result = loadStateFromURL(mockLocation);

      expect(result.people).toEqual(people);
      expect(result.expenses).toEqual(expenses);
    });

    it("should return empty arrays when no parameters present", () => {
      const mockLocation = {
        search: "",
        hash: "",
        pathname: "/",
      } as Location;

      const result = loadStateFromURL(mockLocation);

      expect(result.people).toEqual([]);
      expect(result.expenses).toEqual([]);
    });

    it("should handle complex nested data structures", () => {
      const people = ["Alice", "Bob", "Charlie"];
      const expenses = [
        { n: "Fuel", pb: 0, i: [0, 1], a: 500 },
        { n: "Food", pb: 1, i: [0, 1, 2], a: 1200, s: [33, 33, 34] },
      ];

      const mockLocation = {
        search: "",
        hash: `#p=${encodeUriBase64(people)}&e=${encodeUriBase64(expenses)}`,
        pathname: "/",
      } as Location;

      const result = loadStateFromURL(mockLocation);

      expect(result.people).toEqual(people);
      expect(result.expenses).toEqual(expenses);
    });

    describe("backward compatibility - query params migration", () => {
      it("should migrate from old query params format to hash", () => {
        const people = ["Alice", "Bob"];
        const expenses = [{ n: "Fuel", pb: 0 }];

        // Old format: percent-encoded query params
        const oldPeopleParam = encodeURIComponent(JSON.stringify(people));
        const oldExpensesParam = encodeURIComponent(JSON.stringify(expenses));

        const mockLocation = {
          search: `?p=${oldPeopleParam}&e=${oldExpensesParam}`,
          hash: "",
          pathname: "/test",
        } as Location;

        const result = loadStateFromURL(mockLocation);

        // Should return correct data
        expect(result.people).toEqual(people);
        expect(result.expenses).toEqual(expenses);

        // Should have migrated to hash format
        expect(window.history.replaceState).toHaveBeenCalledWith(
          {},
          "",
          expect.stringContaining("/test#p="),
        );
      });

      it("should migrate complex data from query params", () => {
        const people = ["Alice", "Bob", "Charlie"];
        const expenses = [
          { n: "Fuel", pb: 0, i: [0, 1], a: 500 },
          { n: "Food", pb: 1, i: [0, 1, 2], a: 1200 },
        ];

        const oldPeopleParam = encodeURIComponent(JSON.stringify(people));
        const oldExpensesParam = encodeURIComponent(JSON.stringify(expenses));

        const mockLocation = {
          search: `?p=${oldPeopleParam}&e=${oldExpensesParam}`,
          hash: "",
          pathname: "/",
        } as Location;

        const result = loadStateFromURL(mockLocation);

        expect(result.people).toEqual(people);
        expect(result.expenses).toEqual(expenses);
        expect(window.history.replaceState).toHaveBeenCalled();
      });

      it("should not migrate if only one param is present in query", () => {
        const oldPeopleParam = encodeURIComponent(JSON.stringify(["Alice"]));

        const mockLocation = {
          search: `?p=${oldPeopleParam}`,
          hash: "",
          pathname: "/",
        } as Location;

        const result = loadStateFromURL(mockLocation);

        // Should not migrate (requires both params)
        expect(window.history.replaceState).not.toHaveBeenCalled();

        // Should return empty arrays
        expect(result.people).toEqual([]);
        expect(result.expenses).toEqual([]);
      });

      it("should prioritize query over hash when both present", () => {
        const hashPeople = ["Alice", "Bob"];
        const hashExpenses = [{ n: "Fuel", pb: 0, a: 500 }];

        const queryPeople = ["Old1", "Old2"];
        const queryExpenses = [{ n: "OldExpense", pb: 0 }];

        const mockLocation = {
          search: `?p=${encodeUriJson(queryPeople)}&e=${encodeUriJson(queryExpenses)}`,
          hash: `#p=${encodeUriBase64(hashPeople)}&e=${encodeUriBase64(hashExpenses)}`,
          pathname: "/",
        } as Location;

        // When both are present, query params trigger migration first
        const result = loadStateFromURL(mockLocation);

        expect(result.people).toEqual(queryPeople);
        expect(result.expenses).toEqual(queryExpenses);
      });
    });

    describe("edge cases", () => {
      it("should handle empty arrays in parameters", () => {
        const mockLocation = {
          search: "",
          hash: `#p=${encodeUriBase64([])}&e=${encodeUriBase64([])}`,
          pathname: "/",
        } as Location;

        const result = loadStateFromURL(mockLocation, "p", "e");

        expect(result.people).toEqual([]);
        expect(result.expenses).toEqual([]);
      });

      it("should handle special characters in data", () => {
        const people = ["Alice O'Brien", "Bob & Charlie"];
        const expenses = [{ n: "Café / Restaurant", pb: 0 }];

        const mockLocation = {
          search: "",
          hash: `#p=${encodeUriBase64(people)}&e=${encodeUriBase64(expenses)}`,
          pathname: "/",
        } as Location;

        const result = loadStateFromURL(mockLocation, "p", "e");

        expect(result.people).toEqual(people);
        expect(result.expenses).toEqual(expenses);
      });

      it("should handle malformed hash gracefully", () => {
        const mockLocation = {
          search: "",
          hash: "#invalid-hash-format",
          pathname: "/",
        } as Location;

        const result = loadStateFromURL(mockLocation);

        expect(result.people).toEqual([]);
        expect(result.expenses).toEqual([]);
      });
    });
  });
});
