# Picocolors Implementation in TypeScript

Zero-dependency implementation of [picocolors][1] in TypeScript.

I love the original picocolors library by Alexey Raspopov, but in a certain case,
dependency is not an option. Therefore, I reimplement it so it doesn't rely on any 
external dependencies while providing the same functionality.

## Usage

```ts

// Copy and paste the `usePicocolors` snippet from `index.ts`.

const pc = usePicocolors()

console.log(
  pc.green(`How are ${pc.italic(`you`)} doing?`)
)

```
## License

Released under the [MIT License](LICENSE). Based on the original
[picocolors](https://github.com/alexeyraspopov/picocolors) by Alexey Raspopov.

[1]: https://github.com/alexeyraspopov/picocolors/blob/main/picocolors.js
