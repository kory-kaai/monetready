# Contributing to Monetready

Thanks for helping make Monetready the best open-source tool for shipping and monetizing products.

## Quick links

- [Report a bug](https://github.com/kory-kaai/monetready/issues/new?template=bug_report.yml)
- [Request a feature](https://github.com/kory-kaai/monetready/issues/new?template=feature_request.yml)
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
```

## What we're looking for

High-impact contributions:

- **Revenue playbooks** for specific niches (B2B SaaS, dev tools, newsletters, etc.)
- **Integration adapters** (SendGrid, Postmark, Mixpanel, Plausible live execution)
- **Monetready Score** checks and signal detection improvements
- **Docs and examples** that help indie hackers launch faster
- **Bug fixes** with tests

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

## Playbook contributions

Playbooks live in `playbooks/` at the repo root. After editing, run `npm run sync` to copy them into `@monetready/core` and the scaffolder template.

Each playbook should include:

- Clear `id`, `name`, and `description`
- A realistic `trigger` (stripe, analytics, schedule, github)
- Actionable `actions` (email, slack, webhook, log)
- Dry-run friendly defaults

## Code style

- TypeScript strict mode
- Imports at the top of files
- Exhaustive `switch` with `never` in default cases for unions
- Match existing naming and file structure

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
