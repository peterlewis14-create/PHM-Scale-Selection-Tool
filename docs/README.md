# Hydraulic Model Scale Selection Tool

This tool implements the **Hydraulic Model Scale Selection Standard (Rev2)**.

## Core Principle

All logic is defined in:

→ `spec/spec_rev2.json`

The engine must not override the specification.

## Selection Rule

S1:
The recommended scale shall be the largest feasible scale.

## Structure

- `spec/` → engineering standard + rules
- `engine/` → logic execution
- `ui/` → interface (future)

## Version Control

Standard Version: 2.0 (REV2)

All updates shall:
1. Update the Word document
2. Update JSON spec
3. Commit to repository