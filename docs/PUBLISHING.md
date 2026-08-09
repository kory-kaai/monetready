# Publishing checklist

## npm (requires your 2FA)

Your npm account (`korykaai`) has 2FA enabled. Publish locally:

```bash
npm login   # if needed
npm run publish:packages -- --otp=YOUR_6_DIGIT_CODE
```

Or add an automation token:

1. Create a **Granular Access Token** at https://www.npmjs.com/settings/korykaai/tokens
   - Packages: Read and write
   - Organizations: none (or `@monetready` if you create the scope)
2. Add it as `NPM_TOKEN` in GitHub repo secrets
3. Run **Actions → Publish to npm → Run workflow** (optionally pass OTP)

Packages published in order:

1. `monetready-core`
2. `monetready-cli`
3. `create-monetready`

## GitHub profile (manual — no API)

1. **Pin the repo:** https://github.com/kory-kaai → Customize your pins → select `monetready`
2. **Social preview:** https://github.com/kory-kaai/monetready/settings → Social preview → upload `.github/social-preview.png`

## Share

Copy/paste posts from [LAUNCH_POSTS.md](./LAUNCH_POSTS.md).

Pre-filled HN submit link:

https://news.ycombinator.com/submitlink?u=https%3A%2F%2Fgithub.com%2Fkory-kaai%2Fmonetready&t=Show%20HN%3A%20Monetready%20%E2%80%93%20open-source%20CLI%20that%20scores%20your%20SaaS%20revenue%20readiness

## monetready-dev org (optional)

Create at https://github.com/account/organizations/new then transfer the repo from Settings → Danger Zone.
