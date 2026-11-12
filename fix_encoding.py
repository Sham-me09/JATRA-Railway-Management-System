from pathlib import Path
import sys

# Make sure Unicode output works in Windows PowerShell
try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass


ROOT = Path(r".\frontend\railway-management-system")

FILES = (
    list(ROOT.rglob("*.html"))
    + list(ROOT.rglob("*.js"))
)


# ============================================================
# Exact mojibake -> correct Unicode replacements
# ============================================================

REPLACEMENTS = {

    # --------------------------------------------------------
    # Common symbols
    # --------------------------------------------------------

    "\u00e2\u02dc\u00b0": "\u2630",       # â˜° -> ☰
    "\u00e2\u0153\u201c": "\u2713",       # âœ“ -> ✓
    "\u00e2\u0153\u00a8": "\u2728",       # âœ¨ -> ✨
    "\u00e2\u017e\u201d": "\u2794",       # âž” -> ➔
    "\u00e2\u0153\u2013": "\u2716",       # âœ– -> ✖
    "\u00e2\u0153\u2022": "\u2715",       # âœ• -> ✕
    "\u00e2\u0153\u2026": "\u2705",       # âœ… -> ✅

    # Separators
    "\u00e2\u201d\u20ac": "\u2500",       # â”€ -> ─

    # Bullet
    "\u00e2\u20ac\u00a2": "\u2022",       # â€¢ -> •

    # Em dash variants
    "\u00e2\u20ac\u201d": "\u2014",       # â€” -> —
    "\u00e2\u201d\u20ac": "\u2014",

    # Arrow
    "\u00e2\u2020\u2019": "\u2192",       # â†’ -> →

    # --------------------------------------------------------
    # Warning / status symbols
    # --------------------------------------------------------

    "\u00e2\u0161\u2122\u00ef\u00b8\u008f":
        "\u2699\ufe0f",                    # malformed ⚙️

    "\u00e2\u0161\u00a0\u00ef\u00b8\u008f":
        "\u26a0\ufe0f",                    # malformed ⚠️

    "\u00e2\u008f\u00b3":
        "\u23f3",                           # malformed ⏳

    "\u00e2\u009d\u0152":
        "\u274c",                           # malformed ❌

    # Pencil
    "\u00e2\u0153\u008f\u00ef\u00b8\u008f":
        "\u270f\ufe0f",                    # ✏️

    # --------------------------------------------------------
    # Emoji
    # --------------------------------------------------------

    "\u00f0\u0178\u2018\u00a4":
        "\U0001f464",                       # 👤

    "\u00f0\u0178\u017d\u00ab":
        "\U0001f3ab",                       # 🎫

    "\u00f0\u0178\u0161\u2030":
        "\U0001f689",                       # 🚉

    "\u00f0\u0178\u0161\u2020":
        "\U0001f686",                       # 🚆

    "\u00f0\u0178\u2018\u0081\u00ef\u00b8\u008f":
        "\U0001f441\ufe0f",                 # 👁️

    "\u00f0\u0178\u008f\u203a\u00ef\u00b8\u008f":
        "\U0001f6e0\ufe0f",                 # 🛠️

    "\u00f0\u0178\u008f\u008f\u00ef\u00b8\u008f":
        "\U0001f6e0\ufe0f",                 # 🛠️

    "\u00f0\u0178\u203a\u00a0\u00ef\u00b8\u008f":
        "\U0001f6e0\ufe0f",                 # 🛠️

    "\u00f0\u0178\u008f\u00a6":
        "\U0001f3e6",                       # 🏦
}


# ============================================================
# Repair
# ============================================================

total_replacements = 0
changed_files = []


print("=" * 70)
print("JATRA UTF-8 / MOJIBAKE REPAIR")
print("=" * 70)


for path in FILES:

    try:
        with open(
            path,
            "r",
            encoding="utf-8",
            newline=""
        ) as f:
            text = f.read()

    except Exception as e:
        print(f"READ ERROR: {path}")
        print(f"  {e}")
        continue


    original = text
    file_count = 0


    # Apply exact replacements
    for bad, good in REPLACEMENTS.items():

        count = text.count(bad)

        if count:
            text = text.replace(bad, good)
            file_count += count


    # --------------------------------------------------------
    # Special case:
    # login.html had correct 🚄 followed by stray †
    # Do NOT remove † globally.
    # --------------------------------------------------------

    exact_bad = "\U0001f684\u2020"
    exact_good = "\U0001f684"

    count = text.count(exact_bad)

    if count:
        text = text.replace(
            exact_bad,
            exact_good
        )
        file_count += count


    # --------------------------------------------------------
    # Write only if something actually changed
    # --------------------------------------------------------

    if text != original:

        try:

            with open(
                path,
                "w",
                encoding="utf-8",
                newline=""
            ) as f:
                f.write(text)

            changed_files.append(path)
            total_replacements += file_count

            print(f"FIXED: {path}")
            print(f"       replacements: {file_count}")

        except Exception as e:

            print(f"WRITE ERROR: {path}")
            print(f"  {e}")


print()
print("=" * 70)
print("REPAIR COMPLETE")
print("=" * 70)
print(f"Files checked : {len(FILES)}")
print(f"Files changed : {len(changed_files)}")
print(f"Replacements  : {total_replacements}")
print("=" * 70)


# ============================================================
# Verification
# ============================================================

BAD_PATTERNS = [

    "\u00e2\u02dc\u00b0",
    "\u00e2\u0153",
    "\u00e2\u201d\u20ac",
    "\u00e2\u20ac\u00a2",
    "\u00e2\u20ac\u201d",
    "\u00e2\u2020\u2019",
    "\u00e2\u0161",
    "\u00e2\u008f",
    "\u00e2\u009d",
    "\u00f0\u0178",
    "\u00ef\u00b8",
]


remaining = []


for path in FILES:

    try:
        with open(
            path,
            "r",
            encoding="utf-8",
            newline=""
        ) as f:
            text = f.read()

    except Exception:
        continue


    for line_no, line in enumerate(
        text.splitlines(),
        1
    ):

        found = [
            pattern
            for pattern in BAD_PATTERNS
            if pattern in line
        ]

        if found:

            remaining.append(
                (
                    path,
                    line_no,
                    found
                )
            )


print()
print("=" * 70)
print("VERIFICATION")
print("=" * 70)


if not remaining:

    print(
        "SUCCESS: No known mojibake patterns remain."
    )

else:

    print(
        f"WARNING: {len(remaining)} suspicious line(s) remain."
    )

    for path, line_no, found in remaining[:50]:

        print(
            f"{path} : line {line_no} : {found}"
        )

    if len(remaining) > 50:

        print(
            f"... and {len(remaining) - 50} more."
        )


print("=" * 70)