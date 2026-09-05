# Extraction configuration

Use `text`, `html`, `attr`, `prop`, `nested`, and `many` from `xscrape`. Helpers return tagged objects rather than builders or classes.

| Operation | Canonical descriptor |
| --- | --- |
| `text("h1")` | `{ kind: "text", selector: "h1" }` |
| `html("main")` | `{ kind: "html", selector: "main" }` |
| `attr("a", "href")` | `{ kind: "attr", selector: "a", name: "href" }` |
| `prop("input", "checked")` | `{ kind: "prop", selector: "input", name: "checked" }` |
| `nested("article", fields)` | `{ kind: "object", selector: "article", fields }` |
| `many(field)` | `{ kind: "many", field }` |
| `many("article", fields)` | `{ kind: "many", field: { kind: "object", selector: "article", fields } }` |

The JSON Schema exported at `xscrape/extract-config.schema.json` validates this declarative subset and selector strings. It does not validate CSS syntax, authorize selectors, or include callback functions and validation schemas.

## Legacy syntax

- `"h1"` reads text.
- `{ selector: "h1" }` reads text.
- `{ selector: "a", value: "href" }` reads a DOM property.
- `{ selector: "main", value: fields }` extracts nested fields.
- `{ selector: "h1", value: (node, key, siblings) => node.text() }` runs a synchronous callback.
- `[descriptor]` reads every match. The tuple must contain exactly one descriptor.

## Selection rules

A scalar descriptor reads the first matching descendant. A collection reads all matching descendants in document order. Nested fields are scoped to the matched parent; the parent itself is not selected by a descendant query.

Missing scalar or object matches return `undefined`. Missing collections return `[]`. Missing matches skip callbacks entirely. Defaults belong in schemas when they must cover absent nodes.

Collections remove top-level `null` and `undefined` callback results and flatten callback arrays one level. Error path indices identify the original matched element before filtering.

`text` returns untrimmed text. `html` returns serialized inner markup. `attr` reads parsed attribute values directly, so a boolean attribute can be an empty string; `prop` can return booleans or other property values. HTML parsing may normalize attribute names and decode entities. Raw attributes are not original source bytes. Relative links remain relative.

## Callbacks

Callbacks receive an `ExtractNode`, the output field key, and a read-only partial sibling record. Available node functions are `attr(name)`, `text()`, and `html()`. Siblings are populated in JavaScript property enumeration order, including numeric-key ordering. Use a post-validation transform for calculations depending on the complete record.

Promise-like callback results fail with `ASYNC_EXTRACTOR`. Returned rejecting promises are observed to prevent an unhandled rejection. Nested promises inside an otherwise synchronous result object are not recursively awaited; use schemas to enforce the desired value shape.

Extraction structure is snapshotted once. Shared nested config objects are supported; cycles are rejected. No document is captured in the compiled plan.
