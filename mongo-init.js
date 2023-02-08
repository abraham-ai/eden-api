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
    userId: 'admin',
    username: 'admin',
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
    apiKey: 'admin',
    apiSecret: 'admin',
    deleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]);

db.createCollection('generators');

const baseParameters = [
  {
    name: 'width',
    label: 'Width',
    description: 'Width of the creation in pixels',
    default: 512,
    minimum: 64, 
    maximum: 1280,
    step: 64,
  },
  {
    name: 'height',
    label: 'Height',
    description: 'Height of the creation in pixels',
    default: 512,
    minimum: 64, 
    maximum: 1280,
    step: 64,
  },
  {
    name: 'upscale_f',
    label: 'Upscale Factor',
    description: 'Diffusion-based upscaling factor',
    default: 1.0,
    allowedValues: [1.0, 2.0],
    optional: true,
  },
  {
    name: 'sampler',
    label: 'Sampler',
    description: 'Sampler to use for generation',
    default: 'klms',
    allowedValues: ['klms', 'dpm2', 'dpm2_ancestral', 'heun', 'euler', 'euler_ancestral', 'ddim', 'plms', 'dpm'],
    optional: true,
  },
  {
    name: 'steps',
    label: 'Steps',
    description: 'Number of sampling steps',
    default: 50,
    minimum: 5, 
    maximum: 200,
    optional: true,
  },
  {
    name: 'scale',
    label: 'Guidance scale',
    description: 'Guidance scale of prompt conditioning',
    default: 10.0,
    minimum: 0.0, 
    maximum: 20.0,
    step: 0.01,
    optional: true,
  },
  {
    name: 'stream',
    label: 'Stream',
    description: 'Yield intermediate results during creation process (if false, only final result is returned)',
    default: false,
    allowedValues: [true, false],
    optional: true,
  },
  {
    name: 'stream_every',
    label: 'Stream every',
    description: 'How often to yield intermediate results (when stream is true). In sampling steps for images, frames for video.',
    default: 1,
    minimum: 1,
    maximum: 25,
    optional: true,
  }
]

const animationParameters = [
  {
    name: 'n_frames',
    label: 'Frames',
    description: 'Number of frames in the video',
    default: 48,
    minimum: 2,
    maximum: 300,
  },
  {
    name: 'loop',
    label: 'Loop',
    description: 'Loop the output video',
    default: false,
    allowedValues: [true, false],
  },
  {
    name: 'smooth',
    label: 'Smooth',
    description: 'Optimize video for perceptual smoothness between frames (if false, frames are linearly spaced in prompt conditioning space)',
    default: true,
    allowedValues: [true, false],
    optional: true,
  },
  {
    name: 'n_film',
    label: 'FILM Iterations',
    description: 'How many iterations to apply FILM (film interpolation) to the generated frames',
    default: 0,
    allowedValues: [0, 1, 2],
    optional: true,
  },
  {
    name: 'fps',
    label: 'FPS',
    description: 'Frames per second of the output video',
    default: 12,
    minimum: 1,
    maximum: 30,
    optional: true,
  },
  {
    name: 'scale_modulation',
    label: 'Scale Modulation',
    description: 'How much to modulate the guidance scale of the prompt conditioning between frames',
    default: 0.0,
    minimum: 0.0,
    maximum: 0.5,
    step: 0.01,
    optional: true,
  },
  {
    name: 'latent_smoothing_std',
    label: 'Latent smoothing',
    description: 'How much to smooth the interpolated latent vectors before decoding to images (higher is smoother)',
    default: 0.01,
    minimum: 0.0,
    maximum: 0.1,
    step: 0.001,
    optional: true,
  },
]

const createParameters = [
  ...baseParameters,
  {
    name: 'text_input',
    label: 'Prompt',
    description: 'Text prompt for the creation',
    default: null,
    isRequired: true,
  },
  {
    name: 'uc_text',
    label: 'Negative prompt',
    description: 'Unconditional (negative) prompt',
    default: 'poorly drawn face, ugly, tiling, out of frame, extra limbs, disfigured, deformed body, blurry, blurred, watermark, text, grainy, signature, cut off, draft',
    optional: true,
  },
  {
    name: 'init_image_data',
    label: 'Init image',
    default: null,
    description: 'URL of image to initiate image before diffusion (if null, use random noise)',
    mediaUpload: true,
    optional: true,
  },
  {
    name: 'init_image_strength',
    label: 'Init image strength',
    description: 'How much to weight the initial image in the diffusion process',
    default: 0.0,
    minimum: 0.0,
    maximum: 1.0,
    step: 0.01,
    optional: true,
  },
  {
    name: 'mask_image_data',
    label: 'Mask image',
    default: null,
    description: 'URL of image to use as a mask for the diffusion process (if null, use no mask)',
    mediaUpload: true,
    optional: true,
  },
  {
    name: 'mask_brightness_adjust',
    label: 'Mask brightness',
    default: 1.0,
    minimum: 0.1,
    maximum: 2.0,
    step: 0.01,
    description: 'How much to adjust the brightness of the mask image',
    optional: true,
  },
  {
    name: 'mask_contrast_adjust',
    label: 'Mask contrast',
    description: 'How much to adjust the contrast of the mask image',
    default: 1.0,
    minimum: 0.1,
    maximum: 2.0,
    step: 0.01,
    optional: true,
  },
  {
    name: 'mask_invert',
    label: 'Invert Mask',
    description: 'Invert the mask image',
    default: false,
    optional: true,
  },
  {
    name: 'n_samples',
    label: 'Samples',
    description: 'Number of samples to create.',
    default: 1,
    allowedValues: [1, 2, 4],
    optional: true,
  },
  {
    name: 'seed',
    label: 'Seed',
    description: 'Set random seed for reproducibility. If blank, will be set randomly.',
    default: null,
    minimum: 0,
    maximum: 1e8,
    optional: true,
  }
]

