---
layout: project
title: IEC 62304 Software Development Plan
subtitle: A complete SDP written against the IEC 62304 lifecycle for the robotic arm's Python command sequencing layer — from planning through verification.
number: 4
status: planned
tags:
  - IEC 62304
  - Software Lifecycle
  - Regulatory
  - Verification & Validation
  - Class B Software

problem: |
  IEC 62304 is the primary international standard for medical device software lifecycle processes. Most engineers encounter it through compliance checklists or auditor questions — not by writing a development plan from scratch against its requirements.

  This project produces a complete SDP for a real software system (the Python command sequencing layer from Project 03) using IEC 62304 as the structural and content framework. The document will cover all 62304 lifecycle phases: software development planning, requirements, architectural design, detailed design, implementation, integration and integration testing, system testing, and release. Software safety class: Class B (software failure can result in injury, non-life-threatening).

  Writing a real SDP — not a template — against a real codebase makes the standard concrete in a way that reading it never does.

artifacts:
  - type: Document
    name: Software Development Plan
    description: Full SDP structured to IEC 62304 section references. Covers all lifecycle phases for the Python arm controller layer.
    status: in-progress
  - type: Document
    name: Software Requirements Specification
    description: Functional and non-functional requirements for the Python layer, traceable to system requirements from Project 01 methodology.
    status: in-progress
  - type: Document
    name: Software Architecture Document
    description: Module decomposition, inter-module interfaces, and rationale for safety-critical design decisions.
    status: in-progress
  - type: Document
    name: Verification Protocol + Results
    description: Unit test plan, integration test protocol, and recorded results — structured to satisfy 62304 §5.7.
    status: in-progress

reflection: |
  Planned. The primary challenge I anticipate is the software safety class determination — Class B vs Class C turns on whether a software failure could result in serious injury or death. For the robotic arm in isolation, Class B is defensible. But the same architecture applied to a real surgical system would likely be Class C, which triggers additional requirements (e.g., formal methods for architectural design, additional verification of safety mechanisms). I'll document this reasoning explicitly in the SDP so the class determination is transparent and auditable rather than asserted.

standards:
  - IEC 62304:2006+A1:2015 — Medical device software lifecycle processes (primary)
  - IEC 62304 Guidance Document (IMDRF, 2021)
  - FDA Guidance — Software as a Medical Device (SaMD): Clinical Evaluation (2017)
  - FDA Guidance — Content of Premarket Submissions for Device Software Functions (2023)
  - ISO 14971:2019 — Risk management (software risk controls)
---

### Document Structure (Planned)

The SDP will follow IEC 62304's lifecycle phases as its section structure, with each section explicitly referencing the 62304 clause(s) it satisfies:

**§1 — Scope and Software Safety Classification**
Defines the software item (Python command sequencing layer), its boundaries, and the safety class determination. Will include the hazard analysis rationale supporting Class B assignment.

**§2 — Software Development Planning (62304 §5.1)**
Development methodology (iterative with version-controlled milestones), tools and tool qualification rationale, configuration management approach (git + semantic versioning), and problem resolution process.

**§3 — Software Requirements Analysis (62304 §5.2)**
Functional requirements derived from system-level requirements (ICD from Project 03). Non-functional requirements: timing, error handling behavior, testability. Requirements are tagged with risk control references where applicable.

**§4 — Software Architectural Design (62304 §5.3)**
Module decomposition: session manager, command builder, sequence executor, fault handler. Interface specifications between modules. Identification of software items that implement risk controls — these receive heightened verification attention per 62304.

**§5 — Software Detailed Design (62304 §5.4)**
Function-level specifications for each module. Input/output contracts, error handling paths, and the detailed design rationale for the watchdog integration with the Arduino firmware layer.

**§6 — Software Implementation (62304 §5.5)**
Coding standards, static analysis tooling (pylint, mypy), and peer review records.

**§7 — Integration and Integration Testing (62304 §5.6)**
Integration sequence — modules added incrementally with integration tests at each step. Test cases are traceable to software requirements.

**§8 — System Testing (62304 §5.7)**
Black-box test protocol against the SRS. Includes boundary condition tests, fault injection tests (simulate comms loss, CRC errors), and regression suite.

**§9 — Software Release (62304 §5.8)**
Release criteria, known anomalies list, and version history.

### Why Class B (Preliminary Reasoning)

IEC 62304 §4.3 requires the manufacturer to assign a software safety class based on the severity of harm that could result from software failure, considering risk controls already in place. The analysis for this system:

- Failure of the Python layer can cause the arm to move to an unintended position → potential for minor injury to a user in an uncontrolled lab environment
- The Arduino firmware implements independent position limits and a watchdog that stops servos on comms loss — these are risk controls that reduce the residual severity
- With these controls in place, residual severity is consistent with Class B (possible injury, non-life-threatening)
- Class C would apply if the safety controls were themselves implemented in software on the same processor without hardware backup — not the case here
