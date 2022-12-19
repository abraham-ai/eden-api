import { GeneratorConfig, GeneratorType } from "@/types/generatorTypes";

const costs: Record<GeneratorType, number> = {
  "stable-diffusion": 1,
  clipx: 1,
  oracle: 1,
  dreambooth: 1
};

export const getInterpolateCost = (config: GeneratorConfig) => {
  return config.n_frames
}

export const getCost = (generator: GeneratorType, config: GeneratorConfig) => {
  if (generator === "stable-diffusion" && config.mode === "interpolate") {
    return getInterpolateCost(config);
  }
  return costs[generator];
}