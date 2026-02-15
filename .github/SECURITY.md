# Security Policy

## Reporting a Vulnerability

Email **security@aiskillscore.com** with:

- Description of the vulnerability
- Steps to reproduce
- Impact assessment (what data or functionality is affected)

**Do NOT open a public GitHub issue for security vulnerabilities.**

## Supported Versions

Only the latest release deployed from the `main` branch to production at [aiskillscore.com](https://aiskillscore.com) is supported. We do not backport fixes to older versions.

| Version        | Supported |
| -------------- | --------- |
| Latest (`main`) | Yes       |
| Older commits  | No        |

## Disclosure Policy

- We will **acknowledge receipt** within 48 hours.
- We will provide an **initial assessment** within 5 business days.
- We will work with the reporter to understand and resolve the issue.
- We will **credit the reporter** in any public advisory unless they prefer anonymity.
- We follow **coordinated disclosure**: we fix the vulnerability first, then disclose publicly.

## Scope

**In scope:**

- aiskillscore.com web application
- API endpoints (`/api/*`)
- Supabase Edge Functions
- Authentication and authorization flows

**Out of scope:**

- Third-party services (Stripe, Supabase, Vercel) — report directly to those providers
- Social engineering attacks
- Denial-of-service (DoS) attacks
- Issues in dependencies — report upstream, but let us know if it affects our deployment
