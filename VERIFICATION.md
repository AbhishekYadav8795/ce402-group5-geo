# Spectrum 7.4 — engineering and source review

Reviewed against the CE 402 assignment, the Group 5 report and Spectrum 7.3 source. This is a software and numerical review, not independent field verification or professional design certification.

## Corrections made

| Finding in 7.3 | Correction in 7.4 |
|---|---|
| Transferring a circular footing to P4 used a square with sides equal to the diameter, overstating loaded area by 4/π. | Transfer an equal-area square with sides √A; maintain the same applied pressure and resultant force. |
| Pile safe capacities were rounded constants. | Calculate toe and shaft resistance from the stated site assumptions and show both terms. |
| Invalid inputs could produce NaN or misleading results; a strip could have length below width. | Validate finite geometry, strength, stress, drainage, soil layer order and weights. Reject invalid geometry and warn when strip length is below 10B. |
| Square and circular length fields could disagree with the active shape. | Synchronise width and length and hide the redundant field. |
| Load–groundwater settlement chart used a fixed 60 mm reference plane. | Follow the P5 user-selected settlement limit. Fixed assignment site plots retain their own report limits. |
| Exaggerated promotional wording obscured technical meaning. | Replace the main headings, module descriptions and labels with direct academic wording. Consolidate README documentation. |

## Verification results

The original regression suite, all 14 analytical dataset checks, nine report trial-case comparisons, eleven live benchmark checks and fifteen additional audit groups passed. The new tests include independent numerical integration of the Boussinesq point-load kernel, hand calculations of IS 6403 terms, effective area, effective overburden, SPT and regression checks, NC/OC settlement, drainage time scaling, pile resistance and malformed inputs. See `tests/audit.test.cjs` and `verification-output.txt`.

The assignment-specific numerical values remain consistent with the report to its displayed rounding precision. A 60 mm total and 10 mm adjacent differential guide are adopted under IS 1904:1986 Table 1 (multistoreyed framed building with panel walls, isolated footings on sand/hard clay); these are not universal limits.

| Quantity | Result |
|---|---:|
| Group load factor | 1.05 |
| Total service column load | 32,655 kN |
| BH-1 interior net safe bearing capacity | 244.7 kPa |
| BH-3 interior factor of safety | 2.72 |
| BH-3 interior isolated settlement | 120.0 mm |
| Maximum building-wide trial settlement | 239.1 mm |
| Maximum adjacent differential | 115.4 mm (C5–C6) |
| Preliminary number of piles | 67 |
| BH-2 / BH-1 / BH-3 single-pile safe axial estimates | 695.3 / 655.2 / 608.5 kN |

The assignment requires historical editions of the standards. The IS 6403 table values and correction factors were checked against the published scan (printed pp. 8–9): https://law.resource.org/pub/in/bis/S03/is.6403.1981.pdf. The IS 2131 correction sequence follows §3.6: https://law.resource.org/pub/in/bis/S03/is.2131.1981.pdf. Settlement guide source: https://law.resource.org/pub/in/bis/S03/is.1904.1986.pdf, Table 1. The approximate SPT graph digitisation and previously assumed soil parameters are retained. No new field data or measured soil properties were inferred.

## Outstanding checks

- The network could not resolve `registry.npmjs.org`; installation and dependency vulnerability status are not verified. No new npm dependencies or version changes were introduced in this review.
- Full TypeScript type checking, Next.js production build, live WebGL rendering, browser interactions and responsive display remain to be tested with installed dependencies.
- The calculations are screening estimates. Layered punching, density-dependent shear mode, pile-group settlement, negative skin friction, liquefaction and structural checks require separate engineering assessment. The assumed C4 load and moment require confirmation. The approximate SPT digitisation, idealised drainage path and modulus estimates remain sources of uncertainty.
- Verify the public website URL and individual contributor commits before submitting. The existing report's rounded results are retained; update its software version and describe the changes in this document.

## Spectrum Academic 8.0 — additional verification

The prior 7.4 review above is retained as version history. In 8.0, finite eccentric strips use reduced dimensions and rectangular factors when the effective aspect ratio falls below 10. Eccentric circles are now screened using the symmetric lens area and an equivalent-area circular footing, clearly marked as an approximation rather than an IS-prescribed circular eccentricity procedure. Resultant eccentricity includes centred added net load. P5 now uses the effective circular diameter for the Schmertmann influence diagram and the circular axial stress solution; P4 remains a rectangular approximation for circular inputs. Granular creep is evaluated at each elapsed time in both the 2D and 3D settlement charts. The selected-time sand plus ultimate primary clay report values are unchanged for the nine assignment cases. The 28-column maximum remains 239.0898 mm; the largest adjacent difference is 115.3842 mm (C5–C6).

All earlier tests and six additional independent test groups passed, including sixteen combinations of shape, shear mode and groundwater on a synthetic layered profile. See `verification-output.txt` and `tests/academic.test.cjs`. The equation register is `EQUATION-SOURCES.md`. Dependency installation could not be verified: npm registry DNS resolution returned EAI_AGAIN. Full type checking, production build, browser/WebGL checks, dependency audit and deployed URL verification are outstanding. The SPT graph remains approximate. The circular eccentricity extension requires independent verification before design use. Do not equate the numerical test result with field validation or complete code compliance.

## Spectrum Academic 8.1 — BH-3 decision review

All nine original trial values continue to match the rounded report. The former generic “Review required” card has been replaced with explicit criterion failures. For BH-3, settlement values are 68.74, 91.38 and 120.04 mm; bearing factors of safety are 3.15, 3.16 and 2.72. The computed alternative uses the unchanged report pile engine: 608.54 kN safe single-pile resistance, 12.7 m tip depth and 11.2 m embedded length; corner, edge and interior reactions are 341.25, 525 and 507.5 kN per pile. Required group efficiencies are 0.5608, 0.8627 and 0.8340. These are minimum efficiencies for the assumed centred service load, excluding cap weight and downdrag, not measured group efficiencies.

`tests/bh3.test.cjs` checks status classification, report agreement, pile dimensions, reactions and efficiency. All existing tests and this new test pass. The interface changes passed TypeScript transpilation diagnostics; full dependency-aware type checking, production build and WebGL testing were not performed.

## Final submission reconciliation (28 November 2026)

The final report is `CE402_Group5_Final_Report_Spectrum_8_1.docx`. The complete `npm test` suite was rerun successfully. The nine trial footings were compared to the report: 45 bearing entries and 27 settlement entries agree within displayed rounding; all 28 site settlement and safety-factor values match. The report-case script produces 45 adjacent pairs and 32,655 kN total service load. The BH-3 decision table uses the same live calculations as the review hub. `report-results.json` contains the generated data. No engineering equations were changed during this packaging step.

A fresh package-lock-only installation attempt timed out; full dependency-aware type checking, production compilation, audit and browser/WebGL checks remain unverified. The source is ready for those deployment checks, not certified as already deployed.
