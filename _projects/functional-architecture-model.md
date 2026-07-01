---
layout: project
title: Functional Architecture Model
subtitle: SysML functional decomposition of a robotic bronchoscopy navigation subsystem — interface registry, requirements hierarchy, formal Papyrus model, and medtrace-generated RTM.
number: 2
status: complete
tags:
  - SysML
  - Functional Architecture
  - Interventional Robotics
  - Interface Control
  - Papyrus / Eclipse
  - Requirements Traceability

problem: |
  Model-Based Systems Engineering (MBSE) and SysML give engineers a formal language for decomposing complex systems before any hardware or software exists. Rather than managing architecture in documents and spreadsheets, a SysML model captures system structure, interfaces, behavior, and requirements in a single connected artifact. This makes it possible to catch interface conflicts, trace requirements to design decisions, and validate architectural assumptions earlier and more rigorously than document-based approaches allow.

  I built a functional architecture model for a Robotic Bronchoscopy Navigation Subsystem (RBNS) at the level of detail a systems engineer would produce in early-phase development. The RBNS maintains a real-time estimate of bronchoscope tip position via multi-source sensor fusion, plans a path through the airway tree to a target nodule, and generates motion guidance commands for a downstream robot motion controller.

  The deliverables are a change-controlled interface registry, a four-tier requirements hierarchy, a formal SysML model built in Papyrus, and a requirements traceability matrix (RTM) generated using [medtrace](/projects/requirements-traceability-tool/). Together these artifacts give a design team the basis for interface control documents, a verification plan, and a risk management file.

artifacts:
  - type: SysML Model + Documentation
    name: RBNS Architecture — Full Repository
    description: Interface registry, requirements hierarchy, design decisions, Papyrus SysML model (8 diagrams), and medtrace RTM. All artifacts version-controlled and internally consistent.
    link: https://github.com/cameron-murr/Robotic-Surgical-Architecture-Model
  - type: Output Artifact
    name: Requirements Traceability Matrix (HTML)
    description: medtrace-generated RTM — 31 requirements across four tiers, 31 planned verification activities, 100% coverage. All test cases not_run, reflecting architecture-phase status.
    link: https://cameron-murr.github.io/Robotic-Surgical-Architecture-Model/docs/medtrace-output/rtm.html
  - type: Document
    name: Interface Registry
    description: Canonical, change-controlled definition of all 26 interfaces across three tiers — external, inter-subsystem, and intra-subsystem — with data items, rates, latency requirements, and a naming mapping to the Papyrus model.
    link: https://github.com/cameron-murr/Robotic-Surgical-Architecture-Model/blob/main/docs/interface_registry.md
  - type: Document
    name: Requirements Hierarchy
    description: Four-tier requirements set (5 user needs, 6 system requirements, 17 subsystem requirements, 3 component requirements) with allocation, verification methods, and parent-child trace links. System requirements scoped to the full bronchoscopy platform; subsystem requirements scoped to the RBNS.
    link: https://github.com/cameron-murr/Robotic-Surgical-Architecture-Model/blob/main/docs/requirements.md
  - type: Document
    name: Design Decisions Record
    description: Six key architectural decisions with rationale — sensor fusion architecture, uncertainty as an explicit interface signal, replanning inhibition under uncertainty, the sensor feed exception to Supervisor centralization, registry-as-source-of-truth, and requirements hierarchy scoping.
    link: https://github.com/cameron-murr/Robotic-Surgical-Architecture-Model/blob/main/docs/design_decisions.md

