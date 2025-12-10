import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { loadStateFromURL } from "./urlState";
import { encodeUriBase64, encodeUriJson } from "./encoder";

describe("urlState", () => {
  let originalLocation: Location;
  let mockReplaceState: ReturnType<typeof vi.fn>;

  // Helper to mock window.location
  const mockLocation = (props: { search?: string; hash?: string; pathname?: string }) => {
    Object.defineProperty(window, 'location', {
      value: {
        search: props.search || "",
        hash: props.hash || "",
        pathname: props.pathname || "/",
      },
      writable: true,
      configurable: true,
    });
  };

  beforeEach(() => {
    originalLocation = window.location;
    mockReplaceState = vi.fn();

    // Mock history.replaceState
    Object.defineProperty(window, 'history', {
      value: { replaceState: mockReplaceState },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    // Restore original location
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
  });

  describe("loadStateFromURL", () => {
    it("should load state from hash parameters", () => {
      const people = ["Alice", "Bob"];
      const expenses = [{ n: "Fuel", pb: 0, i: [0, 1], a: 500 }];

      mockLocation({
        hash: `#p=${encodeUriBase64(people)}&e=${encodeUriBase64(expenses)}`,
      });

      const result = loadStateFromURL();

      expect(result.people).toEqual(people);
      expect(result.expenses).toEqual(expenses);
    });

    it("should return empty arrays when no parameters present", () => {
      mockLocation({});

      const result = loadStateFromURL();

      expect(result.people).toEqual([]);
      expect(result.expenses).toEqual([]);
    });

    it("should handle complex nested data structures", () => {
      const people = ["Alice", "Bob", "Charlie"];
      const expenses = [
        { n: "Fuel", pb: 0, i: [0, 1], a: 500 },
        { n: "Food", pb: 1, i: [0, 1, 2], a: 1200, s: [33, 33, 34] },
      ];

      mockLocation({
        hash: `#p=${encodeUriBase64(people)}&e=${encodeUriBase64(expenses)}`,
      });

      const result = loadStateFromURL();

      expect(result.people).toEqual(people);
      expect(result.expenses).toEqual(expenses);
    });

    describe("backward compatibility - query params migration", () => {
      it("should migrate from old query params format to hash", () => {
        const people = ["Alice", "Bob"];
        const expenses = [{ n: "Fuel", pb: 0 }];

        const oldPeopleParam = encodeURIComponent(JSON.stringify(people));
        const oldExpensesParam = encodeURIComponent(JSON.stringify(expenses));

        mockLocation({
          search: `?p=${oldPeopleParam}&e=${oldExpensesParam}`,
          pathname: "/test",
        });

        const result = loadStateFromURL();

        // Should return correct data
        expect(result.people).toEqual(people);
        expect(result.expenses).toEqual(expenses);

        // Should have migrated to hash format
        expect(mockReplaceState).toHaveBeenCalledWith(
          {},
          "",
          expect.stringContaining("/test#p=")
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

        mockLocation({
          search: `?p=${oldPeopleParam}&e=${oldExpensesParam}`,
        });

        const result = loadStateFromURL();

        expect(result.people).toEqual(people);
        expect(result.expenses).toEqual(expenses);
        expect(mockReplaceState).toHaveBeenCalled();
      });

      it("should not migrate if only one param is present in query", () => {
        const oldPeopleParam = encodeURIComponent(JSON.stringify(["Alice"]));

        mockLocation({
          search: `?p=${oldPeopleParam}`,
        });

        const result = loadStateFromURL();

        // Should not migrate (requires both params)
        expect(mockReplaceState).not.toHaveBeenCalled();

        // Should return empty arrays
        expect(result.people).toEqual([]);
        expect(result.expenses).toEqual([]);
      });

      it("should prioritize query over hash when both present", () => {
        const hashPeople = ["Alice", "Bob"];
        const hashExpenses = [{ n: "Fuel", pb: 0, a: 500 }];

        const queryPeople = ["Old1", "Old2"];
        const queryExpenses = [{ n: "OldExpense", pb: 0 }];

        mockLocation({
          search: `?p=${encodeUriJson(queryPeople)}&e=${encodeUriJson(queryExpenses)}`,
          hash: `#p=${encodeUriBase64(hashPeople)}&e=${encodeUriBase64(hashExpenses)}`,
        });

        // When both are present, query params trigger migration first
        const result = loadStateFromURL();

        expect(result.people).toEqual(queryPeople);
        expect(result.expenses).toEqual(queryExpenses);
      });
    });

    describe("edge cases", () => {
      it("should handle empty arrays in parameters", () => {
        mockLocation({
          hash: `#p=${encodeUriBase64([])}&e=${encodeUriBase64([])}`,
        });

        const result = loadStateFromURL();

        expect(result.people).toEqual([]);
        expect(result.expenses).toEqual([]);
      });

      it("should handle special characters in data", () => {
        const people = ["Alice O'Brien", "Bob & Charlie"];
        const expenses = [{ n: "Café / Restaurant", pb: 0 }];

        mockLocation({
          hash: `#p=${encodeUriBase64(people)}&e=${encodeUriBase64(expenses)}`,
        });

        const result = loadStateFromURL();

        expect(result.people).toEqual(people);
        expect(result.expenses).toEqual(expenses);
      });

      it("should handle malformed hash gracefully", () => {
        mockLocation({
          hash: "#invalid-hash-format",
        });

        const result = loadStateFromURL();

        expect(result.people).toEqual([]);
        expect(result.expenses).toEqual([]);
      });
    });
  });
});
