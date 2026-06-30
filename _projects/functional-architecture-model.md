---
layout: project
title: Functional Architecture Model
subtitle: SysML functional decomposition of a robotic bronchoscopy navigation subsystem — interface registry, requirements hierarchy, and design rationale.
number: 2
status: in-progress
tags:
  - SysML
  - Functional Architecture
  - Interventional Robotics
  - Interface Control
  - Papyrus / Eclipse

problem: |
  Systems architecture for a robotic surgical subsystem is most useful when it's done before detailed design — when there's still room to surface ambiguous interfaces, misallocated functions, and missing requirements. Most published SysML examples are either toy problems or retroactively describe systems that already exist.

  This project takes a different approach: model the functional architecture of a robotic bronchoscopy navigation subsystem at the level of detail a systems engineer would produce early in development. The subsystem maintains a real-time estimate of bronchoscope tip position via multi-source sensor fusion, plans a path through the airway tree to a target nodule, and generates motion guidance commands for a downstream robot motion controller. The goal is a model package — interface registry, requirements hierarchy, and SysML model — that a design team could use as the basis for interface control documents and a verification plan, not just an illustration.

artifacts:
  - type: Document
    name: Interface Registry
    description: Canonical, change-controlled definition of all interfaces across three tiers — external, inter-subsystem, and intra-subsystem — including data items, rates, and latency requirements.
    status: complete
  - type: Document
    name: Requirements Hierarchy
    description: Four-tier requirements set (user needs, system requirements, subsystem requirements, component requirements) with allocation and verification methods, structured for traceability analysis.
    status: complete
  - type: Document
    name: Design Decisions Record
    description: Key architectural decisions with rationale, including sensor fusion architecture, uncertainty propagation, replanning inhibition, and centralized fault handling.
    status: complete
  - type: SysML Model
    name: Papyrus SysML Model Set
    description: Eight SysML diagrams — system context, structural hierarchy, internal block diagrams for each subsystem, a procedure supervisor state machine, and a requirements traceability diagram.
    status: in-progress

reflection: |
  Establishing the interface registry as the canonical source of truth — rather than treating diagrams as authoritative — surfaced two real defects in the initial concept sketches: an undocumented camera interface feeding the localization subsystem, and a routing contradiction where a guidance command appeared to bypass the central supervisor. Both were caught by auditing diagrams against the registry, which is the direction that catches errors; auditing a registry against diagrams would not have.

  Building out the requirements hierarchy clarified a distinction that's easy to get wrong: a system requirement should describe a required capability — reach into a defined airway workspace — rather than a specific kinematic implementation, such as a bend angle. The bend angle is a derived component requirement, produced by kinematic analysis against the workspace requirement, not asserted from clinical need directly. Getting this level of decomposition right is exactly the kind of judgment that distinguishes a requirement from a design solution.

  The formal SysML model is built in Papyrus with the SysML 1.6 profile, working from the interface registry and requirements hierarchy as source material. Eight diagrams cover model organization, system context, structural hierarchy, internal block structure at two levels, the RBNS procedure state machine, and requirements traceability.

standards:
  - ISO/IEC 19514 — SysML 1.4 specification
  - OMG SysML 1.6
  - ISO 13485 §7.3.3 — Design and development outputs
  - 21 CFR 820.30(d) — Design output requirements
  - IEC 60601-1 §4.3 — Risk management process reference
---

### Approach

The model package is organized around a single canonical interface registry and a four-tier requirements hierarchy, with the SysML model built from both rather than the other way around.

**System boundary**: The Robotic Bronchoscopy Navigation Subsystem (RBNS) receives a preoperative airway model and target nodule coordinates, maintains a real-time tip position estimate, and outputs motion guidance commands. It excludes the robot kinematics and actuation stack, the imaging hardware, and the surgeon console rendering pipeline — each separated from the RBNS by a defined interface.

**Functional decomposition**: Four primary subsystems:

- **Localization & Tracking** — fuses proprioceptive (forward kinematics), vision-based, and image-registration position estimates into a single tip pose with an explicit 3D uncertainty ellipsoid
- **Path Planning & Guidance** — plans an airway route to the target, updates it in real time, and generates guidance commands
- **Image Processing & Registration** — ingests intraoperative imaging volumes and registers them to the preoperative model, producing a registration confidence score
- **Procedure Supervisor** — the sole external interface point; runs the procedure state machine and centralizes fault handling

**Interface registry**: All interfaces — external, inter-subsystem, and intra-subsystem — are defined in a single change-controlled registry: data items, units, rates, and latency requirements. Diagrams and documents conform to the registry; discrepancies are treated as defects in the downstream artifact.

**Requirements hierarchy**: User needs, system requirements, subsystem requirements, and component requirements, each with a verification method and a trace to its parent tier. Several component requirements remain explicitly open (TBD), pending kinematic and statistical analyses not yet performed — surfaced rather than filled in with placeholder values.

### Modeling Decisions

**Sensor fusion over single-source ground truth.** Image-based registration is periodic and high-accuracy; proprioceptive and vision-based estimates are continuous but lower-accuracy. Rather than treating registration as ground truth, an Extended Kalman Filter fuses all three, treating registration as a periodic correction to a continuous estimate — the appropriate model given how infrequently registration can run.

**Uncertainty as an explicit interface output.** The localization subsystem's output to path planning carries a 3D uncertainty ellipsoid alongside the position estimate, not as optional metadata but as a mandatory typed field. This makes a downstream safety rule possible: when position uncertainty exceeds a configurable threshold, replanning is inhibited and the system holds rather than acts on an estimate it cannot trust.

**Procedure Supervisor as sole external interface point.** No internal subsystem communicates directly with an external system — all external interfaces route through the supervisor. This keeps the functional subsystems independently testable (they can be driven by supervisor-equivalent commands without a live console or imaging system) and centralizes fault response logic in one place.

---

Full documentation — interface registry, requirements hierarchy, design decisions, and the SysML build plan — is in the project repository.
