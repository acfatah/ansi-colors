# Picocolors Implementation in TypeScript and Bash

Zero-dependency implementation of [picocolors][1] in TypeScript.

I love the original picocolors library by Alexey Raspopov, but in a certain case,
dependency is not an option. Therefore, I reimplement it so it doesn't rely on any
external dependencies while providing the same functionality.

## Usage

### Bash

```bash
# See: https://github.com/nrjdalal/gitpick#-quick-usage
bunx gitpick acfatah/ts-picocolors/tree/main/picocolors.sh
```

```bash
# Source the `picocolors.sh` file to define the `PC_*` functions
source ./picocolors.sh

echo "$(PC_green "How are $(PC_italic "you") doing?")"
```

Colors are functions rather than variables, named after their TypeScript
counterparts in snake_case:

| TypeScript    | Bash               |
| ------------- | ------------------ |
| `red`         | `PC_red`           |
| `bgRed`       | `PC_bg_red`        |
| `redBright`   | `PC_red_bright`    |
| `bgRedBright` | `PC_bg_red_bright` |

Modifiers follow the same pattern: `PC_bold`, `PC_dim`, `PC_italic`,
`PC_underline`, `PC_inverse`, `PC_hidden`, `PC_strikethrough` and `PC_reset`.
`PC_color_supported` is a predicate, and `$PC_IS_COLOR_SUPPORTED` holds `1`
or `0`.

**Notes**

- Output carries no trailing newline. Wrap calls in `echo`, or use command
  substitution as above.
- Sourcing inspects the caller's `"$@"`, so `--color` and `--no-color` passed
  to your own script are honored automatically.
- Set `PC_IS_COLOR_SUPPORTED=1` after sourcing to force colors on. It is
  re-read on every call.
- Requires bash. The script uses `[[ ]]`, `local` and `$'...'`, so it will not
  run under POSIX `sh`.

### TypeScript

```bash
# See: https://github.com/nrjdalal/gitpick#-quick-usage
bunx gitpick acfatah/ts-picocolors/tree/main/picocolors.ts
```

```ts
// Import the `usePicocolors` function from the `picocolors.ts` file
import { usePicocolors } from './picocolors.ts'

const pc = usePicocolors()

console.log(
  pc.green(`How are ${pc.italic(`you`)} doing?`)
)
```

## License

Released under the [MIT License](LICENSE). Based on the original
[picocolors](https://github.com/alexeyraspopov/picocolors) by Alexey Raspopov.

[1]: https://github.com/alexeyraspopov/picocolors/blob/main/picocolors.js