reflection: |
  I've read about MBSE in the context of medical device development, but this was my first time building a full model from scratch. The process of formally defining every interface and allocating every requirement to a specific block surfaced gaps and contradictions that wouldn't have been visible in a document-based approach.

  Building the requirements hierarchy required me to distinguish between tiers that operate at different levels of the architecture. System requirements describe what the full bronchoscopy platform must do from a clinical perspective. Subsystem requirements describe what the RBNS must do to satisfy them. Component requirements are derived from analysis. For example, the required bronchoscope tip articulation range is calculated from kinematic reach analysis of the airway geometry, not specified as a clinical need. Getting the scoping right keeps higher-level requirements from encoding implementation decisions before the analysis exists to support them.

  I used the interface registry as a canonical source of truth rather than treating diagrams as authoritative. Diagrams are representations of the architecture; the registry is the architecture. Running [medtrace](/projects/requirements-traceability-tool/) against the completed requirements set produced a clean RTM with 100% coverage and all test cases marked not_run, which is the correct state for an architecture-phase artifact: verification has been planned and every requirement has a defined method, but no testing has been executed yet.

standards:
  - OMG SysML 1.6
  - ISO 13485 §7.3.3 — Design and development outputs
  - 21 CFR 820.30(d) — Design output requirements
  - 21 CFR 820.30(j) — Design history file
  - ISO 14971:2019 — Risk management (RTM references)
  - IEC 62304 — Software lifecycle (referenced in companion GSL documentation)
---

### Architecture Overview

The model package is organized around a single canonical interface registry and a four-tier requirements hierarchy, with the SysML model built from both.

**System boundary**: The Robotic Bronchoscopy Navigation Subsystem (RBNS) receives a preoperative airway model and target nodule coordinates, maintains a real-time tip position estimate, and outputs motion guidance commands. It excludes the robot kinematics and actuation stack, the imaging hardware, and the surgeon console rendering pipeline, each of which is separated from the RBNS by a defined interface.

<figure class="project-figure">
  <img src="https://raw.githubusercontent.com/cameron-murr/Robotic-Surgical-Architecture-Model/main/model/diagrams/D2_system_context.svg" alt="System context block definition diagram showing the RBNS at the center surrounded by seven external actors, including the Preoperative Planning System, CBCT Imaging System, Robot Motion Controller, Operator Console, Safety and Interlock System, Procedure Data Recorder, and Bronchoscope Camera, connected by eleven labeled external interfaces">
  <figcaption>System context (BDD) — the RBNS and its complete external interface surface, before any internal structure is defined.</figcaption>
</figure>

<figure class="project-figure">
  <img src="https://raw.githubusercontent.com/cameron-murr/Robotic-Surgical-Architecture-Model/main/model/diagrams/D3_structural_hierarchy.svg" alt="Structural hierarchy block definition diagram showing the RBNS decomposed into Localization & Tracking, Path Planning & Guidance, Image Processing & Registration, and Procedure Supervisor subsystems">
  <figcaption>Structural hierarchy (BDD) — the RBNS decomposed into its four primary subsystems.</figcaption>
</figure>

**Functional decomposition**: Four primary subsystems:

- **Localization & Tracking** — fuses proprioceptive (forward kinematics), vision-based, and CBCT image-registration position estimates into a single tip pose with an explicit 3D uncertainty ellipsoid via Extended Kalman Filter
- **Path Planning & Guidance** — plans an airway route to the target using A* on the preoperative airway graph, updates it in real time, and generates safety-bounded guidance commands
- **Image Processing & Registration** — ingests intraoperative CBCT volumes and registers them to the preoperative model, producing a registered volume and a confidence score
- **Procedure Supervisor** — primary external interface point; manages a six-state procedure state machine and centralizes fault handling

**Interface registry**: 26 interfaces defined across three tiers — 11 external (Tier 1), 8 inter-subsystem (Tier 2), 7 intra-subsystem (Tier 3) — each with data items, rate, latency requirement, and direction. Change-controlled with a changelog; all downstream artifacts conform to it.

<figure class="project-figure">
  <img src="https://raw.githubusercontent.com/cameron-murr/Robotic-Surgical-Architecture-Model/main/model/diagrams/D4_RBNS_internal_structure.svg" alt="Internal block diagram showing the RBNS opened up to reveal its four internal subsystems, their interconnections, and the eleven external boundary ports routing to the subsystems that consume or produce each interface">
  <figcaption>Internal structure (IBD) — internal connectors between subsystems plus the complete realization of external boundary ports, including the Supervisor routing exception for high-rate sensor feeds.</figcaption>
