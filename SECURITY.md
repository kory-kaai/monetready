# Security Policy

## Supported versions

| Version | Supported |
| ------- | --------- |
| 0.1.x   | ✅        |

## Reporting a vulnerability

**Please do not open public GitHub issues for security vulnerabilities.**

Report security issues privately via [GitHub Security Advisories](https://github.com/kory-kaai/monetready/security/advisories/new) or by opening a minimal issue asking for a security contact.

We aim to acknowledge reports within 48 hours and provide a fix or mitigation plan as quickly as possible.

## Scope

Security reports are in scope for:

- `monetready-core`, `monetready-cli`, and `create-monetready`
- Webhook servers (`monetready serve`, dashboard API)
- Credential handling and env var usage
- Generated page injection or XSS risks

Out of scope:

- Third-party services (Stripe, Resend, PostHog, Slack)
- User-configured webhook endpoints
- Social engineering

## Best practices for self-hosted use

- Set `MONETREADY_WEBHOOK_SECRET` when exposing webhook endpoints
- Use `STRIPE_WEBHOOK_SECRET` for Stripe signature verification
- Run `monetready dashboard` on localhost unless you trust your network
- Never commit `.env` files or API keys
