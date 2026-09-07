#!/usr/bin/env bash

# ==============================================================================
# Zero-dependency implementation of picocolors in Bash.
# ==============================================================================

PC_IS_COLOR_SUPPORTED=0

_pc_contains_arg() {
  local needle="$1" arg
  shift
  for arg in "$@"; do
    [[ "$arg" == "$needle" ]] && return 0
  done
  return 1
}

_pc_is_windows() {
  case "${OSTYPE:-}" in
    msys*|cygwin*|win32*|mingw*) return 0 ;;
    *) return 1 ;;
  esac
}

_pc_detect_color_support() {
  local -a args=("$@")

  if [[ -n "${NO_COLOR:-}" ]] || _pc_contains_arg "--no-color" "${args[@]}"; then
    PC_IS_COLOR_SUPPORTED=0
    return
  fi

  if [[ -n "${FORCE_COLOR:-}" ]] || _pc_contains_arg "--color" "${args[@]}"; then
    PC_IS_COLOR_SUPPORTED=1
    return
  fi

  if _pc_is_windows; then
    PC_IS_COLOR_SUPPORTED=1
    return
  fi

  if [[ -n "${CI:-}" ]]; then
    PC_IS_COLOR_SUPPORTED=1
    return
  fi

  if [[ -t 1 && "${TERM:-}" != "dumb" ]]; then
    PC_IS_COLOR_SUPPORTED=1
    return
  fi

  PC_IS_COLOR_SUPPORTED=0
}

_pc__replace_close() {
  local string="$1"
  local close="$2"
  local replace="$3"

  printf '%s' "${string//"$close"/"$replace"}"
}

_pc__apply() {
  local open="$1"
  local close="$2"
  local replace="$3"
  shift 3

  local input="$*"

  if [[ "${PC_IS_COLOR_SUPPORTED:-0}" -eq 0 ]]; then
    printf '%s' "$input"
    return
  fi

  local processed
  processed=$(_pc__replace_close "$input" "$close" "$replace")

  printf '%s' "$open$processed$close"
}

_pc_detect_color_support "$@"

PC_reset() { _pc__apply $'\033[0m' $'\033[0m' $'\033[0m' "$@"; }
PC_bold() { _pc__apply $'\033[1m' $'\033[22m' $'\033[22m\033[1m' "$@"; }
PC_dim() { _pc__apply $'\033[2m' $'\033[22m' $'\033[22m\033[2m' "$@"; }
PC_italic() { _pc__apply $'\033[3m' $'\033[23m' $'\033[3m' "$@"; }
PC_underline() { _pc__apply $'\033[4m' $'\033[24m' $'\033[4m' "$@"; }
PC_inverse() { _pc__apply $'\033[7m' $'\033[27m' $'\033[7m' "$@"; }
PC_hidden() { _pc__apply $'\033[8m' $'\033[28m' $'\033[8m' "$@"; }
PC_strikethrough() { _pc__apply $'\033[9m' $'\033[29m' $'\033[9m' "$@"; }

PC_black() { _pc__apply $'\033[30m' $'\033[39m' $'\033[30m' "$@"; }
PC_red() { _pc__apply $'\033[31m' $'\033[39m' $'\033[31m' "$@"; }
PC_green() { _pc__apply $'\033[32m' $'\033[39m' $'\033[32m' "$@"; }
PC_yellow() { _pc__apply $'\033[33m' $'\033[39m' $'\033[33m' "$@"; }
PC_blue() { _pc__apply $'\033[34m' $'\033[39m' $'\033[34m' "$@"; }
PC_magenta() { _pc__apply $'\033[35m' $'\033[39m' $'\033[35m' "$@"; }
PC_cyan() { _pc__apply $'\033[36m' $'\033[39m' $'\033[36m' "$@"; }
PC_white() { _pc__apply $'\033[37m' $'\033[39m' $'\033[37m' "$@"; }
PC_gray() { _pc__apply $'\033[90m' $'\033[39m' $'\033[90m' "$@"; }

PC_bg_black() { _pc__apply $'\033[40m' $'\033[49m' $'\033[40m' "$@"; }
PC_bg_red() { _pc__apply $'\033[41m' $'\033[49m' $'\033[41m' "$@"; }
PC_bg_green() { _pc__apply $'\033[42m' $'\033[49m' $'\033[42m' "$@"; }
PC_bg_yellow() { _pc__apply $'\033[43m' $'\033[49m' $'\033[43m' "$@"; }
PC_bg_blue() { _pc__apply $'\033[44m' $'\033[49m' $'\033[44m' "$@"; }
PC_bg_magenta() { _pc__apply $'\033[45m' $'\033[49m' $'\033[45m' "$@"; }
PC_bg_cyan() { _pc__apply $'\033[46m' $'\033[49m' $'\033[46m' "$@"; }
PC_bg_white() { _pc__apply $'\033[47m' $'\033[49m' $'\033[47m' "$@"; }

PC_black_bright() { _pc__apply $'\033[90m' $'\033[39m' $'\033[90m' "$@"; }
PC_red_bright() { _pc__apply $'\033[91m' $'\033[39m' $'\033[91m' "$@"; }
PC_green_bright() { _pc__apply $'\033[92m' $'\033[39m' $'\033[92m' "$@"; }
PC_yellow_bright() { _pc__apply $'\033[93m' $'\033[39m' $'\033[93m' "$@"; }
PC_blue_bright() { _pc__apply $'\033[94m' $'\033[39m' $'\033[94m' "$@"; }
PC_magenta_bright() { _pc__apply $'\033[95m' $'\033[39m' $'\033[95m' "$@"; }
PC_cyan_bright() { _pc__apply $'\033[96m' $'\033[39m' $'\033[96m' "$@"; }
PC_white_bright() { _pc__apply $'\033[97m' $'\033[39m' $'\033[97m' "$@"; }

PC_bg_black_bright() { _pc__apply $'\033[100m' $'\033[49m' $'\033[100m' "$@"; }
PC_bg_red_bright() { _pc__apply $'\033[101m' $'\033[49m' $'\033[101m' "$@"; }
PC_bg_green_bright() { _pc__apply $'\033[102m' $'\033[49m' $'\033[102m' "$@"; }
PC_bg_yellow_bright() { _pc__apply $'\033[103m' $'\033[49m' $'\033[103m' "$@"; }
PC_bg_blue_bright() { _pc__apply $'\033[104m' $'\033[49m' $'\033[104m' "$@"; }
PC_bg_magenta_bright() { _pc__apply $'\033[105m' $'\033[49m' $'\033[105m' "$@"; }
PC_bg_cyan_bright() { _pc__apply $'\033[106m' $'\033[49m' $'\033[106m' "$@"; }
PC_bg_white_bright() { _pc__apply $'\033[107m' $'\033[49m' $'\033[107m' "$@"; }

PC_color_supported() {
  [[ "${PC_IS_COLOR_SUPPORTED:-0}" -eq 1 ]]
}

# ==============================================================================
