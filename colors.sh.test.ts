import { expect, test } from "bun:test"
import { spawnSync } from "node:child_process"
import { fileURLToPath } from "node:url"

const scriptPath = fileURLToPath(new URL("./colors.sh", import.meta.url))
const quotedScriptPath = quote(scriptPath)

const fixtures = {
  reset: { sequences: ["\x1b[0m", "\x1b[0m"], fn: "PC_reset" },
  bold: { sequences: ["\x1b[1m", "\x1b[22m"], fn: "PC_bold" },
  dim: { sequences: ["\x1b[2m", "\x1b[22m"], fn: "PC_dim" },
  italic: { sequences: ["\x1b[3m", "\x1b[23m"], fn: "PC_italic" },
  underline: { sequences: ["\x1b[4m", "\x1b[24m"], fn: "PC_underline" },
  inverse: { sequences: ["\x1b[7m", "\x1b[27m"], fn: "PC_inverse" },
  hidden: { sequences: ["\x1b[8m", "\x1b[28m"], fn: "PC_hidden" },
  strikethrough: { sequences: ["\x1b[9m", "\x1b[29m"], fn: "PC_strikethrough" },

  black: { sequences: ["\x1b[30m", "\x1b[39m"], fn: "PC_black" },
  red: { sequences: ["\x1b[31m", "\x1b[39m"], fn: "PC_red" },
  green: { sequences: ["\x1b[32m", "\x1b[39m"], fn: "PC_green" },
  yellow: { sequences: ["\x1b[33m", "\x1b[39m"], fn: "PC_yellow" },
  blue: { sequences: ["\x1b[34m", "\x1b[39m"], fn: "PC_blue" },
  magenta: { sequences: ["\x1b[35m", "\x1b[39m"], fn: "PC_magenta" },
  cyan: { sequences: ["\x1b[36m", "\x1b[39m"], fn: "PC_cyan" },
  white: { sequences: ["\x1b[37m", "\x1b[39m"], fn: "PC_white" },
  gray: { sequences: ["\x1b[90m", "\x1b[39m"], fn: "PC_gray" },

  bgBlack: { sequences: ["\x1b[40m", "\x1b[49m"], fn: "PC_bg_black" },
  bgRed: { sequences: ["\x1b[41m", "\x1b[49m"], fn: "PC_bg_red" },
  bgGreen: { sequences: ["\x1b[42m", "\x1b[49m"], fn: "PC_bg_green" },
  bgYellow: { sequences: ["\x1b[43m", "\x1b[49m"], fn: "PC_bg_yellow" },
  bgBlue: { sequences: ["\x1b[44m", "\x1b[49m"], fn: "PC_bg_blue" },
  bgMagenta: { sequences: ["\x1b[45m", "\x1b[49m"], fn: "PC_bg_magenta" },
  bgCyan: { sequences: ["\x1b[46m", "\x1b[49m"], fn: "PC_bg_cyan" },
  bgWhite: { sequences: ["\x1b[47m", "\x1b[49m"], fn: "PC_bg_white" },

  blackBright: { sequences: ["\x1b[90m", "\x1b[39m"], fn: "PC_black_bright" },
  redBright: { sequences: ["\x1b[91m", "\x1b[39m"], fn: "PC_red_bright" },
  greenBright: { sequences: ["\x1b[92m", "\x1b[39m"], fn: "PC_green_bright" },
  yellowBright: { sequences: ["\x1b[93m", "\x1b[39m"], fn: "PC_yellow_bright" },
  blueBright: { sequences: ["\x1b[94m", "\x1b[39m"], fn: "PC_blue_bright" },
  magentaBright: { sequences: ["\x1b[95m", "\x1b[39m"], fn: "PC_magenta_bright" },
  cyanBright: { sequences: ["\x1b[96m", "\x1b[39m"], fn: "PC_cyan_bright" },
  whiteBright: { sequences: ["\x1b[97m", "\x1b[39m"], fn: "PC_white_bright" },

  bgBlackBright: { sequences: ["\x1b[100m", "\x1b[49m"], fn: "PC_bg_black_bright" },
  bgRedBright: { sequences: ["\x1b[101m", "\x1b[49m"], fn: "PC_bg_red_bright" },
  bgGreenBright: { sequences: ["\x1b[102m", "\x1b[49m"], fn: "PC_bg_green_bright" },
  bgYellowBright: { sequences: ["\x1b[103m", "\x1b[49m"], fn: "PC_bg_yellow_bright" },
  bgBlueBright: { sequences: ["\x1b[104m", "\x1b[49m"], fn: "PC_bg_blue_bright" },
  bgMagentaBright: { sequences: ["\x1b[105m", "\x1b[49m"], fn: "PC_bg_magenta_bright" },
  bgCyanBright: { sequences: ["\x1b[106m", "\x1b[49m"], fn: "PC_bg_cyan_bright" },
  bgWhiteBright: { sequences: ["\x1b[107m", "\x1b[49m"], fn: "PC_bg_white_bright" },
} as const

type FixtureKey = keyof typeof fixtures

