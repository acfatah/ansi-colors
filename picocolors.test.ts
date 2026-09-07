// @ts-nocheck
import { test } from "bun:test"
import assert from "node:assert"
import { usePicocolors } from "./picocolors.ts"

const fixtures = {
  reset: ["\x1b[0m", "\x1b[0m"],
  bold: ["\x1b[1m", "\x1b[22m"],
  dim: ["\x1b[2m", "\x1b[22m"],
  italic: ["\x1b[3m", "\x1b[23m"],
  underline: ["\x1b[4m", "\x1b[24m"],
  inverse: ["\x1b[7m", "\x1b[27m"],
  hidden: ["\x1b[8m", "\x1b[28m"],
  strikethrough: ["\x1b[9m", "\x1b[29m"],

  black: ["\x1b[30m", "\x1b[39m"],
  red: ["\x1b[31m", "\x1b[39m"],
  green: ["\x1b[32m", "\x1b[39m"],
  yellow: ["\x1b[33m", "\x1b[39m"],
  blue: ["\x1b[34m", "\x1b[39m"],
  magenta: ["\x1b[35m", "\x1b[39m"],
  cyan: ["\x1b[36m", "\x1b[39m"],
  white: ["\x1b[37m", "\x1b[39m"],
  gray: ["\x1b[90m", "\x1b[39m"],

  bgBlack: ["\x1b[40m", "\x1b[49m"],
  bgRed: ["\x1b[41m", "\x1b[49m"],
  bgGreen: ["\x1b[42m", "\x1b[49m"],
  bgYellow: ["\x1b[43m", "\x1b[49m"],
  bgBlue: ["\x1b[44m", "\x1b[49m"],
  bgMagenta: ["\x1b[45m", "\x1b[49m"],
  bgCyan: ["\x1b[46m", "\x1b[49m"],
  bgWhite: ["\x1b[47m", "\x1b[49m"],

  blackBright: ["\x1b[90m", "\x1b[39m"],
  redBright: ["\x1b[91m", "\x1b[39m"],
  greenBright: ["\x1b[92m", "\x1b[39m"],
  yellowBright: ["\x1b[93m", "\x1b[39m"],
  blueBright: ["\x1b[94m", "\x1b[39m"],
  magentaBright: ["\x1b[95m", "\x1b[39m"],
  cyanBright: ["\x1b[96m", "\x1b[39m"],
  whiteBright: ["\x1b[97m", "\x1b[39m"],

  bgBlackBright: ["\x1b[100m", "\x1b[49m"],
  bgRedBright: ["\x1b[101m", "\x1b[49m"],
  bgGreenBright: ["\x1b[102m", "\x1b[49m"],
  bgYellowBright: ["\x1b[103m", "\x1b[49m"],
  bgBlueBright: ["\x1b[104m", "\x1b[49m"],
  bgMagentaBright: ["\x1b[105m", "\x1b[49m"],
  bgCyanBright: ["\x1b[106m", "\x1b[49m"],
  bgWhiteBright: ["\x1b[107m", "\x1b[49m"],
} as const

// `usePicocolors` reads the environment on each call, and `bun test` runs
// without a TTY. Pin the environment across that one call so the fixtures
// below hold no matter what the developer happens to have exported.
const ambient = {
  FORCE_COLOR: process.env.FORCE_COLOR,
  NO_COLOR: process.env.NO_COLOR,
}
process.env.FORCE_COLOR = "1"
delete process.env.NO_COLOR

const pc = usePicocolors()

for (const [key, value] of Object.entries(ambient)) {
  if (value === undefined) {
    delete process.env[key]
  } else {
    process.env[key] = value
  }
}

test("color matching", () => {
  for (let format in fixtures) {
    assert.equal(
      pc[format]("string"),
      fixtures[format][0] + "string" + fixtures[format][1]
    )
    console.log(pc[format]("testing: " + format))
  }
})

test("format/color nesting", () => {
  assert.equal(
    pc.bold(`BOLD ${pc.red(`RED ${pc.dim("DIM")} RED`)} BOLD`),
    fixtures.bold[0] +
      "BOLD " +
      fixtures.red[0] +
      "RED " +
      fixtures.dim[0] +
      "DIM" +
      fixtures.dim[1] +
      fixtures.bold[0] +
      " RED" +
      fixtures.red[1] +
      " BOLD" +
      fixtures.bold[1]
  )
})

test("proper wrapping", () => {
  assert.equal(
    pc.red(pc.bold("==TEST==")),
    fixtures.red[0] + fixtures.bold[0] + "==TEST==" + fixtures.bold[1] + fixtures.red[1]
  )
})

test("complex case of wrapping", () => {
  assert.equal(
    pc.bold(pc.yellow(pc.bgRed(pc.italic("==TEST==")))),
    fixtures.bold[0] +
      fixtures.yellow[0] +
      fixtures.bgRed[0] +
      fixtures.italic[0] +
      "==TEST==" +
      fixtures.italic[1] +
      fixtures.bgRed[1] +
      fixtures.yellow[1] +
      fixtures.bold[1]
  )

  assert.equal(
    pc.cyan(pc.bold(pc.underline("==TEST=="))),
    fixtures.cyan[0] +
      fixtures.bold[0] +
      fixtures.underline[0] +
      "==TEST==" +
      fixtures.underline[1] +
      fixtures.bold[1] +
      fixtures.cyan[1]
  )
})

test("close sequence replacement", () => {
  assert.equal(
    pc.red(`foo ${pc.yellow("bar")} baz`),
    fixtures.red[0] + "foo " + fixtures.yellow[0] + "bar" + fixtures.red[0] + " baz" + fixtures.red[1]
  )

  assert.equal(
    pc.bold(`foo ${pc.red(pc.dim("bar"))} baz`),
    fixtures.bold[0] +
      "foo " +
      fixtures.red[0] +
      fixtures.dim[0] +
      "bar" +
      fixtures.dim[1] +
      fixtures.bold[0] +
      fixtures.red[1] +
      " baz" +
      fixtures.bold[1]
  )

  assert.equal(
    pc.yellow(`foo ${pc.red(pc.bold("red"))} bar ${pc.cyan("cyan")} baz`),
    fixtures.yellow[0] +
      "foo " +
      fixtures.red[0] +
      fixtures.bold[0] +
      "red" +
      fixtures.bold[1] +
      fixtures.yellow[0] +
      " bar " +
      fixtures.cyan[0] +
      "cyan" +
      fixtures.yellow[0] +
      " baz" +
      fixtures.yellow[1]
  )
})

test("non-string input", () => {
  assert.equal(pc.red(), fixtures.red[0] + "undefined" + fixtures.red[1])
  assert.equal(pc.red(undefined), fixtures.red[0] + "undefined" + fixtures.red[1])
  assert.equal(pc.red(0), fixtures.red[0] + "0" + fixtures.red[1])
  assert.equal(pc.red(NaN), fixtures.red[0] + "NaN" + fixtures.red[1])
  assert.equal(pc.red(null), fixtures.red[0] + "null" + fixtures.red[1])
  assert.equal(pc.red(true), fixtures.red[0] + "true" + fixtures.red[1])
  assert.equal(pc.red(false), fixtures.red[0] + "false" + fixtures.red[1])
  assert.equal(pc.red(Infinity), fixtures.red[0] + "Infinity" + fixtures.red[1])
})

test("shouldn't overflow when coloring already colored large text", () => {
  try {
    pc.blue(pc.red("x").repeat(10000))
    assert(true)
  } catch (error) {
    console.error(error)
    assert(false)
  }
})
