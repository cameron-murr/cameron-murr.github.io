---
layout: project
title: Requirements Traceability Tool
subtitle: Regulatory-grade traceability from CSV/YAML inputs to structured matrix output — built around 21 CFR 820.30 and ISO 13485.
number: 1
status: complete
tags:
  - Python
  - 21 CFR 820.30
  - ISO 13485
  - Requirements Management
  - CLI Tool

problem: |
  Medical device development under 21 CFR Part 820 and ISO 13485 requires demonstrable linkage between design inputs (requirements), design outputs (test cases), and risk controls. In practice this traceability is often maintained in ad-hoc spreadsheets, making it brittle and difficult to audit.

  The goal here was to build a lightweight Python tool that treats traceability as a structured data problem: ingest requirements and test cases from version-controlled flat files (CSV or YAML), validate linkage completeness, and emit a clean matrix that can be attached to a DHF or submitted to a regulatory reviewer without manual reformatting.

  Secondary goal: structure the tool the way I'd structure a real requirements management workflow — unique requirement IDs, risk control references, verification method classifications — not just a join of two spreadsheets.

artifacts:
  - type: Source Code
    name: tracer.py — Core CLI Tool
    description: Ingests requirements + test cases, validates links, writes matrix to CSV and HTML.
    link: https://github.com/cameron-murr/req-traceability-tool
  - type: Data Schema
    name: requirements.yaml — Schema Definition
    description: Annotated example showing REQ ID format, risk control fields, and verification method enum.
    link: https://github.com/cameron-murr/req-traceability-tool/blob/main/schema/requirements.yaml
  - type: Output Artifact
    name: traceability_matrix.html — Sample Output
    description: Rendered matrix from the example dataset — 42 requirements, 3 risk controls, complete coverage.
    link: https://github.com/cameron-murr/req-traceability-tool/blob/main/examples/output/traceability_matrix.html
  - type: Documentation
    name: README — Design Rationale
    description: Explains data model decisions, regulatory basis, and how to extend to JIRA/Jama connectors.
    link: https://github.com/cameron-murr/req-traceability-tool#readme

reflection: |
  The most interesting design decision was the data model for risk controls. The naive approach is to treat a risk control as just another linked item. But under ISO 14971, risk controls need to be classified (inherent safety, protective measures, information for safety) and need to close specific hazardous situations, not just requirements. I structured the YAML schema to capture this — each risk control entry carries its classification and the hazardous situation ID it addresses.

  The practical limitation: this tool doesn't replace a purpose-built RM system for a real submission. What it does is demonstrate that I understand what those systems are doing underneath — and that I can implement the data model without a GUI.

  If I extended this, the obvious next step is a GitHub Actions workflow that runs the validator on every PR and fails the build if coverage drops below a threshold. That's the equivalent of a CI gate on traceability completeness.

standards:
  - 21 CFR 820.30 — Design Controls (design input/output linkage requirements)
  - ISO 13485:2016 §7.3 — Design and Development
  - ISO 14971:2019 — Risk Management (risk control classification)
  - FDA Design Controls Guidance (1997) — Traceability matrix recommendations
---

### Architecture Overview

The tool has three components: a parser, a validator, and a renderer.

**Parser** reads requirements from `requirements.yaml` (or CSV) and test cases from `tests.yaml`. Each requirement entry carries an ID (e.g., `SYS-REQ-014`), a text field, a verification method (`test`, `inspection`, `analysis`, `demonstration`), an optional risk control reference, and a status field (`draft`, `approved`, `deprecated`).

**Validator** checks linkage completeness — every approved requirement must have at least one linked test case, and every test case must link back to at least one requirement. Orphaned IDs on either side are flagged as errors. Risk control references are validated against a separate risk control registry.

**Renderer** outputs two formats: a flat CSV for import into DOORS or Jama, and a self-contained HTML matrix with color-coded coverage status. The HTML output is designed to be attaching-to-a-DHF readable without any tooling.

### Data Model

```yaml
# requirements.yaml — illustrative entry
requirements:
  - id: SYS-REQ-014
    text: >
      The system shall limit needle insertion force to ≤ 8 N
      under all commanded trajectories.
    category: safety
    verification_method: test
    risk_control_ref: RC-007
    status: approved
    source: ISO 11135 §6.4.2
```

```yaml
# risk_controls.yaml — corresponding entry
risk_controls:
  - id: RC-007
    hazardous_situation: HS-003
    classification: protective_measure
    description: >
      Software force limit enforced in insertion control loop;
      hardware torque cutoff at 10 N as backup.
```

### CLI Usage

```bash
# Validate and generate matrix
python tracer.py \
  --requirements ./data/requirements.yaml \
  --tests ./data/tests.yaml \
  --risk-controls ./data/risk_controls.yaml \
  --output ./output/traceability_matrix

# Output: traceability_matrix.csv + traceability_matrix.html
# Exit code 1 if validation fails (orphaned IDs, missing links)
```

Coverage report is printed to stdout on every run — total requirements, linked, unlinked, and risk control closure rate.
