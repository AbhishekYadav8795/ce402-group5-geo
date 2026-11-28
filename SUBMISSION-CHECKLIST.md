# CE 402 submission checklist

## Included in the source
- P1–P5 calculation modules with custom inputs, SI units, stepwise outputs and charting.
- P8 source package, README, equation register, regression tests and CI workflow.
- Review hub with nine report cases and a custom example; 14 datasets in 42 views; project export and additional design tools.
- Numerical test transcript and documented model limitations.

## Complete before submitting
- [ ] Run `npm install`, `npm audit`, `npm test`, `npm run typecheck`, `npm run build` on a working network. Commit the generated package-lock.json. Review audit findings instead of forcing a breaking upgrade.
- [ ] Use `npm start` to verify the static production build. Check P1–P5, all geometry selections, the review hub, 3D controls, CSV/JSON export, and mobile/reduced-motion behavior.
- [ ] Check a new soil profile with independently computed inputs/expected outputs; inspect the SPT digitisation and confirm method references against the original standards.
- [ ] Confirm C4 assumed loading, soil parameters and all preliminary engineering conclusions with the group.
- [ ] Publish source to a public GitHub repository. Each member must make a genuine substantive commit using their own account.
- [ ] Deploy the app publicly (e.g., Vercel). Open the actual link in a private browser window and test `#review` and the custom profile. No login or installation should be required for the evaluator.
- [ ] Record actual website, repository and individual commit URLs in the report. Verify the earlier AI records, add the missing genuine session date, and confirm actual task contributions.

This package is a numerical and source-level revision, not evidence of deployment, student checks, or final construction approval.