</figure>

**Requirements hierarchy**: 31 requirements across four tiers. User needs are clinical intent statements. System requirements describe platform-level capabilities without specifying internal architecture. Subsystem requirements allocate functional and safety obligations to specific RBNS blocks. Component requirements are derived values pending kinematic and statistical analyses, explicitly marked TBD rather than filled with invented numbers.

### Requirements Sample

A representative subset across all four tiers. <a href="https://github.com/cameron-murr/Robotic-Surgical-Architecture-Model/blob/main/docs/requirements.md" target="_blank">Full requirements hierarchy →</a>

<style>
.req-table { width: 100%; border-collapse: collapse; font-family: var(--font-mono); font-size: 0.72rem; margin-bottom: 2rem; }
.req-table th { text-align: left; padding: 0.5rem 0.75rem; border-bottom: 2px solid var(--rule); color: var(--ink-tertiary); letter-spacing: 0.06em; text-transform: uppercase; font-weight: 500; white-space: nowrap; }
.req-table td { padding: 0.5rem 0.75rem; border-bottom: 1px solid var(--rule); color: var(--ink-secondary); vertical-align: top; }
.req-table td:first-child { color: var(--accent); white-space: nowrap; font-weight: 500; }
.req-table tr:last-child td { border-bottom: none; }
.req-tier-label { font-family: var(--font-mono); font-size: 0.65rem; color: var(--ink-tertiary); letter-spacing: 0.1em; text-transform: uppercase; margin: 1.5rem 0 0.5rem; }
</style>

<p class="req-tier-label">Tier 1 — User Needs</p>
<table class="req-table">
  <thead>
    <tr><th style="width:100px">ID</th><th>User Need</th></tr>
  </thead>
  <tbody>
    <tr><td>UN-001</td><td>Physicians need to navigate a bronchoscope to a target nodule identified in preoperative imaging in order to obtain a tissue biopsy.</td></tr>
    <tr><td>UN-003</td><td>Patients need assurance that navigation will not cause unintended injury to the airway.</td></tr>
  </tbody>
</table>

<p class="req-tier-label">Tier 2 — System Requirements</p>
<table class="req-table">
  <thead>
    <tr><th style="width:100px">ID</th><th>Requirement</th><th style="width:140px">Derived From</th><th style="width:60px">Verif.</th></tr>
  </thead>
  <tbody>
    <tr><td>SYS-REQ-001</td><td>The system shall enable a physician to navigate a flexible bronchoscope to target pulmonary nodules identified in preoperative imaging.</td><td>UN-001, UN-002</td><td>A, D</td></tr>
    <tr><td>SYS-REQ-006</td><td>The system shall detect conditions under which navigation accuracy cannot be assured and shall prevent scope motion under those conditions.</td><td>UN-003</td><td>T, A</td></tr>
  </tbody>
</table>

<p class="req-tier-label">Tier 3 — Subsystem Requirements</p>
<table class="req-table">
  <thead>
    <tr><th style="width:100px">ID</th><th>Requirement</th><th style="width:90px">Allocated To</th><th style="width:160px">Traces To</th><th style="width:60px">Verif.</th></tr>
  </thead>
  <tbody>
    <tr><td>SUB-REQ-001</td><td>The RBNS shall produce a fused bronchoscope tip pose estimate at a rate of no less than 30 Hz during the NAVIGATE phase.</td><td>1.0 / 1.4</td><td>SYS-REQ-001, SYS-REQ-002</td><td>T</td></tr>
    <tr><td>SUB-REQ-006</td><td>The RBNS shall command zero scope advancement (HOLD) within one guidance cycle of the tip position uncertainty exceeding the configured threshold.</td><td>2.3</td><td>SYS-REQ-003, SYS-REQ-006</td><td>T</td></tr>
    <tr><td>SUB-REQ-008</td><td>The RBNS shall implement the procedure state machine with states IDLE, NAVIGATE, CONFIRM, BIOPSY, FAULT, and ABORT, with transitions as defined in the RBNS procedure state machine model (D7).</td><td>4.0</td><td>SYS-REQ-004</td><td>T, D</td></tr>
  </tbody>
