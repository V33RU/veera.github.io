# Security Policy

## Reporting a Vulnerability

If you find a security issue in this site or its source code, please report it privately.

- Preferred channel: GitHub's [Private Vulnerability Reporting](https://github.com/V33RU/veera.github.io/security/advisories/new) on this repository.
- Alternate channel: email `v33raiot@gmail.com` with the subject line starting with `[security]`.

Please include enough detail to reproduce: affected URL or file, steps, expected vs actual behaviour, and impact. If you have a proof-of-concept, attach it or link it.

I will acknowledge receipt within 7 days and provide a remediation plan within 30 days for confirmed issues.

## In Scope

- Source code in this repository.
- The deployed site at <https://mr-iot.blog/>.
- The GitHub Pages deployment workflow.

## Out of Scope

- Third-party services linked from blog posts.
- Issues that require physical access to the maintainer's machine.
- Social-engineering or phishing scenarios targeting the maintainer.
- Denial-of-service via traffic volume against GitHub Pages infrastructure.

## Disclosure

Coordinated disclosure is appreciated. Please do not file public issues for unfixed vulnerabilities.

## Supply Chain

- All GitHub Actions in `.github/workflows/` are pinned to commit SHAs.
- Dependabot alerts and security updates are enabled.
- Secret scanning and push protection are enabled.
- Branch protection on `main` requires PRs, blocks force-push, blocks deletion, and enforces linear history.
