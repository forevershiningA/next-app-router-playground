#!/usr/bin/env bash
set -euo pipefail

OLD="@forevershiningA/next-app-router-playground"
NEW="@forevershiningA/next-dyo"
BRANCH="rename/package-to-next-dyo"

# Safety checks
if [ ! -d .git ]; then
  echo "Error: this does not look like a git repository. Run this from the repo root." >&2
  exit 2
fi

echo "Creating branch ${BRANCH} from main..."
git fetch origin main
git checkout -b ${BRANCH} origin/main

# Find files containing the old package name
echo "Searching for occurrences of ${OLD}..."
FILES=$(git grep -Il --exclude-dir=node_modules --exclude-dir=.git "${OLD}" || true)

if [ -z "$FILES" ]; then
  echo "No files contain '${OLD}'. Nothing to change."
  exit 0
fi

echo "Files to update:"
echo "$FILES"

# 1) Update package.json files explicitly (safer)
echo "Updating package.json files..."
mapfile -t PKGFILES < <(find . -type f -name package.json -not -path "./node_modules/*" -not -path "./.git/*")
for pf in "${PKGFILES[@]}"; do
  if git grep -q "${OLD}" -- "$pf"; then
    echo " - Updating name in $pf"
    if command -v jq >/dev/null 2>&1; then
      tmp="$(mktemp)"
      jq --arg n "${NEW}" '.name = $n' "$pf" > "$tmp" && mv "$tmp" "$pf"
    else
      sed -i.bak "s|${OLD}|${NEW}|g" "$pf" && rm -f "${pf}.bak"
    fi
    git add "$pf"
  fi
done

# 2) Update other occurrences across repo (readme, docs, examples, imports, workflows)
echo "Replacing textual occurrences across repository (excluding node_modules and .git)..."
for f in $FILES; do
  echo " - Rewriting: $f"
  perl -0777 -pe "s/\Q${OLD}\E/${NEW}/g" -i "$f"
  git add "$f"
done

# 3) Update textual occurrences inside lockfiles (no install/regeneration)
LOCKFILES=$(git ls-files | grep -E "package-lock.json|yarn.lock|pnpm-lock.yaml" || true)
if [ -n "$LOCKFILES" ]; then
  echo "Updating lockfiles textually (no install/regeneration)..."
  for lf in $LOCKFILES; do
    if grep -q "${OLD}" "$lf"; then
      echo " - Updating $lf"
      perl -0777 -pe "s/\Q${OLD}\E/${NEW}/g" -i "$lf"
      git add "$lf"
    fi
  done
fi

# 4) Summary and commit
if git diff --staged --quiet; then
  echo "No staged changes to commit. Exiting."
  exit 0
fi

git commit -m "chore: rename package to ${NEW} (textual replace across repo)"
git push -u origin "${BRANCH}"

echo "Branch pushed: ${BRANCH}"
echo ""
echo "Next: open a PR titled 'chore: rename package to ${NEW}' with the PR body printed below."