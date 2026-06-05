---
layout: project
title: Requirements Traceability Tool
subtitle: Regulatory-grade traceability from CSV/YAML inputs to structured matrix output — built around 21 CFR 820.30, ISO 13485, and ISO 14971.
number: 1
status: complete
tags:
  - Python
  - 21 CFR 820.30
  - ISO 13485
  - ISO 14971
  - Requirements Management
  - CLI Tool

problem: |
  Medical device development under 21 CFR Part 820 and ISO 13485 requires demonstrable linkage between design inputs (requirements), verification activities (test cases), and risk controls. In practice this traceability is often maintained in ad-hoc spreadsheets, making it brittle, difficult to audit, and invisible to automated quality gates.

  The goal here was to build a lightweight Python tool that treats traceability as a structured data problem: ingest requirements, test cases, and risk controls from version-controlled flat files (CSV or YAML), resolve all cross-references, detect coverage gaps and dangling links, and emit a clean matrix in multiple formats suitable for a DHF or regulatory submission without manual reformatting.

  Secondary goal: structure the tool the way a real requirements management workflow works — unique requirement IDs, typed requirement categories, hierarchical parent/child relationships, risk control classification per ISO 14971, and a validate mode that returns a non-zero exit code on coverage gaps so it can run as a CI gate.

artifacts:
  - type: Source Code
    name: medtrace — Python CLI and Library
    description: Full source — ingest, matrix builder, and five output renderers (HTML, PDF, JSON, XLSX, diff). Includes README with regulatory context and design rationale.
    link: https://github.com/cameron-murr/medtrace
  - type: Data Schema
    name: examples/requirements.csv — Example Requirements
    description: 12-requirement needle navigation device scenario with full type, source, and link annotations.
    link: https://github.com/cameron-murr/medtrace/blob/main/examples/requirements.csv
  - type: Output Artifact
    name: Sample HTML Matrix
    description: Rendered traceability matrix from the example dataset — 12 requirements, coverage statistics, gap highlighting.
    link: https://cameron-murr.github.io/medtrace/examples/sample_output/traceability_matrix.html

reflection: |
  The most consequential design decision was distinguishing two classes of broken links. A dangling link is a requirement that references an ID that doesn't exist in the loaded data — likely a typo or a deleted test case, and the kind of error that surfaces as a finding in an FDA audit. An unlinked entity is a test case or risk control that exists but isn't referenced by any requirement — likely orphaned verification work. Both get flagged, but they mean different things and warrant different corrective actions. Collapsing them into a single "missing link" error would obscure that distinction.

  The second decision was where traceability ownership lives. Links are carried on the requirement, not the test case. This mirrors the 21 CFR 820.30 model: requirements are the authoritative record, and test cases are evidence against them. A requirement with no test case IDs is visibly uncovered immediately — which is the failure mode regulators care about.

  The practical limitation: this tool doesn't replace a purpose-built RM system for a real submission. What it does is demonstrate that I understand what those systems are doing underneath — and that I can implement the data model cleanly without a GUI.

  The --validate flag with a non-zero exit code on coverage gaps is the feature that closes the loop. It means the tool can run in a GitHub Actions pipeline and fail a PR if traceability coverage drops — the equivalent of a CI gate on design control completeness.

standards:
  - 21 CFR 820.30 — Design Controls (design input/output traceability, DHF requirements)
  - ISO 13485:2016 §7.3 — Design and Development traceability
  - ISO 14971:2019 — Risk Management (risk control classification and verification traceability)
  - IEC 62366-1:2015 §5.9 — Usability Engineering (UI specification to summative evaluation traceability)
---

### Architecture Overview

The tool has three layers: ingest, matrix builder, and renderers.

**Ingest** (`medtrace/ingest.py`) reads requirements, test cases, and risk controls from CSV or YAML. A unified `load_file(path, entity)` dispatcher routes by file extension. The parser is tolerant of missing optional fields and raises clear errors on missing required fields (`id`, `title`), with line numbers for CSV sources.

**Matrix builder** (`medtrace/matrix.py`) resolves all cross-references between the three entity types, producing `ResolvedRow` objects that carry fully hydrated test case and risk control objects rather than raw ID strings. Dangling links (references to nonexistent IDs) and unlinked entities (test cases or risk controls not referenced by any requirement) are detected separately and surfaced as distinct warning classes. Coverage statistics are computed at this layer.

**Renderers** (`medtrace/renderers/`) are independently swappable. Five formats are implemented: self-contained HTML with inline CSS, paginated landscape PDF via ReportLab, structured JSON for downstream tooling integrations, XLSX with four sheets (Summary, RTM, Test Cases, Risk Controls) via openpyxl, and a diff renderer that compares two matrix snapshots and reports added, removed, and modified requirements with regression flagging.

### Data Model

```yaml
# requirements.yaml — illustrative entry
requirements:
  - id: SRS-001
    type: safety
    title: Needle Tip Localization Accuracy
    description: >
      The system shall localize the needle tip position to within
      2 mm RMS error under clinical imaging conditions.
    source: User Need UN-001
    test_case_ids: TC-001, TC-002
    risk_control_ids: RC-001
    notes: Primary accuracy requirement per predicate comparison
```

```yaml
# risk_controls.yaml — corresponding entry
risk_controls:
  - id: RC-001
    hazard: Inaccurate needle tip localization leading to unintended tissue injury
    control_measure: >
      Algorithm output bounded to maximum 5 mm deviation;
      out-of-bounds condition triggers clinician alert and locks guidance output.
    control_type: inherent_safety
    residual_risk: Residual probability remote. Risk acceptable per ISO 14971 benefit-risk analysis.
    verification_ref: TC-001
```

### CLI Usage

```bash
# Generate all four output formats
python -m medtrace \
  --requirements  examples/requirements.csv \
  --test-cases    examples/test_cases.csv   \
  --risk-controls examples/risk_controls.csv \
  --project-name  "Needle Navigation System v1.2" \
  --format        html pdf json xlsx \
  --output-dir    output/

# Validate only — exit code 1 if gaps exist (designed for CI pipelines)
python -m medtrace \
  --requirements examples/requirements.csv \
  --test-cases   examples/test_cases.csv   \
  --validate

# Filter to safety requirements and diff against a baseline version
python -m medtrace \
  --requirements  requirements_v2.csv \
  --test-cases    test_cases.csv \
  --filter-type   safety \
  --diff-against  requirements_v1.csv \
  --output-dir    output/
```

Coverage report is printed to stdout on every run — total requirements, covered, uncovered, dangling link count, and unlinked entity warnings. The `--validate` flag exits with code 1 on any uncovered requirement, dangling link, or failing test case, enabling use as a build gate in GitHub Actions.
