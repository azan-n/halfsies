import { describe, it, expect } from "vitest";
import { encodeUriBase64, decodeUriBase64 } from "./encoder";

describe("encoder", () => {
  describe("encodeUriBase64", () => {
    it("should encode simple arrays", () => {
      const data = ["Alice", "Bob", "Charlie"];
      const encoded = encodeUriBase64(data);
      expect(encoded).toBeTruthy();
      expect(encoded).not.toContain("%"); // Base64, not percent-encoded
    });

    it("should encode objects with various fields", () => {
      const data = { n: "Fuel", pb: 0, i: [0, 1], a: 500 };
      const encoded = encodeUriBase64(data);
      expect(encoded).toBeTruthy();
      expect(encoded).not.toContain("%");
    });

    it("should encode arrays of objects", () => {
      const data = [
        { n: "Fuel", pb: 0, i: [0, 1], a: 500 },
        { n: "Food", pb: 1, i: [0, 1, 2], a: 1200 },
      ];
      const encoded = encodeUriBase64(data);
      expect(encoded).toBeTruthy();
      expect(encoded).not.toContain("%");
    });

    it("should produce URL-safe base64", () => {
      const data = { test: "data with spaces and special chars: !@#$%" };
      const encoded = encodeUriBase64(data);
      // URL-safe base64 uses - and _ instead of + and /
      expect(encoded).not.toContain("+");
      expect(encoded).not.toContain("/");
      expect(encoded).not.toContain("="); // No padding
    });
  });

  describe("decodeUriBase64", () => {
    it("should decode base64 encoded data", () => {
      const original = ["Alice", "Bob", "Charlie"];
      const encoded = encodeUriBase64(original);
      const decoded = decodeUriBase64(encoded);
      expect(decoded).toEqual(original);
    });

    it("should decode complex nested structures", () => {
      const original = [
        { n: "Fuel", pb: 0, i: [0, 1], a: 500 },
        { n: "Food", pb: 1, i: [0, 1, 2], a: 1200, s: [33, 33, 34] },
      ];
      const encoded = encodeUriBase64(original);
      const decoded = decodeUriBase64(encoded);
      expect(decoded).toEqual(original);
    });

    it("should handle empty arrays", () => {
      const original: any[] = [];
      const encoded = encodeUriBase64(original);
      const decoded = decodeUriBase64(encoded);
      expect(decoded).toEqual(original);
    });
  });

  // describe("backward compatibility", () => {
  //   it("should decode old percent-encoded format", () => {
  //     // Old format: percent-encoded JSON
  //     const oldEncoded = "%5B%22Alice%22%2C%22Bob%22%2C%22Charlie%22%5D";
  //     const decoded = decodeUriBase64(oldEncoded);
  //     expect(decoded).toEqual(["Alice", "Bob", "Charlie"]);
  //   });

  //   it("should decode old percent-encoded objects", () => {
  //     // Old format for: {"n":"Fuel","pb":0,"i":[0,1],"a":500}
  //     const oldEncoded =
  //       "%7B%22n%22%3A%22Fuel%22%2C%22pb%22%3A0%2C%22i%22%3A%5B0%2C1%5D%2C%22a%22%3A500%7D";
  //     const decoded = decodeUriBase64(oldEncoded);
  //     expect(decoded).toEqual({ n: "Fuel", pb: 0, i: [0, 1], a: 500 });
  //   });

  //   it("should decode old percent-encoded arrays of objects", () => {
  //     // Old format for: [{"n":"Fuel","pb":0}]
  //     const oldEncoded = "%5B%7B%22n%22%3A%22Fuel%22%2C%22pb%22%3A0%7D%5D";
  //     const decoded = decodeUriBase64(oldEncoded);
  //     expect(decoded).toEqual([{ n: "Fuel", pb: 0 }]);
  //   });

  //   it("should handle invalid input gracefully", () => {
  //     const decoded = decodeUriBase64("invalid!!!garbage");
  //     expect(decoded).toEqual([]); // Fallback to empty array
  //   });

  //   it("should handle empty string", () => {
  //     const decoded = decodeUriBase64("");
  //     expect(decoded).toEqual([]);
  //   });
  // });

  describe("round-trip encoding", () => {
    it("should maintain data integrity through encode/decode cycle", () => {
      const testCases = [
        ["Alice", "Bob"],
        [{ n: "Test", pb: 0, i: [0], a: 100 }],
        [
          { n: "Fuel", pb: 0, i: [0, 1], a: 500 },
          { n: "Food", pb: 1, i: [0, 1, 2], a: 1200, s: [33, 33, 34] },
        ],
        [],
        [""],
        [{ n: "", pb: 0, i: [], a: 0 }],
      ];

      testCases.forEach((testCase) => {
        const encoded = encodeUriBase64(testCase);
        const decoded = decodeUriBase64(encoded);
        expect(decoded).toEqual(testCase);
      });
    });
  });

  describe("size comparison", () => {
    it("should produce smaller output than percent-encoding", () => {
      const data = [
        { n: "Fuel", pb: 0, i: [0, 1], a: 500 },
        { n: "Food", pb: 1, i: [0, 1, 2], a: 1200 },
      ];

      const newEncoded = encodeUriBase64(data);
      const oldEncoded = encodeURIComponent(JSON.stringify(data));

      expect(newEncoded.length).toBeLessThan(oldEncoded.length);
      // Should be significantly smaller (around 40% savings or better)
      expect(newEncoded.length / oldEncoded.length).toBeLessThan(0.65);
    });
  });
});
