---
layout: project
title: Custom Flight Controller
subtitle: Phased drone program — from off-the-shelf firmware to custom control loops and sensor fusion, each phase documented with requirements and test records.
number: 5
status: planned
tags:
  - Embedded C
  - ArduPilot
  - Sensor Fusion
  - Control Systems
  - IMU
  - PID

problem: |
  Flight control is one of the most demanding real-time embedded systems problems accessible to an individual engineer: hard timing constraints, multi-sensor fusion, cascaded control loops, and immediate physical feedback when something is wrong. It's also a domain where the engineering discipline matters — an undocumented tune is just a guess.

  This project approaches a custom quadcopter build as a phased program, with each phase formally documented (requirements, design, test records) rather than iterated informally. The arc: start with ArduPilot to establish a known-good baseline, characterize the system's actual dynamics, then progressively replace subsystems — first the PID tuning, then the sensor fusion algorithm, eventually the full control loop — with custom implementations.

  The documentation approach is the point. Phase gates require recorded test results, not just "it flies."

artifacts:
  - type: Document
    name: Phase 1 Requirements — Platform Baseline
    description: Hardware selection rationale, ArduPilot configuration, and baseline performance requirements with acceptance criteria.
    status: in-progress
  - type: Test Record
    name: Phase 1 Test Records
    description: Logged flight data from ArduPilot baseline. Hover stability, step response, and failsafe behavior.
    status: in-progress
  - type: Document
    name: Phase 2 Requirements — Custom PID Tuning
    description: Requirements for manual PID implementation, stability margins, and comparison protocol against ArduPilot baseline.
    status: in-progress
  - type: Source Code
    name: Custom PID Controller (C)
    description: Rate and attitude PID loops with configurable gains, anti-windup, and derivative filtering.
    status: in-progress
  - type: Document
    name: Phase 3 Requirements — Sensor Fusion (Planned)
    description: Requirements for complementary filter / EKF implementation replacing ArduPilot's AHRS.
    status: in-progress

reflection: |
  Planned. The phased structure is deliberately analogous to the design freeze / verification cycle in a regulated device program — you don't start the next phase until the current phase has passed its acceptance criteria and the test records are closed. In practice this means I'll fly the ArduPilot baseline until I have enough logged data to characterize the system's dynamics, then define Phase 2 requirements against measured baseline performance rather than theoretical targets.

  The sensor fusion phase (Phase 3) is the technically hardest part: implementing an extended Kalman filter for attitude estimation from IMU data, comparing its output against ArduPilot's AHRS, and characterizing the accuracy difference under dynamic conditions. This is the part that's most directly transferable to surgical navigation — where the same sensor fusion mathematics apply to instrument tracking.

standards:
  - DO-178C (reference) — Software considerations in airborne systems; PID implementation patterns
  - ArduPilot parameter documentation — Baseline configuration reference
  - Mahony/Madgwick filter papers — Sensor fusion algorithm reference
  - ISO 14971 methodology — Risk identification applied to flight system failure modes
---

### Program Phases

**Phase 1 — Platform Baseline with ArduPilot**

Hardware: 5" freestyle frame, F7 flight controller, 2306 motors, 4-in-1 ESC, Raspberry Pi companion computer for logging. ArduPilot Copter firmware, configured and tuned using AutoTune.

Deliverables: documented hardware configuration, ArduPilot parameter file (version controlled), and a baseline test protocol with defined acceptance criteria:
- Hover stability: position drift < 0.5m in no-wind hover, 60 seconds
- Step response: attitude step of 20° commanded and settled within 0.5s
- Failsafe: verified motor cutoff on RC loss within 100ms

All test runs logged to `.bin` format; analyzed post-flight with Mission Planner / MAVExplorer.

**Phase 2 — Custom PID Controller**

Replace ArduPilot's rate and attitude PID loops with a custom C implementation running on the same F7 hardware via a Betaflight base (for hardware abstraction). Custom implementation must match or exceed the ArduPilot baseline performance on the Phase 1 acceptance criteria.

The custom PID includes:
- Separate rate loop (inner) and attitude loop (outer), cascaded
- Anti-windup on integral term (clamp method)
- Derivative filtered with configurable low-pass (first-order IIR)
- Gain scheduling stub for future expansion

**Phase 3 — Custom Sensor Fusion (Planned)**

Implement a complementary filter for attitude estimation from accelerometer + gyroscope data. Compare heading and pitch/roll estimates against ArduPilot's EKF under the same flight conditions. Characterize drift under sustained maneuver.

If complementary filter accuracy is sufficient, evaluate an EKF implementation using the same IMU data. Document the algorithm selection rationale as a design decision record.

**Phase 4 — Full Custom Stack (Stretch)**

Custom sensor fusion feeding custom PID, running on a dedicated microcontroller (STM32F4). The flight controller as a fully documented embedded system — requirements, architecture, ICD for the companion computer interface, and a complete V&V test protocol.

### Why This Is Relevant to Medical Robotics

Sensor fusion and real-time control are not drone-specific. The same mathematical machinery — quaternion attitude estimation, Kalman filtering, cascaded PID — appears in surgical robot kinematics, intravascular navigation, and robotic catheter control. Building and debugging it in a context where failure means a crashed drone (not a patient safety event) is a practical way to develop competence with the underlying engineering before applying it in a regulated setting.
