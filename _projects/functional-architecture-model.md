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
  Systems architecture for a robotic surgical subsystem is most useful when it's done before detailed design — when there's still room to surface ambiguous interfaces, misallocated functions, and missing requirements. Most published SysML examples are either toy problems or retroactively describe systems that already exist.

  This project takes a different approach: model the functional architecture of a robotic bronchoscopy navigation subsystem at the level of detail a systems engineer would produce early in development. The subsystem maintains a real-time estimate of bronchoscope tip position via multi-source sensor fusion, plans a path through the airway tree to a target nodule, and generates motion guidance commands for a downstream robot motion controller. The deliverables are a change-controlled interface registry, a four-tier requirements hierarchy, a formal SysML model, and a medtrace-generated requirements traceability matrix — artifacts a design team could use as the basis for interface control documents, a verification plan, and a risk management file.

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
  Establishing the interface registry as the canonical source of truth — rather than treating diagrams as authoritative — surfaced two real defects in the initial concept sketches: an undocumented camera interface feeding the localization subsystem, and a routing contradiction where a guidance command appeared to bypass the central Supervisor. Both were caught by auditing diagrams against the registry. The sketches are retained in the repository to document this process.

  Building the requirements hierarchy required resolving a scoping question that's easy to get wrong: system requirements and subsystem requirements are different tiers addressing different levels of the architecture. The system requirements describe what the full bronchoscopy platform must do from a clinical perspective; the subsystem requirements describe what the RBNS must do to satisfy them. A further distinction emerged between subsystem and component requirements — a component requirement for bronchoscope tip articulation range is a derived value produced by kinematic reach analysis, not a clinical assertion. Getting this right matters because it determines what analysis is required before the number can be specified.

  A second architectural judgment surfaced during IBD construction: Design Decision 5 originally stated that all external interfaces route through the Procedure Supervisor. Building the internal block diagrams in Papyrus exposed a contradiction — routing 100 Hz encoder telemetry and 30 Hz endoscopic video through a central relay that exists to manage a six-state procedure machine adds latency with no architectural benefit. The decision was amended to define an explicit exception for high-rate sensor feeds. The interface registry had this right from the start; the written design decision had not caught up. This is exactly the kind of inconsistency that a registry-first approach is supposed to catch.

  Running medtrace against the completed requirements set produced a clean RTM on the first attempt after correcting the column linkage schema. 100% coverage with all test cases not_run is the correct and honest state for an architecture-phase model — every requirement has a defined verification method and a planned test case, while being explicit that none have been executed.

standards:
  - OMG SysML 1.6
  - ISO 13485 §7.3.3 — Design and development outputs
  - 21 CFR 820.30(d) — Design output requirements
  - 21 CFR 820.30(j) — Design history file
  - ISO 14971:2019 — Risk management (RTM references)
  - IEC 62304 — Software lifecycle (referenced in companion GSL documentation)
---

### Architecture Overview

The model package is organized around a single canonical interface registry and a four-tier requirements hierarchy, with the SysML model built from both rather than the other way around. This sequencing — registry and requirements before diagrams — is the key architectural discipline: diagrams conform to the registry, not vice versa.

**System boundary**: The Robotic Bronchoscopy Navigation Subsystem (RBNS) receives a preoperative airway model and target nodule coordinates, maintains a real-time tip position estimate, and outputs motion guidance commands. It excludes the robot kinematics and actuation stack, the imaging hardware, and the surgeon console rendering pipeline — each separated from the RBNS by a defined interface.

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
- **Procedure Supervisor** — primary external interface point; runs the six-state procedure state machine (IDLE → NAVIGATE → CONFIRM → BIOPSY → FAULT → ABORT) and centralizes fault handling

**Interface registry**: 26 interfaces defined across three tiers — 11 external (Tier 1), 8 inter-subsystem (Tier 2), 7 intra-subsystem (Tier 3) — each with data items, rate, latency requirement, and direction. Change-controlled with a changelog; all downstream artifacts conform to it.

<figure class="project-figure">
  <img src="https://raw.githubusercontent.com/cameron-murr/Robotic-Surgical-Architecture-Model/main/model/diagrams/D4_RBNS_internal_structure.svg" alt="Internal block diagram showing the RBNS opened up to reveal its four internal subsystems, their interconnections, and the eleven external boundary ports routing to the subsystems that consume or produce each interface">
  <figcaption>Internal structure (IBD) — internal connectors between subsystems plus the complete realization of external boundary ports, including the Supervisor routing exception for high-rate sensor feeds.</figcaption>
</figure>

**Requirements hierarchy**: 31 requirements across four tiers. User needs are clinical intent statements. System requirements describe platform-level capabilities without specifying internal architecture. Subsystem requirements allocate functional and safety obligations to specific RBNS blocks. Component requirements are derived values pending kinematic and statistical analyses — explicitly marked TBD rather than filled with invented numbers.

**SysML model**: Eight diagrams built in Papyrus with the SysML 1.6 profile. IBDs include both internal connectors and outer boundary ports, making each diagram a complete picture of its block's internal structure and external interface realizations. The D7 state machine includes entry actions, guard conditions, and a FinalState, and satisfies SUB-REQ-008 directly.

<figure class="project-figure">
  <img src="https://raw.githubusercontent.com/cameron-murr/Robotic-Surgical-Architecture-Model/main/model/diagrams/D7_RBNS_state_machine.svg" alt="State machine diagram showing the six-state procedure flow: IDLE, NAVIGATE, CONFIRM, BIOPSY, FAULT, and ABORT, with guard conditions and entry actions">
  <figcaption>Procedure state machine (D7) — six states with entry actions and guard conditions, satisfying SUB-REQ-008.</figcaption>
</figure>

**Requirements traceability**: All 31 requirements linked to 31 planned verification activities via medtrace. The RTM is generated from `requirements.csv` and `test_cases.csv` and is available in the repository in HTML and PDF formats.

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

**Sensor fusion over single-source ground truth.** CBCT registration is periodic (radiation dose limits frequency) and high-accuracy; proprioceptive and vision estimates are continuous but lower-accuracy. An EKF fuses all three, treating CBCT registration as a periodic high-accuracy correction to a continuous lower-accuracy estimate — the appropriate model for this sensor topology.

**Uncertainty as a mandatory typed interface field.** IF-01 carries a 3D uncertainty ellipsoid alongside the pose estimate. Downstream path planning gates replanning on this value: if uncertainty exceeds a configurable threshold, the system commands HOLD rather than acting on an estimate it cannot trust. Making uncertainty explicit on the interface makes the safety rule testable and the interface formally verifiable.

**Supervisor centralization with a defined sensor exception.** Command, control, status, and logging interfaces route through the Procedure Supervisor. High-rate sensor feeds (encoder telemetry at 100 Hz, endoscopic video at 30 Hz, CBCT volumes) connect directly to their consuming subsystem. Routing continuous high-bandwidth sensor data through a central relay that exists to manage a six-state procedure machine would add latency with no architectural benefit.

**Registry audit as a defect-detection mechanism.** The initial draw.io concept sketches contained two defects not visible from the diagrams alone: an undocumented external camera interface and a guidance command routed incorrectly. Both were found by auditing diagrams against the registry — the direction that catches errors. The sketches are preserved in `/sketches` to document this.
