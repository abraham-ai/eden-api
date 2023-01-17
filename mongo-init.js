db = db.getSiblingDB('eden');

db.createUser({
  user: 'eden',
  pwd: 'eden',
  roles: [
    {
      role: 'readWrite',
      db: 'eden',
    },
  ],
});

db.createCollection('users');

const admin = db.users.insertMany([
 {
    userId: "admin",
    isWallet: false,
    isAdmin: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]);

db.createCollection('apikeys');

db.apikeys.insertMany([
  {
    user: admin.insertedIds[0],
    apiKey: "admin",
    apiSecret: "admin",
    deleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]);

db.createCollection('generators');

const baseParameters = [
  {
    name: 'text_input',
    defaultValue: "the quick brown fox jumps over the lazy dog",
    description: "Text prompt for the creation",
  },
  {
    name: 'width',
    defaultValue: 512,
    minimum: 64, 
    maximum: 1280,
    description: "Width of the creation in pixels",
  },
  {
    name: 'height',
    defaultValue: 512,
    minimum: 64, 
    maximum: 1280,
    description: "Height of the creation in pixels",
  },
  {
    name: 'upscale_f',
    defaultValue: 1.0,
    allowedValues: [1.0, 2.0],
  },
  {
    name: 'sampler',
    defaultValue: 'klms',
    allowedValues: ["klms", "dpm2", "dpm2_ancestral", "heun", "euler", "euler_ancestral", "ddim", "plms", "dpm"],
    description: "Sampler to use for generation",
  },
  {
    name: 'steps',
    defaultValue: 50,
    minimum: 5, 
    maximum: 200,
    description: "Number of sampling steps",
  },
  {
    name: 'scale',
    defaultValue: 10.0,
    minimum: 0.0, 
    maximum: 20.0,
    description: "Guidance scale of prompt conditioning",
  },
  {
    name: 'stream',
    defaultValue: false,
    description: "Yield intermediate results during creation process (if false, only final result is returned)",
  },
  {
    name: 'stream_every',
    defaultValue: 1,
    minimum: 1,
    maximum: 100,
    description: "How often to yield intermediate results (when stream is true)",
  }
]

const animationParameters = [
  {
    name: 'n_frames',
    defaultValue: 10,
    minimum: 2,
    maximum: 300,
    description: "Number of frames in the video",
  },
  {
    name: 'loop',
    defaultValue: false,
    description: "Loop the output video",
  },
  {
    name: 'smooth',
    defaultValue: false,
    description: "Optimize video for perceptual smoothness between frames (if false, frames are linearly spaced in prompt conditioning space)",
  },
  {
    name: 'n_film',
    defaultValue: 0,
    allowedValues: [0, 1, 2],
    description: "How many iterations to apply FILM (film interpolation) to the generated frames",
  },
  {
    name: 'scale_modulation',
    defaultValue: 0.0,
    minimum: 0.0,
    maximum: 0.5,
    description: "How much to modulate the guidance scale of the prompt conditioning between frames",
  },
  {
    name: 'latent_smoothing_std',
    defaultValue: 0.01,
    minimum: 0.0,
    maximum: 0.1,
    description: "How much to smooth the interpolated latent vectors before decoding to images (higher is smoother)",
  },
  {
    name: 'fps',
    defaultValue: 12,
    minimum: 1,
    maximum: 30,
    description: "Frames per second of the output video",
  },
]

const createParameters = [
  ...baseParameters,
  {
    name: 'n_samples',
    defaultValue: 1,
    allowedValues: [1, 2, 4],
    description: "Number of samples to create.",
  },
  {
    name: 'uc_text',
    defaultValue: "poorly drawn face, ugly, tiling, out of frame, extra limbs, disfigured, deformed body, blurry, blurred, watermark, text, grainy, signature, cut off, draft",
    description: "Unconditional (negative) prompt",
  },
  {
    name: 'init_image_data',
    defaultValue: null,
    description: "URL of image to initiate image before diffusion (if null, use random noise)",
  },
  {
    name: 'init_image_strength',
    defaultValue: 0.0,
    minimum: 0.0,
    maximum: 1.0,
    description: "How much to weight the initial image in the diffusion process",
  },
  {
    name: 'mask_image_data',
    defaultValue: null,
    description: "URL of image to use as a mask for the diffusion process (if null, use no mask)",
  },
  {
    name: 'mask_brightness_adjust',
    defaultValue: 1.0,
    minimum: 0.1,
    maximum: 2.0,
    description: "How much to adjust the brightness of the mask image",
  },
  {
    name: 'mask_contrast_adjust',
    defaultValue: 1.0,
    minimum: 0.1,
    maximum: 2.0,
    description: "How much to adjust the contrast of the mask image",
  },
  {
    name: 'mask_invert',
    default: false,
    description: "Invert the mask image",
  },
  {
    name: 'seed',
    defaultValue: 0,
    minimum: 0,
    maximum: 1e8,
    description: "Random seed for the creation process",
  }
]

const interpolationParameters = [
  ...baseParameters,
  ...animationParameters,
  {
    name: 'interpolation_texts',
    defaultValue: []
  },
  {
    name: 'interpolation_seeds',
    defaultValue: []
  }
]

const real2realParameters = [
  ...baseParameters,
  ...animationParameters,
  {
    name: 'interpolation_init_images',
    defaultValue: []
  },
  {
    name: 'interpolation_init_images_top_k',
    defaultValue: 2,
    allowedValues: [1, 2, 3, 4, 5],
    description: "Average conditioning vectors of top k img2txt prompts from clip-interrogator",
  },
  {
    name: 'interpolation_init_images_power',
    defaultValue: 3.0,
    minimum: 1.0,
    maximum: 5.0,
    description: "Power of the init_img_strength curve (how fast init_strength declines at endpoints)",
  },
  {
    name: 'interpolation_init_images_min_strength',
    defaultValue: 0.2,
    minimum: 0.0,
    maximum: 0.5,
    description: "Minimum strength of the init_img during interpolation",
  },
  {
    name: 'interpolation_init_images_max_strength',
    defaultValue: 0.95,
    minimum: 0.5,
    maximum: 1.0,
    description: "Maximum strength of the init_img during interpolation",
  },
  {
    name: 'interpolation_seeds',
    defaultValue: [],
    description: "Random seeds for each interpolation_init_image in the interpolation (number of seeds must match number of interpolation_init_images)",
  }
]

const remixParameters = [
  ...baseParameters,
  {
    name: "n_samples",
    default: 1,
    allowedValues: [1, 2, 4],
    description: "Number of samples to create remix",
  },
  {
    name: "uc_text",
    default: "poorly drawn face, ugly, tiling, out of frame, extra limbs, disfigured, deformed body, blurry, blurred, watermark, text, grainy, signature, cut off, draft",
    description: "Unconditional (negative) prompt",
  },
  {
    name: "init_image_data",
    default: null,
    description: "URL of image to initiate image before diffusion (if null, use random noise)",
  },
  {
    name: "init_image_strength",
    default: 0.0,
    minimum: 0.0,
    maximum: 1.0,
    description: "How much to weight the initial image in the diffusion process",
  },
  {
    name: "seed",
    default: 0,
    minimum: 0,
    maximum: 1e8,
    description: "Random seed for the creation process",
  }
]

// Register generators
const createGeneratorVersion = {
  versionId: "latest",
  defaultParameters: createParameters,
  isDeprecated: false,
}

const createGenerator = {
  generatorName: "create",
  versions: [createGeneratorVersion],
}

const interpolateGeneratorVersion = {
  versionId: "latest",
  defaultParameters: interpolationParameters,
  isDeprecated: false,
}

const interpolateGenerator = {
  generatorName: "interpolate",
  versions: [interpolateGeneratorVersion],
}

const real2realGeneratorVersion = {
  versionId: "latest",
  defaultParameters: real2realParameters,
  isDeprecated: false
}

const real2realGenerator = {
  generatorName: "real2real",
  versions: [real2realGeneratorVersion]
}

const remixGeneratorVersion = {
  versionId: "latest",
  defaultParameters: remixParameters,
  isDeprecated: false
}

const remixGenerator = {
  generatorName: "remix",
  versions: [remixGeneratorVersion]
}

db.generators.insertMany([
  createGenerator,
  interpolateGenerator,
  real2realGenerator,
  remixGenerator
]);