---
layout: project
title: 4-DOF Robotic Arm
subtitle: Servo-driven arm with Arduino firmware, Python command sequencing layer, and a formally documented serial communication interface.
number: 3
status: in-progress
tags:
  - Arduino
  - Python
  - Embedded C
  - Serial Protocol
  - Subsystem FMEA
  - Interface Control

problem: |
  Most hobbyist robotic arm builds stop at "it moves." This one uses the hardware as a vehicle for systems engineering practice: define the requirements first, document the interfaces between subsystems before writing the code, and produce the kind of artifacts — a functional block diagram, an interface control document, a subsystem FMEA — that would be expected in a regulated device development program.

  The two-layer architecture (Arduino firmware + Python sequencing layer communicating over serial) is intentionally analogous to the embedded controller / host software split common in surgical robots. The engineering challenge isn't the servo control itself; it's specifying the protocol boundary cleanly enough that the two layers can be developed and tested independently.

artifacts:
  - type: Engineering Drawing
    name: Functional Block Diagram
    description: Top-level decomposition showing the Arduino layer, Python layer, serial interface, and servo subsystem with signal flows.
    status: in-progress
  - type: Document
    name: Interface Control Document — Serial Protocol
    description: Full specification of the command/response protocol between Python host and Arduino firmware, including error codes.
    status: in-progress
  - type: Document
    name: Subsystem FMEA
    description: Failure mode analysis for the actuation subsystem — covers servo failure, communication loss, and power fault modes.
    status: in-progress
  - type: Source Code
    name: Arduino Firmware (arm_controller.ino)
    description: Command parser, servo driver, limit checking, and watchdog. Written to the ICD spec.
    status: in-progress
  - type: Source Code
    name: Python Sequencing Layer (arm_commander.py)
    description: High-level command API, sequence execution, and serial session management.
    status: in-progress

reflection: |
  In progress. The most interesting engineering decision so far is where to put position limit enforcement. The naive answer is: in the Python layer, because it's easier to update. The correct answer is: in both, with the Arduino as the authoritative enforcement point. A software bug in the Python layer shouldn't be able to command a mechanically damaging position. This is the same logic that puts hardware interlocks on surgical robots regardless of what the software safety monitor says — defense in depth applied at the architecture level.

  The FMEA is also surfacing something useful: "communication loss" and "communication corruption" are different failure modes with different mitigations. Loss is handled by a watchdog timer in the firmware (motors stop within 500ms). Corruption requires a checksum in the protocol — which meant revising the ICD after the FMEA, exactly the way it's supposed to work.

standards:
  - ISO 14971:2019 — Risk management (FMEA methodology)
  - IEC 62304:2006+A1:2015 — Software lifecycle (informing layer decomposition)
  - MIL-STD-1553 (reference) — Serial interface design patterns
  - 21 CFR 820.30 — Design controls (V&V planning)
---

### System Architecture

The arm has two computational layers separated by a serial interface:

**Arduino Layer (Firmware)**: Runs on an Arduino Mega. Responsible for real-time servo control, position limit enforcement, command parsing, watchdog timer, and fault reporting. Operates at 50Hz servo update rate. Receives structured command packets from the Python layer; responds with structured status packets.

**Python Layer (Host Software)**: Runs on a laptop or Raspberry Pi. Responsible for motion sequencing, trajectory interpolation, session management, and user interface. Treats the Arduino as a hardware abstraction — sends position targets and queries; does not manage servo timing directly.

**Serial Interface**: UART at 115200 baud. Commands are ASCII-framed with a CRC-8 checksum. The protocol is fully specified in the ICD before either layer was coded — this is the constraint that made the two layers independently testable.

### Hardware Configuration

| Joint | Servo | Range | Notes |
|-------|-------|-------|-------|
| Base rotation | MG996R | 0–270° | High-torque |
| Shoulder | MG996R | 30–150° | Mechanical limit at 30° |
| Elbow | MG90S | 0–180° | |
| Wrist | SG90 | 0–180° | |

Power: 5V/3A regulated supply to servo rail, isolated from Arduino logic power. Logic isolation was a specific requirement derived from observed servo noise coupling during initial prototyping.

### Serial Protocol (ICD Summary)

Command packet structure: `[SOF][CMD][J1][J2][J3][J4][CRC][EOF]`

- `SOF` / `EOF`: `0xAA` / `0x55` (framing bytes)
- `CMD`: Command type — `0x01` (position set), `0x02` (status request), `0x03` (emergency stop)
- `J1`–`J4`: Joint positions encoded as uint8 (0–255 mapped to joint range)
- `CRC`: CRC-8 over CMD through J4

Response packet: `[SOF][STATUS][J1][J2][J3][J4][FAULT][CRC][EOF]`

- `STATUS`: `0x00` OK, `0x01` limit hit, `0x02` watchdog fault, `0x03` CRC error on last command
- `FAULT`: Bitmask — bit 0 servo fault, bit 1 power fault, bit 2 comms fault

Full protocol including timing requirements, retry behavior, and session initialization sequence is in the ICD document.

### FMEA Summary (In Progress)

| Failure Mode | Effect | Severity | Mitigation |
|---|---|---|---|
| Servo stall/failure | Joint freezes or back-drives | Medium | Status polling; fault bit reporting |
| Serial comms loss | Last command held indefinitely | High | Watchdog: stop all servos after 500ms no-comms |
| Serial data corruption | Malformed command executed | High | CRC-8 checksum; NAK and discard on failure |
| Power rail noise | Erratic servo behavior | Medium | Isolated supply rails; capacitor filtering |
| Python layer crash | No new commands sent | Medium | Covered by watchdog (same as comms loss) |
