#!/usr/bin/env node

import config from '../config/definition.js';

// Emit one tab-separated `KEY<TAB>doc` line per config entry with no usable
// value (unset/empty in the environment and without a default). Meant to be
// parsed by bin/setup-local-env to prompt for the missing values.
const printMissingEntries = (node) => {
  if ("envKey" in node) {
    const value = process.env[node.envKey] || node.defaultValue;
    if (!value) {
      console.log(`${node.envKey}\t${node.doc}`);
    }
  } else {
    for (const key in node) {
      printMissingEntries(node[key]);
    }
  }
};

printMissingEntries(config);
