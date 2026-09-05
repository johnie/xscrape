import { describe, expect, test, vi } from "vitest";

// Import examples inside tests so their user-facing logs can be observed without cluttering test output.
describe("published examples", () => {
  test("quick start", async () => {
    using log = vi.spyOn(console, "log").mockImplementation(() => {});
    const { result } = await import("../examples/quick-start");
    expect(result).toStrictEqual({
      data: { description: "No description", title: "Example", views: 42 },
      ok: true,
    });
    expect(log).toHaveBeenCalledOnce();
  });

  test("schema transformations", async () => {
    const { result } = await import("../examples/schema-transforms");
    expect(result).toStrictEqual({
      data: { count: 42, slug: "example" },
      ok: true,
    });
  });

  test("nested products", async () => {
    const { result } = await import("../examples/nested-products");
    expect(result).toStrictEqual({
      data: {
        products: [
          { name: "Book", price: 12, url: "/book" },
          { name: "Pen", price: 3, url: "/pen" },
        ],
      },
      ok: true,
    });
  });

  test("custom callbacks", async () => {
    const { result } = await import("../examples/custom-values");
    expect(result).toStrictEqual({
      data: { published: new Date("2026-01-01"), tags: ["html", "typescript"] },
      ok: true,
    });
  });

  test("missing data", async () => {
    const { result } = await import("../examples/missing-data");
    expect(result).toStrictEqual({
      data: { author: undefined, links: [], source: "web", title: "Untitled" },
      ok: true,
    });
  });

  test("document reuse", async () => {
    const { results } = await import("../examples/document-reuse");
    expect(results).toStrictEqual([
      { data: { title: "Example" }, ok: true },
      { data: { links: ["/docs"] }, ok: true },
    ]);
  });

  test("structured failures", async () => {
    using log = vi.spyOn(console, "error").mockImplementation(() => {});
    const { result } = await import("../examples/errors");
    expect(result).toMatchObject({
      error: { code: "VALIDATION_FAILED", stage: "validate" },
      ok: false,
    });
    expect(log).toHaveBeenCalledTimes(2);
  });
});
