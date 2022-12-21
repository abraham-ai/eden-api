import { GeneratorSchema } from "@/models/Generator";

export const getLatestGeneratorVersion = (generator: GeneratorSchema) => {
  return generator.versions[generator.versions.length - 1];
}

export const prepareConfig = (defaultConfig: any, config?: any) => {
  // Throw an error if the user has provided a value which is not in the default config
  if (!config) {
    return defaultConfig;
  }
  const defaultConfigKeys = Object.keys(defaultConfig);
  const configKeys = Object.keys(config);
  const invalidKeys = configKeys.filter((key) => !defaultConfigKeys.includes(key));
  if (invalidKeys.length > 0) {
    throw new Error(`Invalid config keys: ${invalidKeys.join(", ")}`);
  }

  // Unify the config with the default config
  const unifiedConfig = { ...defaultConfig, ...config };
  return unifiedConfig;
}
