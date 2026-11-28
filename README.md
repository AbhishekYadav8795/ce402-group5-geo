# Foundation Studio 8.1 — Spectrum Academic Edition

**Interactive 3D Geotechnical Engineering and Foundation Analysis Platform**

![Version](https://img.shields.io/badge/version-8.1.0-0d9488)
![Next.js](https://img.shields.io/badge/Next.js-15-171717)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)
![Three.js](https://img.shields.io/badge/Three.js-0.179-171717)
![GSAP](https://img.shields.io/badge/GSAP-3-88ce02)

| Academic information | Details |
| --- | --- |
| Institution | Indian Institute of Technology Mandi |
| School | School of Civil and Environmental Engineering |
| Course | CE 402 — Geotechnical Engineering |
| Group | 05 |
| Project | Foundation design for a proposed G+3 students’ hostel |
| Final revision | 28 November 2026 |
| Group load multiplier | 1.05 |

## Project links

| Resource | URL |
| --- | --- |
| Public website | To be added after deployment |
| GitHub repository | To be added after publication |

## 1. Project overview

Foundation Studio 8.1 (Spectrum Academic Edition) is a browser-based computational platform developed for the CE 402 course assignment. It integrates analytical geotechnical calculations with interactive three-dimensional visualization, scientific charts and a responsive, dark-first engineering dashboard.

The associated case study concerns a proposed ground-plus-three-storey reinforced concrete hostel on a 30 m × 15 m terrace in Mandi district, Himachal Pradesh. The site includes 28 columns on a 5 m grid, three exploratory boreholes, seasonal groundwater variation and a compressible clay layer that thickens towards the eastern boundary.

The platform is intended to support engineering interpretation, sensitivity analysis, comparison of foundation alternatives and reproducibility of numerical results. Its general calculation modules accept user-defined soil profiles and foundation inputs. Assignment-specific presets are editable starting points rather than hard-coded calculation constants.

## 2. Objectives

- Interpret layered soil profiles, laboratory parameters and groundwater conditions.
- Evaluate bearing capacity, stress increments and settlement using documented analytical methods.
- Investigate the influence of geometry, loading, groundwater and soil parameters on foundation performance.
- Present numerical results through linked 3D and 2D scientific visualizations.
- Support transparent engineering review through source references, numerical tests and exportable data.

## 3. Engineering analysis modules

| Module | Functionality | Analytical basis |
| --- | --- | --- |
| P1 — Soil profile | Editable stratigraphy, soil parameters, measured and design groundwater levels, interactive cutaway | Layered effective stress calculations |
| P2 — Parameter tools | SPT overburden and applicable dilatancy corrections; direct shear regression | IS 2131:1981; Mohr–Coulomb criterion |
| P3 — Bearing capacity | Strip, square, rectangular and circular footings; general/local shear, calculation factors, supported effective-area treatment | IS 6403:1981 |
| P4 — Stress distribution | Centre and corner stress beneath a rectangle; stress-depth curves and 2:1 dispersion comparison | Boussinesq solution and superposition |
| P5 — Settlement | Granular settlement, NC/OC clay consolidation, sublayer integration, drainage and time-dependent response | Schmertmann et al. (1978); one-dimensional consolidation theory |
| P8 — Reproducibility | Source code, benchmark tests, report calculation script and deployment guidance | Transparent computational workflow |

Measured groundwater is distinguished from design groundwater to support the appropriate interpretation of SPT data and foundation calculations. Inputs and outputs use explicitly labelled engineering units.

## 4. Spectrum analytics gallery

The **3D analytics atlas** provides 14 analytical datasets. Each has three linked representations: an interactive Three.js surface or bar chart, a two-dimensional heatmap and a selected-row cross-sectional line chart. These constitute 42 chart representations, not 42 independent engineering models.

| No. | Dataset | Independent variables | Plotted quantity |
| --- | --- | --- | --- |
| 01 | Horizontal stress terrain | Horizontal X/Y offsets | Vertical stress increment (kPa) |
| 02 | Vertical stress surface | Offset and depth | Vertical stress increment (kPa) |
| 03 | Bearing response | Footing width and groundwater depth | Net safe bearing capacity (kPa) |
| 04 | Settlement response | Footing width and time | Settlement (mm) |
| 05 | Consolidation kinetics | Drainage path and time | Average consolidation (%) |
| 06 | Borehole comparison | Borehole and column class | Bearing factor of safety |
| 07 | Safety envelope | Footing width and service load | Bearing factor of safety |
| 08 | Strength response | Friction angle and cohesion | Net safe bearing capacity (kPa) |
| 09 | Effective overburden stress | Depth and groundwater depth | Effective vertical stress (kPa) |
| 10 | Stress-method comparison | Footing width and depth | Absolute Boussinesq–2:1 difference (kPa) |
| 11 | Load–groundwater response | Service load and groundwater depth | Settlement (mm) |
| 12 | Consolidation rate | Coefficient of consolidation and time | Average consolidation (%) |
| 13 | Building settlement | 28-column assignment grid | Granular and ultimate primary clay settlement (mm) |
| 14 | Differential settlement | 28-column assignment grid | Maximum difference to an adjacent column (mm) |

The two building-wide datasets reproduce the assignment report's trial footing analysis, including overlapping stress contributions in clay. They are separate from the editable single-footing analysis. Other sensitivity plots sample the active input parameters or explicitly labelled hypothetical combinations. Unsupported samples appear as gaps rather than artificial zero values.

### Interactive visualization and animation

- Three.js: interactive soil cutaways, foundation geometry, site explorer, stress sections, settlement displacement and scientific chart surfaces.
- GSAP: staged model reveals, camera transitions, exploded-layer animations, staggered bar growth, animated section sweeps and timeline playback.
- Framer Motion: navigation transitions, chart-panel entrances and interactive interface feedback.
- GLSL: animated groundwater ripple effects.
- Chart controls: orbit, zoom, camera presets, grid and mesh toggles, point inspection, fullscreen where supported, replay and manual row selection.

The selected row is synchronized across the 3D chart, heatmap and line chart. Animation changes the presentation of the data, not the underlying calculations. Numerical tables and CSV exports remain available if WebGL cannot be used.

### Additional engineering tools

The design workshop includes the preliminary bored-pile arrangement, construction sequence, discrete footing-size search, site settlement and printable calculation record. The pile capacity is calculated from the report's assumptions. The project workspace saves up to 20 scenarios locally and supports JSON import/export. Saved results are recalculated when opened. No presentation mode is included.

## 5. Technology stack

| Technology | Role |
| --- | --- |
| Next.js 15 / React 19 | App Router and client-side application framework |
| TypeScript | Typed user-interface implementation |
| Tailwind CSS | Responsive layout and dark-mode styling |
| shadcn/ui-style components | Locally authored reusable controls using Radix Slot and CVA |
| Three.js | WebGL-based 3D scientific visualization |
| GSAP | Timeline, camera and scene animation |
| Framer Motion | Interface transitions and motion feedback |
| Recharts | Interactive two-dimensional charts |
| Lucide React | Interface iconography |
| Node.js | Development, static build and numerical test execution |

The application requires no database or computational backend. Engineering routines are isolated from visualization and interface logic to improve traceability, maintainability and reproducibility.

## 6. Repository structure

```text
foundation-studio-spectrum/
├── app/
│   ├── layout.tsx             # Root application layout
│   ├── page.tsx               # Dashboard and analysis modules
│   └── globals.css            # Global styling and Spectrum theme
├── components/
│   ├── ui/                    # Reusable interface components
│   ├── soil-scene.tsx         # Interactive soil/footing cutaway
│   ├── visual-lab.tsx         # 3D site, stress and settlement views
│   ├── analytics-gallery.tsx  # Linked 3D and 2D scientific charts
│   ├── design-workshop.tsx    # Foundation alternatives and optimization
│   ├── project-workspace.tsx  # Saved scenarios and JSON exchange
│   └── review-hub.tsx         # Worked cases and verification
├── lib/
│   ├── engine.cjs             # Core engineering calculation routines
│   ├── engine.d.cts           # Engine type declarations
│   ├── analytics.cjs          # Analytical dataset generation
│   ├── analytics.d.cts        # Dataset type declarations
│   ├── design.cjs             # Pile and building calculations
│   ├── project.cjs            # Scenario validation
│   ├── review.cjs             # Benchmarks and worked cases
│   └── utils.ts               # Shared interface utilities
├── tests/
│   ├── tests.js               # Core engineering regression checks
│   ├── analytics.test.cjs     # Atlas dataset checks
│   ├── spectrum.test.cjs      # Spectrum dataset checks
│   ├── audit.test.cjs         # Independent numerical checks
│   ├── academic.test.cjs      # Geometry and custom-profile checks
│   ├── bh3.test.cjs           # BH-3 alternative assessment
│   └── report_cases.js        # Assignment calculation reproduction
├── next.config.mjs            # Static export configuration
├── package.json               # Dependencies and scripts
├── tailwind.config.ts
├── tsconfig.json
├── EQUATION-SOURCES.md
├── VERIFICATION.md
├── verification-output.txt
├── SUBMISSION-CHECKLIST.md
└── README.md
```

## 7. Installation and local execution

### Prerequisites

- Node.js 22 LTS or a compatible supported release, with npm.
- A modern browser; WebGL support is recommended for 3D visualization.
- Internet access for initial dependency installation.

Extract the source archive or clone your group's repository. Open a terminal in the project directory containing `package.json` and execute:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. Select a borehole preset or define a custom profile, enter footing and loading parameters, and navigate to the desired module. Open **3D analytics atlas** to explore the Spectrum datasets.

### Production build

```bash
npm run typecheck
npm run build
```

The project is configured for static export. The generated `out/` directory contains the deployable website. To preview the exported build locally using Python, if installed:

```bash
python -m http.server 8080 --directory out
```

Open [http://localhost:8080](http://localhost:8080). A separate Next.js server is not required for this static export. Commit the dependency lockfile after a successful installation.

## 8. Numerical verification and reproducibility

Run the engineering and dataset tests:

```bash
npm test
```

To reproduce the report calculation results in a JSON file:

```bash
node tests/report_cases.js > results.json
```

The equivalent interactive command is `npm run report`.

| Verification scope | Status |
| --- | --- |
| Original engineering regression checks | 20 passed |
| Atlas dataset checks | 6 passed |
| Spectrum dataset checks | 8 passed |
| Additional invalid-input and custom-profile assertions | Passed |
| Building-wide dataset comparison | All 28 grid locations checked against the report calculation script |
| TypeScript/TSX syntax | Previously checked by transpilation |
| Independent audit groups | 15 passed |
| Final academic test groups | 6 passed |
| Report reconciliation | 9 footing cases, 28 columns and 45 adjacency pairs checked |
| BH-3 assessment | Passed regression checks |
| Full production build and live WebGL interaction | Pending dependency installation and browser testing |

The packaged verification output records successful numerical tests. They demonstrate computational consistency and regression protection, not independent engineering certification. Full framework type checking and production browser verification were not completed in the authoring environment because npm registry access was unavailable.


## 9. References

1. IIT Mandi, *CE 402 Geotechnical Engineering Assignment*, 5 November 2026.
2. Bureau of Indian Standards, IS 2131:1981, *Method for Standard Penetration Test for Soils*.
3. Bureau of Indian Standards, IS 6403:1981, *Code of Practice for Determination of Bearing Capacity of Shallow Foundations*.
4. Bureau of Indian Standards, IS 1904:1986, *Code of Practice for Design and Construction of Foundations in Soils: General Requirements*.
5. Bureau of Indian Standards, IS 8009 (Part 1):1976, *Code of Practice for Calculation of Settlements of Foundations — Shallow Foundations Subjected to Symmetrical Static Vertical Loads*.
6. Schmertmann, J. H., Hartmann, J. P., and Brown, P. R. (1978). Improved strain influence factor diagrams. *Journal of the Geotechnical Engineering Division*, 104(GT8), 1131–1135.
7. Fadum, R. E. (1948). Influence values for estimating stresses in elastic foundations. *Proceedings of the Second International Conference on Soil Mechanics and Foundation Engineering*, 3, 77–84.
8. Terzaghi, K. (1943). *Theoretical Soil Mechanics*. John Wiley & Sons.

9. Bureau of Indian Standards, IS 2911 (Part 1/Sec 2):2010, Annex B.
10. Highter and Anders (1985), *Dimensioning Footings Subjected to Eccentric Loads*, 111(5), 659–665.

The assignment-specified historical standards are retained for academic consistency. See the accompanying design report and source comments for detailed equation references, assumptions and audit evidence.

## 12. Project team

| Roll number | Group member |
| --- | --- |
| B24053 | Aaditya |
| B24055 | Abhishek Yadav |
| B24083 | Pankush Bharti |
| B24073 | Dilsher |

---

**Foundation Studio 8.1 — Spectrum Academic Edition**  
CE 402 · Group 05 · School of Civil and Environmental Engineering · IIT Mandi
