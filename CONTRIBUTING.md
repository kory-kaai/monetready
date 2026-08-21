# Contributing to Monetready

Thanks for helping make Monetready the best open-source tool for shipping and monetizing products.

## Start here

1. Browse **[good first issues](https://github.com/kory-kaai/monetready/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)** — scoped tasks with file pointers and acceptance criteria.
2. Check **[help wanted](https://github.com/kory-kaai/monetready/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22)** for slightly larger integration work.
3. Read this doc, then open a draft PR early if you want feedback.

## Quick links

- [Report a bug](https://github.com/kory-kaai/monetready/issues/new?template=bug_report.yml)
- [Request a feature](https://github.com/kory-kaai/monetready/issues/new?template=feature_request.yml)
- [Propose a playbook](https://github.com/kory-kaai/monetready/issues/new?template=playbook.yml)
- [Open a pull request](https://github.com/kory-kaai/monetready/compare)

## Development setup

```bash
git clone https://github.com/kory-kaai/monetready.git
cd monetready
npm install
npm run build
npm test
```

Run the CLI locally:

```bash
npm run monetready -- score
npm run monetready -- playbooks list
```

## What we're looking for

High-impact contributions:

- **Revenue playbooks** for specific niches (B2B SaaS, dev tools, newsletters, etc.)
- **Integration adapters** — SendGrid, Postmark, and Plausible live execution (Resend, SES, and PostHog already ship)
- **Monetready Score** checks and signal detection improvements
- **Docs and examples** that help indie hackers launch faster
- **Bug fixes** with tests

## Integration adapters

Email providers are wired in `packages/core/src/playbooks/runner.ts` (`sendPlaybookEmail`). Use an existing adapter as a template:

| Provider | Status | Reference |
|----------|--------|-----------|
| Resend | ✅ shipped | `packages/core/src/integrations/resend.ts` |
| SES | ✅ shipped | `packages/core/src/integrations/ses.ts` + `ses.test.ts` |
| SendGrid | 🔲 stub only | returns "not implemented yet" in `runner.ts` |
| Postmark | 🔲 stub only | same |

Analytics polling (`monetready playbooks poll`) currently supports **PostHog only** — see `packages/core/src/playbooks/poll.ts` and `integrations/posthog.ts`.

When adding an adapter:

1. Add `packages/core/src/integrations/<provider>.ts` (+ tests mirroring `ses.test.ts`)
2. Wire it in `runner.ts` (and `poll.ts` if analytics)
3. Document required env vars in README
4. Run `npm run build && npm test && npm run typecheck`

## Playbook contributions

Playbooks live in `playbooks/` at the repo root. After editing, run `npm run sync` to copy them into `@monetready/core` and the scaffolder template.

Each playbook should include:

- Clear `id`, `name`, and `description`
- A realistic `trigger` (`stripe`, `analytics`, `schedule`, or `github`)
- Actionable `actions` (`email`, `slack`, `webhook`, `log`)
- Dry-run friendly defaults

Email actions reference templates in `packages/core/src/playbooks/runner.ts` (`EMAIL_TEMPLATES`). Add a new template function when introducing a new `template:` name.

Stripe webhook playbooks also need a trigger event that Stripe actually emits — match against existing playbooks in `playbooks/`.

## Pull request guidelines

1. **Keep PRs focused** — one feature or fix per PR
2. **Add tests** when changing core behavior (`packages/core`)
3. **Run checks** before opening:
   ```bash
   npm run build
   npm test
   npm run typecheck
   ```
4. **Update docs** if you change CLI commands, env vars, or `monetready.yaml` fields
5. **Sync playbooks** if you edit `playbooks/` at the repo root:
   ```bash
   npm run sync
   ```

## Code style

- TypeScript strict mode
- Imports at the top of files
- Exhaustive `switch` with `never` in default cases for unions
- Match existing naming and file structure

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