</table>

<p class="req-tier-label">Tier 4 — Component Requirements</p>
<table class="req-table">
  <thead>
    <tr><th style="width:100px">ID</th><th>Requirement</th><th style="width:180px">Allocated To</th><th style="width:140px">Derived From</th><th style="width:200px">Method of Derivation</th><th style="width:60px">Verif.</th></tr>
  </thead>
  <tbody>
    <tr><td>COMP-REQ-001</td><td>The Guidance Command Generator shall support distal tip articulation commands of up to [TBD] degrees per axis sufficient to follow airway centerline curvature at branch points up to the generation depth required by SYS-REQ-001.</td><td>GuidanceCommandGenerator</td><td>SYS-REQ-001, SUB-REQ-014</td><td>Kinematic reach analysis against airway centerline geometry</td><td>A, T</td></tr>
  </tbody>
</table>

**SysML model**: Eight diagrams built in Papyrus with the SysML 1.6 profile. IBDs include both internal connectors and outer boundary ports, making each diagram a complete picture of its block's internal structure and external interface realizations. The D7 state machine includes entry actions, guard conditions, and a FinalState.

<figure class="project-figure">
  <img src="https://raw.githubusercontent.com/cameron-murr/Robotic-Surgical-Architecture-Model/main/model/diagrams/D7_RBNS_state_machine.svg" alt="State machine diagram showing the six-state procedure flow: IDLE, NAVIGATE, CONFIRM, BIOPSY, FAULT, and ABORT, with guard conditions and entry actions">
  <figcaption>Procedure state machine (D7) — six states with entry actions and guard conditions.</figcaption>
</figure>

**Requirements traceability**: All 31 requirements linked to 31 planned verification activities via [medtrace](/projects/requirements-traceability-tool/). The RTM is generated from `requirements.csv` and `test_cases.csv` and is available in the repository in HTML and PDF formats.

### Data Model

```
Interface Registry (3 tiers, 26 interfaces)
    ↓ governs
SysML Model (8 diagrams, Papyrus SysML 1.6)
    ↓ implements
Requirements Hierarchy (4 tiers, 31 requirements)
    ↓ traced by
medtrace RTM (31 test cases, 100% coverage)
```

### Modeling Decisions

**Sensor fusion over single-source ground truth.** CBCT registration is periodic (radiation dose limits frequency) and high-accuracy; proprioceptive and vision estimates are continuous but lower-accuracy. An EKF fuses all three, treating CBCT registration as a periodic high-accuracy correction to a continuous lower-accuracy estimate, which is the appropriate model for this sensor topology.

**Uncertainty as a mandatory typed interface field.** IF-01 carries a 3D uncertainty ellipsoid alongside the pose estimate. Downstream path planning gates replanning on this value: if uncertainty exceeds a configurable threshold, the system commands HOLD rather than acting on an estimate it cannot trust. Making uncertainty explicit on the interface makes the safety rule testable and the interface formally verifiable.

**Supervisor centralization with a defined sensor exception.** Command, control, status, and logging interfaces route through the Procedure Supervisor. High-rate sensor feeds (encoder telemetry at 100 Hz, endoscopic video at 30 Hz, CBCT volumes) connect directly to their consuming subsystem. Routing continuous high-bandwidth sensor data through a central relay that exists to manage a six-state procedure machine would add latency with no architectural benefit.

**Registry audit as a defect-detection mechanism.** The initial draw.io concept sketches contained two defects not visible from the diagrams alone: an undocumented external camera interface and a guidance command routed incorrectly. Both were found by auditing diagrams against the registry. The sketches are preserved in `/sketches` to document this.
