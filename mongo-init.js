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

// TODO: ranges
const baseParameters = [
  {
    name: 'text_input',
    defaultValue: "the quick brown fox jumps over the lazy dog"
  },
  {
    name: 'width',
    defaultValue: 512,
  },
  {
    name: 'height',
    defaultValue: 512,
  },
  {
    name: 'upscale_f',
    defaultValue: 1.0,
  },
  {
    name: 'sampler',
    defaultValue: 'klms',
  },
  {
    name: 'steps',
    defaultValue: 50,
  },
  {
    name: 'scale',
    defaultValue: 10.0,
  },
  {
    name: 'stream',
    defaultValue: false
  },
  {
    name: 'stream_every',
    defaultValue: 1
  }
]

const animationParameters = [
  {
    name: 'n_frames',
    defaultValue: 10,
  },
  {
    name: 'loop',
    defaultValue: false,
  },
  {
    name: 'smooth',
    defaultValue: false,
  },
  {
    name: 'n_film',
    defaultValue: 0,
  },
  {
    name: 'scale_modulation',
    defaultValue: 0.0,
  },
  {
    name: 'latent_smoothing_std',
    defaultValue: 0.01,
  },
  {
    name: 'fps',
    defaultValue: 12,
  },
]

const createParameters = [
  ...baseParameters,
  {
    name: 'n_samples',
    defaultValue: 1,
  },
  {
    name: 'uc_text',
    defaultValue: "poorly drawn face, ugly, tiling, out of frame, extra limbs, disfigured, deformed body, blurry, blurred, watermark, text, grainy, signature, cut off, draft"
  },
  {
    name: 'init_image_data',
    defaultValue: null
  },
  {
    name: 'init_image_strength',
    defaultValue: 0.0
  },
  {
    name: 'mask_image_data',
    defaultValue: null
  },
  {
    name: 'mask_brightness_adjust',
    defaultValue: 1.0
  },
  {
    name: 'mask_contrast_adjust',
    defaultValue: 1.0
  },
  {
    name: 'mask_invert',
    default: false
  },
  {
    name: 'seed',
    defaultValue: 0
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
    defaultValue: 2
  },
  {
    name: 'interpolation_init_images_power',
    defaultValue: 3.0
  },
  {
    name: 'interpolation_init_images_min_strength',
    defaultValue: 0.2
  },
  {
    name: 'interpolation_init_images_max_strength',
    defaultValue: 0.95
  },
  {
    name: 'interpolation_seeds',
    defaultValue: []
  }
]

const remixParameters = [
  ...baseParameters,
  {
    name: "n_samples",
    default: 1
  },
  {
    name: "uc_text",
    default: "poorly drawn face, ugly, tiling, out of frame, extra limbs, disfigured, deformed body, blurry, blurred, watermark, text, grainy, signature, cut off, draft"
  },
  {
    name: "init_image_data",
    default: null
  },
  {
    name: "init_image_strength",
    default: 0.0
  },
  {
    name: "seed",
    default: 0
  }
]

// Register generators
const createGeneratorVersion = {
  versionId: "latest",
  defaultParameters: createParameters,
  creationAttributes: ["prompt"],
  isDeprecated: false,
}

const createGenerator = {
  generatorName: "create",
  versions: [createGeneratorVersion],
}

const interpolateGeneratorVersion = {
  versionId: "latest",
  defaultParameters: interpolationParameters,
  creationAttributes: ["prompts"],
  isDeprecated: false,
}

const interpolateGenerator = {
  generatorName: "interpolate",
  versions: [interpolateGeneratorVersion],
}

const real2realGeneratorVersion = {
  versionId: "latest",
  defaultParameters: real2realParameters,
  creationAttributes: ["input_images"],
  isDeprecated: false
}

const real2realGenerator = {
  generatorName: "real2real",
  versions: [real2realGeneratorVersion]
}

const remixGeneratorVersion = {
  versionId: "latest",
  defaultParameters: remixParameters,
  creationAttributes: ["input_image"],
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