const interpolationParameters = [
  ...baseParameters,
  ...animationParameters,
  {
    name: 'interpolation_texts',
    label: 'Prompts',
    description: 'Prompts to interpolate through',
    default: [],
    minLength: 2,
    maxLength: 20,
    isRequired: true,
  },
  {
    name: 'interpolation_seeds',
    label: 'Seeds',
    description: 'Random seeds. Must have 1 for each prompt. If left blank, will be set randomly.',
    default: [],
    optional: true,
  }
]

const real2realParameters = [
  ...baseParameters,
  ...animationParameters,
  {
    name: 'interpolation_init_images',
    label: 'Real images',
    description: 'URLs of images to use as init images for real2real',
    default: [],
    mediaUpload: true,
    minLength: 2,
    maxLength: 20,
    isRequired: true,
  },
  {
    name: 'interpolation_init_images_top_k',
    label: 'Top K img2txt',
    description: 'Average conditioning vectors of top k img2txt prompts from clip-interrogator',
    default: 2,
    allowedValues: [1, 2, 3, 4, 5],
    optional: true,
  },
  {
    name: 'interpolation_init_images_power',
    label: 'Init image power',
    description: 'Power of the init_img_strength curve (how fast init_strength declines at endpoints)',
    default: 3.0,
    minimum: 1.0,
    maximum: 5.0,
    step: 0.01,
    optional: true,
  },
  {
    name: 'interpolation_init_images_min_strength',
    label: 'Init image min strength',
    description: 'Minimum strength of the init_img during interpolation',
    default: 0.2,
    minimum: 0.0,
    maximum: 0.5,
    step: 0.01,
    optional: true,
  },
  {
    name: 'interpolation_init_images_max_strength',
    label: 'Init image max strength',
    description: 'Maximum strength of the init_img during interpolation',
    default: 0.95,
    minimum: 0.5,
    maximum: 1.0,
    step: 0.01,
    optional: true,
  },
  {
    name: 'interpolation_seeds',
    label: 'Interpolation seeds',
    description: 'Random seeds. Must have 1 for each init image. If left blank, will be set randomly.',
    default: [],
    optional: true,
  }
]

const remixParameters = [
  ...baseParameters,
  {
    name: 'init_image_data',
    label: 'Init image',
    description: 'URL of image to initiate image before diffusion (if null, use random noise)',
    default: null,
    mediaUpload: true,
    isRequired: true,
  },
  {
    name: 'init_image_strength',
    label: 'Init image strength',
    description: 'How much to weight the initial image in the diffusion process',
    default: 0.0,
    minimum: 0.0,
    maximum: 1.0,
    step: 0.01,
  },
  {
    name: 'n_samples',
    label: 'Samples',
    description: 'Number of samples to create remix',
    default: 1,
    allowedValues: [1, 2, 4],
    optional: true,
  },
  {
    name: 'uc_text',
    label: 'Negative prompt',
    description: 'Unconditional (negative) prompt',
    default: 'poorly drawn face, ugly, tiling, out of frame, extra limbs, disfigured, deformed body, blurry, blurred, watermark, text, grainy, signature, cut off, draft',
    optional: true,
  },
  {
    name: 'seed',
    label: 'Seed',
    description: 'Set random seed for reproducibility. If blank, will be set randomly.',
    default: null,
    minimum: 0,
    maximum: 1e8,
    optional: true,
  }
]

const ttsParameters = [
  {
    name: 'text',
    label: 'Text',
    description: 'Text to synthesize as speech',
    default: null,
    isRequired: true,
  },
  {
    name: 'preset',
    label: 'Preset',
    description: 'Speed vs quality mode',
    default: 'standard',
    allowedValues: ['ultra_fast', 'fast', 'standard', 'high_quality'],
  },
  {
    name: 'voice',
    label: 'Voice',
    description: 'Name of the voice to use for synthesis',
    default: 'random',
    allowedValues: ['random', 'clone'],
  },
  {
    name: 'voice_file_urls',
    label: 'Voice file URLs',
    description: 'URLs for the audio files of target voice (if voice is clone)',
    mediaUpload: true,
    default: [],
    minLength: 1,
    maxLength: 16,
  },
  {
    name: 'seed',
    label: 'Seed',
    description: 'Set random seed for reproducibility. If blank, will be set randomly.',
    default: null,
    minimum: 0,
    maximum: 1e8,
    optional: true,
  },
]
 
