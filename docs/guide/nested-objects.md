---
outline: deep
---

# Nested Objects

Pass an object to `value` for nested maps:

```ts
extract: {
  image: {
    selector: 'head',
    value: {
      url:    { selector: 'meta[property="og:image"]', value: 'content' },
      width:  { selector: 'meta[property="og:image:width"]', value: 'content' },
      height: { selector: 'meta[property="og:image:height"]', value: 'content' },
    }
  }
}
```
