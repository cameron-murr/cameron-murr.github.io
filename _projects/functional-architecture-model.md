---
layout: project
title: Functional Architecture Model
subtitle: SysML functional decomposition of a robotic needle insertion subsystem — context diagram, interface definitions, and design rationale.
number: 2
status: in-progress
tags:
  - SysML
  - Functional Architecture
  - Interventional Robotics
  - Interface Control
  - Papyrus / Eclipse

problem: |
  Systems architecture for a surgical robot is most useful when it's done before detailed design — when there's still room to surface ambiguous interfaces, misallocated functions, and missing requirements. Most published SysML examples are either toy problems or retroactively describe systems that already exist.

  This project takes a different approach: model the functional architecture of a needle insertion subsystem similar in concept to Mendaera's Focalist system (needle guidance for ablation procedures) at the level of detail a systems engineer would produce early in development. The goal is a model package that a design team could use as the basis for interface control documents and a requirements allocation matrix — not just an illustration.

artifacts:
  - type: SysML Model
    name: Context Diagram (BDD)
    description: System boundary, external actors, and primary information/energy flows.
    status: in-progress
  - type: SysML Model
    name: Functional Decomposition (BDD + IBD)
    description: Needle guidance broken into sensing, planning, actuation, and safety monitor subsystems with interfaces.
    status: in-progress
  - type: Document
    name: Interface Control Document — Draft
    description: Structured definition of all inter-subsystem interfaces: signal, mechanical, thermal, data.
    status: in-progress
  - type: Document
    name: Design Rationale Record
    description: Explains decomposition decisions and alternative architectures considered.
    status: in-progress

reflection: |
  In progress. Initial observations: the hardest decomposition decision is where to put the safety monitor. The simplest architecture gives it visibility into actuation states and sensor outputs but makes it a passive observer. A more robust design makes it an active participant with command authority — which means it needs its own interface to the actuation subsystem, separate from the planning layer's interface. This changes the IBD significantly and is the kind of decision that gets made in architecture reviews, not during implementation.

standards:
  - ISO/IEC 19514 — SysML 1.4 specification
  - OMG SysML 1.6
  - ISO 13485 §7.3.3 — Design and development outputs
  - 21 CFR 820.30(d) — Design output requirements
  - IEC 60601-1 §4.3 — Risk management process reference
---

### Approach

This model is being built in Papyrus (Eclipse-based, open source SysML tooling) and exported to SVG/PNG for documentation. The model package is organized as:

**Level 0 — Context Diagram**: Defines system boundary. External actors include the surgeon, imaging system (fluoroscopy/CT), patient, and facility network. Primary flows into the system: surgeon commands, image data, patient anatomy. Flows out: needle position telemetry, status display, audit log.

**Level 1 — Functional Decomposition**: Four primary subsystems identified:

- **Sensing Subsystem** — processes image feeds and needle position sensors; outputs a unified spatial model
- **Path Planning Subsystem** — consumes the spatial model and surgeon intent; outputs a commanded trajectory
- **Actuation Subsystem** — executes commanded trajectories against the physical needle insertion mechanism
- **Safety Monitor** — cross-cuts the above; intercepts out-of-envelope commands and maintains a fault log

**Interface Definition**: Each subsystem interface is being defined with: signal name, data type/format, directionality, timing/frequency, error handling behavior, and the requirement(s) it serves. This becomes the basis for the ICD document.

### Modeling Decisions

The sensing and planning layers are deliberately kept separate even though they could be collapsed. The boundary between them is the point where raw sensor data becomes a coordinate-space representation — a meaningful interface because it's where calibration uncertainty lives and where a safety argument about spatial accuracy needs to be made.

The safety monitor is currently modeled as a separate block with its own interface to actuation (command veto authority). An alternative — making it an aspect of the planning layer — was considered and rejected because it would conflate functional correctness with safety integrity, which makes independent V&V harder.
