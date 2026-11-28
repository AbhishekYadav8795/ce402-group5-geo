# Calculation source register — Spectrum Academic 8.1

This register identifies the governing equations, the implementing functions and assumptions. The code includes source comments at the corresponding routines. A citation identifies the method; it does not establish that every input is a measured property or that all clauses of the standard have been implemented.

| Module / function | Equation or calculation | Reference and scope |
|---|---|---|
| P1 `stress` | Sum of moist unit weight × thickness above GWT and submerged unit weight × thickness below it | IS 6403:1981 §2.2.2; hydrostatic conditions only |
| P2 `spt` | N′ = CN N; for saturated fine sands/silts with N′ > 15, N″ = 15 + (N′−15)/2 | IS 2131:1981 §3.6, Fig. 1 (approximate digitisation); measured GWT |
| P2 `fit` | OLS slope = Σ[(σ−mean σ)(τ−mean τ)] / Σ(σ−mean σ)²; c = mean τ−slope × mean σ; φ = arctan(slope) | Mohr–Coulomb failure envelope; ordinary least squares derivation by minimisation of squared residuals |
| P3 `bearing` | B′ = B−2eB, L′ = L−2eL, A′ = B′L′ | IS 6403 §5.0.1; net resultant V=P+extra with centred extra assumed; strips treated as finite rectangles for effective area |
| P3 `bearing` | A′ = 2[R² arccos(e/R)−e√(R²−e²)]; equivalent diameter = 2√(A′/π) | Symmetric lens geometry; effective-area concept Highter & Anders (1985), pp. 659–665, DOI 10.1061/(ASCE)0733-9410(1985)111:5(659); Das, 8th ed., Fig. 4.29. Equivalent circular bearing factors are an explicit project approximation, not a specific IS 6403 clause |
| P3 `bearing` | Kern checks: 6eL/L+6eB/B ≤ 1; circle eR ≤ B/8 | Linear elastic contact pressure from P/A ± M y/I; full-compression screening, not a post-uplift analysis |
| P3 `bearing` | c reduced to 2c/3; φm = arctan(0.67 tan φ); Nc,Nq,Nγ by interpolation | IS 6403 §§5.1.1–5.1.2, Table 1 note |
| P3 `bearing` | Shape, depth, inclination and groundwater factors | IS 6403 §§5.1.2.1–5.1.2.4, Table 2; compacted backfill option; inclination γ factor truncated at zero when α ≥ φ; no sliding check |
| P3 `bearing` | qnu = cNc sc dc ic + q′(Nq−1)sq dq iq + 0.5 B′γNγ sγ dγ iγ W′; qns=qnu/FS; net demand=V/A′ | IS 6403 §§5.1.1–5.1.2; net pressure convention; homogeneous screening |
| P4 `corner`, `rect` | Integrated Boussinesq point-load kernel 3qz³/(2πr⁵); four signed corner contributions | Fadum (1948), Proc. 2nd ICSMFE, vol. 3, pp. 77–84; uniform elastic half-space |
| P4 `spread` | Δσ = qBL/[(B+z)(L+z)] | Conventional 2 vertical:1 horizontal dispersion approximation; FHWA NHI-06-089, Soils and Foundations, Vol. II, stress distribution methods |
| P5 `settlement` | Ss=C1 C2 q Σ(Iz Δz/Es); C1=max(0.5,1−0.5q′/q); C2=1+0.2log10(max(0.1,t)/0.1) | Schmertmann, Hartmann & Brown (1978), Eq. 1, Fig. 4; linear interpolation between square and strip influence diagrams; Es in MPa converted to kPa; midpoint integration ≤0.5 m |
| P5 `settlement` | Axisymmetric circular stress Δσ=q[1−(1+(R/z)²)^−1.5] | Direct radial integration of Boussinesq kernel above; eccentric circle uses equivalent-area disk, an approximation |
| P5 `settlement` | NC/OC primary clay settlement using Cr and Cc branches of e–log σ′; σ′p=OCR σ′0 | IS 8009 Part 1:1976; Das, Principles of Foundation Engineering, 8th ed., Eqs. 2.65, 2.67, 2.69. Sublayer midpoint stress and homogeneous drainage per clay layer |
| P5 `degree` | Tv=cv t/Hdr²; U=1−Σ[8/(π²(2n+1)²) exp(−(2n+1)²π²Tv/4)] | Terzaghi (1943), Theoretical Soil Mechanics, one-dimensional consolidation; early-time approximation U=2√(Tv/π) |
| P5 `totalAt` | Immediate granular contribution with time-dependent creep plus Σ Sc U(t) | Schmertmann creep correction + Terzaghi average degree; selected-time sand plus ultimate primary clay remains separate |
| Site `siteResults` | Sum neighbouring rectangular stress increments in clay; adjacent Δs=abs(si−sj); angular distortion=Δs/5000 | Boussinesq/Fadum superposition; IS 1904:1986 §16.2, §16.3.4 Table 1; assignment geometry only |
| Design `pileResistance`, `pile` | Qb=Ap Nq σ′tip; Qs=Σ perimeter × fs × thickness; Qsafe=(Qb+Qs)/2.5; Pi=P/n+M yi/Σyi² | IS 2911 Part 1/Sec 2:2010 Annex B framework and rigid cap force/moment equilibrium; site coefficients from report §7, not code-prescribed constants |
| Design `optimize` | Enumerate tested sizes; select first size meeting bearing, kern and settlement screening | Discrete search algorithm, not a global optimum or design certification |

Source scans: [IS 6403](https://law.resource.org/pub/in/bis/S03/is.6403.1981.pdf), [IS 2131](https://law.resource.org/pub/in/bis/S03/is.2131.1981.pdf), [IS 1904](https://law.resource.org/pub/in/bis/S03/is.1904.1986.pdf). Supporting settlement reference: FHWA NHI-06-089, Eq. 8-16 and Fig. 8-21. See the report references. Detailed clause/edition checks for method-level references and exact SPT graph digitisation remain group review items.

- BH-3 decision table (`lib/review.cjs`): settlement exceedance = total − 60 mm; bearing margin = net safe − net applied; minimum group efficiency = P/(n × Qsafe); group capacity at assumed efficiency 1 = n × Qsafe. Derived from report §§4–7 and IS 1904 screening criteria, with no new resistance model.
