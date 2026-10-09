# Exact · Precision Calculator

A responsive, static calculator website that can be deployed using GitHub Pages. No build, frameworks, APIs, or dependencies.

## Features

- Exact rational arithmetic with JavaScript `BigInt`: calculations are never rounded or converted to binary floating-point.
- Default display shows terminating decimals or repeating decimals with a **vinculum** (bar over the repeating digits).
- Optional **Fraction mode** displays the fully reduced numerator/denominator.
- Accepts typed expressions with parentheses, positive and negative values, decimals, `+`, `-`, `/`, `÷`, `*`, `x`, `X`, `×`, exponent `^`, and integer remainder `%`. `ans` inserts the previous answer.
- Supports keyboard input and calculator buttons. Enter evaluates; Shift+Enter inserts a newline.
- No `eval`; input is parsed explicitly.
- Results exceeding the 2,000-digit repeating-display cap appear as exact fractions instead of being rounded or truncated.

## Examples

| Input | Default output | Fraction mode |
| --- | --- | --- |
| `1 / 3` | 0.3̅ | 1/3 |
| `1 / 6` | 0.16̅ (bar above 6 only) | 1/6 |
| `0.1 + 0.2` | 0.3 | 3/10 |
| `2 x (3 + 4)` | 14 | 14 |
| `2^10` | 1024 | 1024 |

## GitHub Pages deployment

1. Open the repository's **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
3. Select the **main** branch and **/(root)** folder, then click **Save**.
4. Visit **https://ob5h.github.io/Calculator/** when GitHub Pages publishes the site.

Alternatively, open `index.html` directly in a browser. All assets use relative paths.

## Exactness and limits

Finite decimal inputs are interpreted exactly as base-10 fractions. Addition, subtraction, multiplication, division, remainder and integer powers use exact integers and rational reductions.

Only rational numbers are supported. Irrational operations such as π, square roots, and non-integer exponents are rejected rather than approximated. Extremely long repeating cycles are displayed in fraction mode automatically to avoid freezing the interface. BigInt precision itself is limited only by runtime memory and practical execution time.

## Tests

Run `node test.js` from the repository root. Tests require Node.js and no installed packages.