const wav2lipParameters = [
  {
    name: 'face_url',
    label: 'Face image file',
    description: 'Image containing face to be avatar',
    default: null,
    mediaUpload: true,
    isRequired: true,
  },
  {
    name: 'speech_url',
    label: 'Audio file',
    description: 'Audio of speech to be lip-synced',
    default: null,
    mediaUpload: true,
    isRequired: true,  
  },
  {
    name: 'gfpgan',
    label: 'GFPGAN',
    description: 'Apply GFPGAN to improve face image quality from Wav2Lip (recommended)',
    default: true,
    optional: true,
  },
]

const completeParameters = [
  {
    name: 'prompt',
    label: 'Prompt',
    description: 'Prompt to complete with GPT-3',
    default: null,
    isRequired: true,
  },
  {
    name: 'max_tokens',
    label: 'Max tokens',
    description: 'Maximum number of tokens to generate with GPT-3',
    default: 150,
    minimum: 1,
    maximum: 2048,
    optional: true,
  },
  {
    name: 'temperature',
    label: 'Temperature',
    description: 'GPT-3 sampling temperature',
    default: 0.9,
    minimum: 0.0,
    maximum: 1.0,
    step: 0.01,
    optional: true,
  },
]

// Register generators
const createGeneratorVersion = {
  provider: 'replicate',
  address: 'abraham-ai/eden-stable-diffusion',
  versionId: '5c0bbf5c9b41c3549f2a70de7d00fc3fa9ef24594255ca0342894f02b3cdd022',
  mode: 'generate',
  parameters: createParameters,
  isDeprecated: false,
}

const createGenerator = {
  generatorName: 'create',
  versions: [createGeneratorVersion],
}

const interpolateGeneratorVersion = {
  provider: 'replicate',
  address: 'abraham-ai/eden-stable-diffusion',
  versionId: '5c0bbf5c9b41c3549f2a70de7d00fc3fa9ef24594255ca0342894f02b3cdd022',
  mode: 'interpolate',
  parameters: interpolationParameters,
  isDeprecated: false,
}

const interpolateGenerator = {
  generatorName: 'interpolate',
  versions: [interpolateGeneratorVersion],
}

const real2realGeneratorVersion = {
  provider: 'replicate',
  address: 'abraham-ai/eden-stable-diffusion',
  versionId: '5c0bbf5c9b41c3549f2a70de7d00fc3fa9ef24594255ca0342894f02b3cdd022',
  mode: 'interpolate',
  parameters: real2realParameters,
  isDeprecated: false
}

const real2realGenerator = {
  generatorName: 'real2real',
  versions: [real2realGeneratorVersion]
}

const remixGeneratorVersion = {
  provider: 'replicate',
  address: 'abraham-ai/eden-stable-diffusion',
  versionId: '5c0bbf5c9b41c3549f2a70de7d00fc3fa9ef24594255ca0342894f02b3cdd022',
  mode: 'remix',
  parameters: remixParameters,
  isDeprecated: false
}

const remixGenerator = {
  generatorName: 'remix',
  versions: [remixGeneratorVersion]
}

const ttsGeneratorVersion = {
  provider: 'replicate',
  address: 'abraham-ai/tts',
  versionId: '730c9417d8d9a9d9c886809a25c4406b991c6f40a357a602e5bd42e4b1855653',
  mode: 'tts',
  parameters: ttsParameters,
  isDeprecated: false
}

const ttsGenerator = {
  generatorName: 'tts',
  versions: [ttsGeneratorVersion]
}

const wav2lipGeneratorVersion = {
  provider: 'replicate',
  address: 'abraham-ai/character',
  versionId: '2c80927fc499b8055af35e83354f648e015df6f9a679f21bcc8977e09afede88',
  mode: 'wav2lip',
  parameters: wav2lipParameters,
  isDeprecated: false
}

const wav2lipGenerator = {
  generatorName: 'wav2lip',
  versions: [wav2lipGeneratorVersion]
}

const completeGeneratorVersion = {
  provider: 'replicate',
  address: 'abraham-ai/character',
  versionId: '2c80927fc499b8055af35e83354f648e015df6f9a679f21bcc8977e09afede88',
  mode: 'complete',
  parameters: completeParameters,
  isDeprecated: false
}

const completeGenerator = {
  generatorName: 'complete',
  versions: [completeGeneratorVersion]
}


db.generators.insertMany([
  createGenerator,
  interpolateGenerator,
  real2realGenerator,
  remixGenerator,
  ttsGenerator,
  wav2lipGenerator,
  completeGenerator,
]);