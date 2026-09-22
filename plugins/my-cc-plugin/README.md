# my-cc-plugin

## Purpose

A Claude Code plugin bundling custom commands, skills, and hooks for NestJS/TypeORM-based feature development.

## Install

Add this plugin to Claude Code by pointing it at this repository (as a local path or marketplace source), then enable it in your Claude Code settings.

## Commands

- `/basic-feature <name>` — scaffolds a new NestJS feature module (controller, entity, module, service, DTOs, mappers, types).

## Skills

- `typeorm-migration-recovery` — diagnose, recover, revert, or safely re-run TypeORM migrations when one fails, is partially applied, or leaves the PostgreSQL schema out of sync.

## Hooks

- `PreToolUse` (Edit/Read/Write) — runs `hooks/protect-files.js` to guard protected files before they're touched.
- `PostToolUse` (Edit/Write) — runs `npm run lint` after files are modified.
