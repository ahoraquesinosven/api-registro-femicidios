import assert from 'node:assert';
import configDefinition from "./definition.js"

const configEntryToValue = ({envKey, doc, defaultValue, required = true}) => {
  const value = process.env[envKey] || defaultValue;

  if (required) {
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
