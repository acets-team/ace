#!/usr/bin/env node
// @ts-check

import { join } from 'node:path'
import { rm, mkdir } from 'node:fs/promises'

try {
  const cwd = process.cwd()
  const distDir = join(cwd, 'dist')

  await rm(distDir, { recursive: true, force: true })
  await mkdir(distDir, { recursive: true })
} catch (error) {
  console.error('❌ fresh:', error)
}
