#!/usr/bin/env bun
/**
 * Bundle SPARK soul for deployment
 * This script copies the SPARK soul and pre-compiles it
 */

import { mkdir, cp, exists } from "node:fs/promises";
import path from "path";
import { CodeWriter } from "../src/code/codeWriter.ts";
import { logger } from "../src/logger.ts";

const REPO_ROOT = path.resolve(import.meta.dir, "../../..");
const SPARK_SOURCE = path.join(REPO_ROOT, "souls/SPARK");
const SOULS_TARGET = path.join(process.env.CODE_PATH || "./data/code", "local");

async function bundleSpark() {
  try {
    logger.info("Starting SPARK bundle process", { 
      source: SPARK_SOURCE,
      target: SOULS_TARGET 
    });

    // Check if SPARK soul exists
    const sparkExists = await exists(SPARK_SOURCE);
    if (!sparkExists) {
      throw new Error(`SPARK soul not found at: ${SPARK_SOURCE}`);
    }

    // Create target directory structure
    await mkdir(SOULS_TARGET, { recursive: true });

    // Copy SPARK soul to target
    const sparkTarget = path.join(SOULS_TARGET, "SPARK");
    logger.info("Copying SPARK soul", { from: SPARK_SOURCE, to: sparkTarget });
    
    await cp(SPARK_SOURCE, sparkTarget, { 
      recursive: true,
      force: true 
    });

    logger.info("SPARK soul copied successfully");

    // Compile the soul
    const soulPath = path.join(sparkTarget, "soul/soul.ts");
    logger.info("Compiling SPARK soul", { soulPath });
    
    const codeWriter = new CodeWriter(soulPath);
    await codeWriter.bumpVersion();
    
    logger.info("SPARK soul compiled successfully");
    
    // Verify the output exists
    const outputPath = path.join(sparkTarget, "soul/.soul-engine-out/staticModuleRecord.json");
    const outputExists = await exists(outputPath);
    
    if (!outputExists) {
      throw new Error(`Compilation failed - output not found at: ${outputPath}`);
    }

    logger.info("✅ SPARK bundle complete!", { outputPath });
    
  } catch (error) {
    logger.error("Failed to bundle SPARK", { error, alert: true });
    process.exit(1);
  }
}

bundleSpark();
