import assert from "node:assert";
import configDefinition from "./definition.js";

// CI runs only static checks (e.g. OpenAPI validation) that never touch real
// config values, so entries flagged `optionalInCi` may be absent there. They
// stay required in every other environment, including production.
const isCiEnv = process.env.NODE_ENV === "ci";

const configEntryToValue = ({
  envKey,
  doc,
  defaultValue,
  required = true,
  optionalInCi = false,
}) => {
  const value = process.env[envKey] || defaultValue;

  if (required && !(isCiEnv && optionalInCi)) {
    assert(value, `Required environment variable ${envKey} is missing: ${doc}`);
  }

  return value;
};

const configDefinitionToValues = (configNode) => {
  if ("envKey" in configNode) {
    return configEntryToValue(configNode);
  } else {
    const result = {};
    for (const entry in configNode) {
      result[entry] = configDefinitionToValues(configNode[entry]);
    }
    return result;
  }
};

export default configDefinitionToValues(configDefinition);
