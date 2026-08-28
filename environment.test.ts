import { expect, test } from "bun:test"
import { readFileSync } from "node:fs"
import { createRequire } from "node:module"
import { dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { Script, createContext } from "node:vm"

const moduleUrl = new URL("./picocolors.ts", import.meta.url)
const filename = fileURLToPath(moduleUrl)
const nodeRequire = createRequire(import.meta.url)
const source = readFileSync(moduleUrl, "utf-8")
const transpiler = new Bun.Transpiler({ loader: "ts" })
const compiledSource = transformToCommonJS(transpiler.transformSync(source))
const compiledScript = new Script(compiledSource, { filename })
const CI = process.env.CI
const COLORED_RED = "\x1B[31mtext\x1B[39m"

test("ci server", () => {
  const colors = initModuleEnv({ env: { TERM: "dumb", CI: "1" } })
  expect(colors.isColorSupported).toBe(true)
  expect(colors.red("text")).toBe(COLORED_RED)
})

test("arg --color", () => {
  const colors = initModuleEnv({ env: { TERM: "dumb" }, argv: ["--color"] })
  expect(colors.isColorSupported).toBe(true)
  expect(colors.red("text")).toBe(COLORED_RED)
})

test("env NO_COLOR", () => {
  const colors = initModuleEnv({ env: { FORCE_COLOR: "1", NO_COLOR: "1" } })
  expect(colors.isColorSupported).toBe(false)
  expect(colors.red("text")).toBe("text")
})

test("env NO_COLOR empty", () => {
  const colors = initModuleEnv({ env: { NO_COLOR: "", CI } })
  expect(colors.isColorSupported).toBe(true)
  expect(colors.red("text")).toBe(COLORED_RED)
})

test("env FORCE_COLOR", () => {
  const colors = initModuleEnv({ env: { TERM: "dumb", FORCE_COLOR: "1" } })
  expect(colors.isColorSupported).toBe(true)
  expect(colors.red("text")).toBe(COLORED_RED)
})

test("arg --no-color", () => {
  const colors = initModuleEnv({ env: { FORCE_COLOR: "1" }, argv: ["--no-color"] })
  expect(colors.isColorSupported).toBe(false)
  expect(colors.red("text")).toBe("text")
})

test("no term", () => {
  const colors = initModuleEnv({ env: { TERM: "dumb" } })
  expect(colors.isColorSupported).toBe(false)
  expect(colors.red("text")).toBe("text")
})

test("windows", () => {
  const colors = initModuleEnv({ env: { TERM: "dumb" }, platform: "win32" })
  expect(colors.isColorSupported).toBe(true)
  expect(colors.red("text")).toBe(COLORED_RED)
})

test("edge runtime", () => {
  const colors = initModuleEnv({ env: { FORCE_COLOR: "1" }, argv: undefined, require: undefined })
  expect(colors.isColorSupported).toBe(true)
  expect(colors.red("text")).toBe(COLORED_RED)
})

type ModuleEnvOptions = {
  env: Record<string, string | undefined>
  argv?: string[]
  platform?: string
  require?: typeof nodeRequire | undefined
  stdout?: typeof process.stdout
}

type Picocolors = {
  isColorSupported: boolean
  red: (input: unknown) => string
}

function initModuleEnv({
  env,
  argv = [],
  platform = "darwin",
  require = nodeRequire,
  stdout = process.stdout,
}: ModuleEnvOptions): Picocolors {
  const simulatedProcess = { env, argv, platform, stdout }
  const module = { exports: {} as unknown }
  const sandbox: Record<string, unknown> = {
    require,
    process: simulatedProcess,
    module,
    exports: module.exports,
    __filename: filename,
    __dirname: dirname(filename),
  }
  const context = createContext(sandbox)
  Object.assign(context, { global: context, globalThis: context })
  compiledScript.runInContext(context)

  const exported = module.exports
  const colors = resolveColors(exported)
  if (!isPicocolors(colors)) {
    throw new Error("Unexpected module export shape")
  }
  return colors
}

function resolveColors(exported: unknown): unknown {
  if (typeof exported === "function") {
    return exported()
  }
  if (exported && typeof exported === "object") {
    const maybeFunction = (exported as Record<string, unknown>).usePicocolors
    if (typeof maybeFunction === "function") {
      return maybeFunction()
    }
  }
  return exported
}

function isPicocolors(value: unknown): value is Picocolors {
  return (
    !!value &&
    typeof value === "object" &&
    typeof (value as Picocolors).red === "function" &&
    typeof (value as Picocolors).isColorSupported === "boolean"
  )
}

function transformToCommonJS(esmSource: string): string {
  const withoutExportKeyword = esmSource.replace(
    /export function usePicocolors/,
    "function usePicocolors"
  )
  const withoutNamedExports = withoutExportKeyword.replace(
    /export \{[^}]*usePicocolors[^}]*\};?/g,
    ""
  )
  return `${withoutNamedExports}\nmodule.exports = { usePicocolors };\n`
}
