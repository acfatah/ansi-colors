/**
 * Zero-dependency implementation of `picocolors`.
 * @see https://github.com/alexeyraspopov/picocolors/blob/main/picocolors.js
 */
export function usePicocolors() {
  const proc = process || {}, argv = proc.argv || [], env = proc.env || {}
  const isColorSupported =
    !(!!env.NO_COLOR || argv.includes("--no-color")) &&
    (!!env.FORCE_COLOR || argv.includes("--color") || proc.platform === "win32" || ((proc.stdout || {}).isTTY && env.TERM !== "dumb") || !!env.CI)

  const formatter = (open: string, close: string, replace = open) =>
    (input: unknown) => {
      let string = "" + input, index = string.indexOf(close, open.length)

      return ~index ? open + replaceClose(string, close, replace, index) + close : open + string + close
    }

  const replaceClose = (string: string, close: string, replace: string, index: number) => {
    let result = "", cursor = 0
    do {
      result += string.substring(cursor, index) + replace
      cursor = index + close.length
      index = string.indexOf(close, cursor)
    } while (~index)

    return result + string.substring(cursor)
  }

  const createColors = () => {
    const fmt = isColorSupported ? formatter : () => String

    return {
      isColorSupported,
      reset: fmt("\x1b[0m", "\x1b[0m"),
      bold: fmt("\x1b[1m", "\x1b[22m", "\x1b[22m\x1b[1m"),
      dim: fmt("\x1b[2m", "\x1b[22m", "\x1b[22m\x1b[2m"),
      italic: fmt("\x1b[3m", "\x1b[23m"),
      underline: fmt("\x1b[4m", "\x1b[24m"),
      inverse: fmt("\x1b[7m", "\x1b[27m"),
      hidden: fmt("\x1b[8m", "\x1b[28m"),
      strikethrough: fmt("\x1b[9m", "\x1b[29m"),

      black: fmt("\x1b[30m", "\x1b[39m"),
      red: fmt("\x1b[31m", "\x1b[39m"),
      green: fmt("\x1b[32m", "\x1b[39m"),
      yellow: fmt("\x1b[33m", "\x1b[39m"),
      blue: fmt("\x1b[34m", "\x1b[39m"),
      magenta: fmt("\x1b[35m", "\x1b[39m"),
      cyan: fmt("\x1b[36m", "\x1b[39m"),
      white: fmt("\x1b[37m", "\x1b[39m"),
      gray: fmt("\x1b[90m", "\x1b[39m"),

      bgBlack: fmt("\x1b[40m", "\x1b[49m"),
      bgRed: fmt("\x1b[41m", "\x1b[49m"),
      bgGreen: fmt("\x1b[42m", "\x1b[49m"),
      bgYellow: fmt("\x1b[43m", "\x1b[49m"),
      bgBlue: fmt("\x1b[44m", "\x1b[49m"),
      bgMagenta: fmt("\x1b[45m", "\x1b[49m"),
      bgCyan: fmt("\x1b[46m", "\x1b[49m"),
      bgWhite: fmt("\x1b[47m", "\x1b[49m"),

      blackBright: fmt("\x1b[90m", "\x1b[39m"),
      redBright: fmt("\x1b[91m", "\x1b[39m"),
      greenBright: fmt("\x1b[92m", "\x1b[39m"),
      yellowBright: fmt("\x1b[93m", "\x1b[39m"),
      blueBright: fmt("\x1b[94m", "\x1b[39m"),
      magentaBright: fmt("\x1b[95m", "\x1b[39m"),
      cyanBright: fmt("\x1b[96m", "\x1b[39m"),
      whiteBright: fmt("\x1b[97m", "\x1b[39m"),

      bgBlackBright: fmt("\x1b[100m", "\x1b[49m"),
      bgRedBright: fmt("\x1b[101m", "\x1b[49m"),
      bgGreenBright: fmt("\x1b[102m", "\x1b[49m"),
      bgYellowBright: fmt("\x1b[103m", "\x1b[49m"),
      bgBlueBright: fmt("\x1b[104m", "\x1b[49m"),
      bgMagentaBright: fmt("\x1b[105m", "\x1b[49m"),
      bgCyanBright: fmt("\x1b[106m", "\x1b[49m"),
      bgWhiteBright: fmt("\x1b[107m", "\x1b[49m"),
    } as const
  }

  return createColors()
}


