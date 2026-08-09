# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1]

### Changed

- Publish `@monetready/core` under the official `@monetready` npm organization

## [0.1.0] - 2026-03-15

### Added

- `monetready.yaml` business spec format
- Monetready Score engine (6 categories, 0–100)
- CLI: `init`, `setup`, `launch`, `score`, `fire`, `playbooks`, `generate`, `dashboard`, `serve`
- `create-monetready` project scaffolder
- 6 revenue playbooks with dry-run and live execution
- Landing, pricing, and readiness report page generator
- Self-hosted dashboard with multi-product workspace support
- Integrations: Resend, Slack, PostHog, Stripe webhooks
- GitHub Action for CI score gating
- Scheduled playbook runner and PostHog inactive-user polling

[0.1.0]: https://github.com/kory-kaai/monetready/releases/tag/v0.1.0
