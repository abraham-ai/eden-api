import { GeneratorParameter, GeneratorSchema } from "../models/Generator";

export const getLatestGeneratorVersion = (generator: GeneratorSchema) => {
  return generator.versions[generator.versions.length - 1];
}

const setupSeeds = (config?: any) => {
  if (config.seed === null) {
    config.seed = Math.floor(Math.random() * 1e8);
  }

  const nSeeds = Math.max(
    config.interpolation_texts?.length || 0, 
    config.interpolation_init_images?.length || 0
  );

  if (nSeeds > 0 && config?.interpolation_seeds.length == 0) {
    config.interpolation_seeds = [];
    for (let i = 0; i < nSeeds; i++) {
      config.interpolation_seeds.push(Math.floor(Math.random() * 1e8));
    }
  }

  return config;
}

export const prepareConfig = (parameters: GeneratorParameter[], config?: any) => {

  // check config has all required params
  let missingParams = [];
  for (const param of parameters) {
    if (param.isRequired && !config[param.name]) {
      missingParams.push(param.name);
    }
  }
  if (missingParams.length > 0) {
    throw new Error(`Missing required parameters: ${missingParams.join(", ")}`);
  }

  // unify with default params
  for (const param of parameters) {
    if (config[param.name] === undefined) {
      config[param.name] = param.default;
    }
  }

  // validate params
  const invalidValues = parameters.filter((p: GeneratorParameter) => {
    if (!p.allowedValues || p.allowedValues.length === 0) {
      return false;
    }    
    const userValue = config[p.name];
    return !p.allowedValues.includes(userValue);
  });
  const invalidRangeValues = parameters.filter((p: GeneratorParameter) => {
    if (p.minimum === undefined || p.maximum === undefined) {
      return false;
    }
    const userValue = config[p.name];
    return userValue < p.minimum || userValue > p.maximum;
  });
  if (invalidValues.length > 0 || invalidRangeValues.length > 0) {
    const invalidValueNames = invalidValues.map((p: GeneratorParameter) => p.name);
    const invalidRangeValueNames = invalidRangeValues.map((p: GeneratorParameter) => p.name);
    const invalidValueNamesAll = [...invalidValueNames, ...invalidRangeValueNames];
    throw new Error(`Invalid values for parameters: ${invalidValueNamesAll.join(", ")}`);
  }

  // remove any fields which are null
  for (const key in config) {
    if (config[key] === null) {
      delete config[key];
    }
  }

  // randomize seeds if not provided
  config = setupSeeds(config);

  return config;
}
