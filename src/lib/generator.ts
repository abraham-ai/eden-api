import { GeneratorParameter, GeneratorSchema } from "../models/Generator";

export const getLatestGeneratorVersion = (generator: GeneratorSchema) => {
  return generator.versions[generator.versions.length - 1];
}

const validateUserConfig = (config: any, defaultParameters: GeneratorParameter[]) => {
  const parameterNames = defaultParameters.map((p: GeneratorParameter) => p.name);

  // Make sure user has not passed in any extra parameters
  const userConfigKeys = Object.keys(config);
  const invalidKeys = userConfigKeys.filter((key) => !parameterNames.includes(key));
  if (invalidKeys.length > 0) {
    throw new Error(`Invalid config parameters: ${invalidKeys.join(", ")}`);
  }

  // Check user has passed in all required parameters
  const requiredParameters = defaultParameters.filter((p: GeneratorParameter) => p.isRequired);
  const requiredParameterNames = requiredParameters.map((p: GeneratorParameter) => p.name);
  const missingRequiredParameters = requiredParameterNames.filter((name) => !userConfigKeys.includes(name));
  if (missingRequiredParameters.length > 0) {
    throw new Error(`Missing required parameters: ${missingRequiredParameters.join(", ")}`);
  }

  // Check user has passed in valid values for parameters
  const invalidValues = defaultParameters.filter((p: GeneratorParameter) => {
    if (!p.allowedValues || p.allowedValues.length === 0) {
      return false;
    }    
    const userValue = config[p.name];
    return !p.allowedValues.includes(userValue);
  });
  if (invalidValues.length > 0) {
    const invalidValueNames = invalidValues.map((p: GeneratorParameter) => p.name);
    throw new Error(`Invalid values for parameters: ${invalidValueNames.join(", ")}`);
  }

  // Check user has passed in valid values for parameter with ranges
  const invalidRangeValues = defaultParameters.filter((p: GeneratorParameter) => {
    if (p.minimum === undefined || p.maximum === undefined) {
      return false;
    }
    const userValue = config[p.name];
    return userValue < p.minimum || userValue > p.maximum;
  });
  if (invalidRangeValues.length > 0) {
    const invalidRangeValueNames = invalidRangeValues.map((p: GeneratorParameter) => p.name);
    throw new Error(`Invalid values for parameters: ${invalidRangeValueNames.join(", ")}`);
  }
}

const setupSeeds = (config?: any) => {
  if (config.seed === null) {
    config.seed = Math.floor(Math.random() * 1e8);
  }

  const nSeeds = Math.max(
    config.interpolation_texts?.length || 0, 
    config.interpolation_init_images?.length || 0
  );
    console.log("N SEEDS")

  console.log(nSeeds);
  console.log("!!");
  console.log(config.interpolation_seeds);
  if (!config.interpolation_seeds)  {
    console.log("nope !!!")
  }


  if (nSeeds > 0 && config?.interpolation_seeds.length == 0) {
    console.log("nope")
    config.interpolation_seeds = [];
    for (let i = 0; i < nSeeds; i++) {
      console.log("pushing")
      config.interpolation_seeds.push(Math.floor(Math.random() * 1e8));
    }
  }

  console.log(config.interpolation_seeds);
  console.log("!!");

  return config;
}

const unifyConfig = (parameters: GeneratorParameter[], config?: any) => {
  const configToUnify = config || {};
  const unifiedConfig = parameters.reduce((acc, p) => {
    const userValue = configToUnify[p.name];
    const value = userValue !== undefined ? userValue : p.defaultValue;
    return { ...acc, [p.name]: value };
  }, {});
  return unifiedConfig;
}

export const prepareConfig = (defaultParameters: GeneratorParameter[], config?: any) => {
  // Validate the user config
  if (config) {
    validateUserConfig(config, defaultParameters);
  }


  // Unify the config with the default config
  config = unifyConfig(defaultParameters, config);

  console.log("UNIFIEd")
  console.log(config);

    console.log("TEXT IHN 1")
  console.log(config.text_input)
  console.log(config.interpolation_texts);
  console.log(config.interpolation_texts?.join(" to ") || "Untitled");
  // Set default text input if not provided
  if (!config.text_input) {
    console.log("TEXT IHN 2")
    config.text_input = config.interpolation_texts?.join(" to ") || "Untitled";
    console.log(config.text_input)
    console.log("done")
  }

    // Auto-generate seeds if not provided
    config = setupSeeds(config);
  console.log("FINAL ___")
  console.log(config)

  return config;
}