test("color matching", () => {
  for (const key of Object.keys(fixtures) as FixtureKey[]) {
    const fixture = fixtures[key]
    const output = callFunction(fixture.fn)
    console.log(callFunction(fixture.fn, [`testing: ${key}`]))
    expect(output).toBe(fixture.sequences[0] + "string" + fixture.sequences[1])
  }
})

test("format/color nesting", () => {
  const output = runScript(
    [
      `dim=$(PC_dim "DIM")`,
      `red=$(PC_red "RED $dim RED")`,
      `PC_bold "BOLD $red BOLD"`,
    ].join("\n")
  )

  expect(output).toBe(
    fixtures.bold.sequences[0] +
      "BOLD " +
      fixtures.red.sequences[0] +
      "RED " +
      fixtures.dim.sequences[0] +
      "DIM" +
      fixtures.dim.sequences[1] +
      fixtures.bold.sequences[0] +
      " RED" +
      fixtures.red.sequences[1] +
      " BOLD" +
      fixtures.bold.sequences[1]
  )
})

test("proper wrapping", () => {
  const output = runScript(
    [
      `bold=$(PC_bold "==TEST==")`,
      `PC_red "$bold"`,
    ].join("\n")
  )

  expect(output).toBe(
    fixtures.red.sequences[0] +
      fixtures.bold.sequences[0] +
      "==TEST==" +
      fixtures.bold.sequences[1] +
      fixtures.red.sequences[1]
  )
})

test("complex case of wrapping", () => {
  const first = runScript(
    [
      `italic=$(PC_italic "==TEST==")`,
      `background=$(PC_bg_red "$italic")`,
      `yellow=$(PC_yellow "$background")`,
      `PC_bold "$yellow"`,
    ].join("\n")
  )

  expect(first).toBe(
    fixtures.bold.sequences[0] +
      fixtures.yellow.sequences[0] +
      fixtures.bgRed.sequences[0] +
      fixtures.italic.sequences[0] +
      "==TEST==" +
      fixtures.italic.sequences[1] +
      fixtures.bgRed.sequences[1] +
      fixtures.yellow.sequences[1] +
      fixtures.bold.sequences[1]
  )

  const second = runScript(
    [
      `underline=$(PC_underline "==TEST==")`,
      `bold=$(PC_bold "$underline")`,
      `PC_cyan "$bold"`,
    ].join("\n")
  )

  expect(second).toBe(
    fixtures.cyan.sequences[0] +
      fixtures.bold.sequences[0] +
      fixtures.underline.sequences[0] +
      "==TEST==" +
      fixtures.underline.sequences[1] +
      fixtures.bold.sequences[1] +
      fixtures.cyan.sequences[1]
  )
})

test("close sequence replacement", () => {
  const first = runScript(
    [
      `yellow=$(PC_yellow "bar")`,
      `PC_red "foo $yellow baz"`,
    ].join("\n")
  )

  expect(first).toBe(
    fixtures.red.sequences[0] +
      "foo " +
      fixtures.yellow.sequences[0] +
      "bar" +
      fixtures.red.sequences[0] +
      " baz" +
      fixtures.red.sequences[1]
  )

  const second = runScript(
    [
      `dim=$(PC_dim "bar")`,
      `red=$(PC_red "$dim")`,
      `PC_bold "foo $red baz"`,
    ].join("\n")
  )

  expect(second).toBe(
    fixtures.bold.sequences[0] +
      "foo " +
      fixtures.red.sequences[0] +
      fixtures.dim.sequences[0] +
      "bar" +
      fixtures.dim.sequences[1] +
      fixtures.bold.sequences[0] +
      fixtures.red.sequences[1] +
      " baz" +
      fixtures.bold.sequences[1]
  )

  const third = runScript(
    [
      `bold=$(PC_bold "red")`,
      `red=$(PC_red "$bold")`,
      `cyan=$(PC_cyan "cyan")`,
      `PC_yellow "foo $red bar $cyan baz"`,
    ].join("\n")
  )

  expect(third).toBe(
    fixtures.yellow.sequences[0] +
      "foo " +
      fixtures.red.sequences[0] +
      fixtures.bold.sequences[0] +
      "red" +
      fixtures.bold.sequences[1] +
      fixtures.yellow.sequences[0] +
      " bar " +
      fixtures.cyan.sequences[0] +
      "cyan" +
      fixtures.yellow.sequences[0] +
      " baz" +
      fixtures.yellow.sequences[1]
  )
})

function runScript(body: string, envOverrides: Record<string, string | undefined> = {}): string {
  const script = [`source ${quotedScriptPath}`, body].join("\n")
  const env: NodeJS.ProcessEnv = { ...process.env, FORCE_COLOR: "1", ...envOverrides }
  delete env.NO_COLOR

  const result = spawnSync("bash", ["-c", script], { encoding: "utf8", env })
  if (result.error) {
    throw result.error
  }
  if (result.status !== 0) {
    throw new Error(result.stderr || `Command failed with status ${result.status}`)
  }
  return result.stdout
}

function callFunction(fn: string, args: string[] = ["string"]): string {
  const quotedArgs = args.map(quote).join(" ")
  const invocation = quotedArgs ? `${fn} ${quotedArgs}` : fn
  return runScript(invocation)
}

function quote(value: string): string {
  return `'${value.replace(/'/g, "'\\''")}'`
}
