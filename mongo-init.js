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
    note: 'Admin API key',
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
    default: 768,
    minimum: 256, 
    maximum: 1280,
    step: 64,
  },
  {
    name: 'height',
    label: 'Height',
    description: 'Height of the creation in pixels',
    default: 768,
    minimum: 256, 
    maximum: 1280,
    step: 64,
  },
  {
    name: 'upscale_f',
    label: 'Upscale Factor',
    description: 'Diffusion-based upscaling factor',
    default: 1.5,
    minimum: 1.0,
    maximum: 2.0,
    step: 0.1,
    optional: true,
  },
  {
    name: 'checkpoint',
    label: 'Checkpoint',
    description: 'Which model checkpoint to generate with',
    default: 'eden:eden-v1',
    allowedValues: [
      'eden:eden-v1'
    ],
  },
  {
    name: 'lora',
    label: 'LORA',
    description: '(optional) Use LORA on top of the model. To prompt, use <lora_name> e.g. "A photo of <Bill>". Make sure you load LORA on top of the base model is was trained on!',
    default: '(none)',
    // allowedValues: ['(none)'],
  },
  {
    name: 'lora_scale',
    label: 'LORA scale',
    description: 'How strongly to apply the LoRa weights (0.0 will result in the base model)',
    default: 0.8,
    minimum: 0.0,
    maximum: 1.2,
    step: 0.1,
  },
  {
    name: 'sampler',
    label: 'Sampler',
    description: 'Sampler to use for generation',
    default: 'euler',
    allowedValues: ['euler'],
    //allowedValues: ['klms', 'dpm2', 'dpm2_ancestral', 'heun', 'euler', 'euler_ancestral', 'ddim', 'plms', 'dpm'],
    optional: true,
  },
  {
    name: 'steps',
    label: 'Steps',
    description: 'Number of sampling steps',
    default: 40,
    minimum: 10, 
    maximum: 100,
    optional: true,
  },
  {
    name: 'guidance_scale',
    label: 'Guidance scale',
    description: 'Strength of prompt conditioning guidance',
    default: 7.5,
    minimum: 0.0, 
    maximum: 30.0,
    step: 0.1,
    optional: true,
  },
  {
    name: 'stream',
    label: 'Stream',
    description: 'Yield intermediate results during creation process (if false, only final result is returned)',
    default: true,
    allowedValues: [false, true],
    optional: true,
  },
  {
    name: 'stream_every',
    label: 'Stream every',
    description: 'How often to yield intermediate results (when stream is true). In sampling steps for images, frames for video.',
    default: 1,
    minimum: 1,
    maximum: 10,
    optional: true,
  }
]

const animationParameters = [
  {
    name: 'n_frames',
    label: 'Frames',
    description: 'Number of frames in the video',
    default: 60,
    minimum: 3,
    maximum: 300,
  },
  {
    name: 'loop',
    label: 'Loop',
    description: 'Loop the output video',
    default: false,
    allowedValues: [false, true],
  },
  {
    name: 'smooth',
    label: 'Smooth',
    description: 'Optimize video for perceptual smoothness between frames (if false, frames are linearly spaced in prompt conditioning space)',
    default: true,
    //allowedValues: [false, true],
    allowedValues: [true],
    optional: true,
  },
  {
    name: 'n_film',
    label: 'FILM Iterations',
    description: 'Optionally apply FILM postprocessing to the generated frames to create a smoother video',
    default: 1,
    allowedValues: [0, 1],
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
    description: 'How much to scale down the guidance scale of the prompt conditioning in between keyframes',
    default: 0.0,
    minimum: 0.0,
    maximum: 0.25,
    step: 0.01,
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
    description: 'Unconditional (negative) prompt: what you DONT want to see',
    default: 'watermark, text, nude, naked, nsfw, poorly drawn face, ugly, tiling, out of frame, blurry, blurred, grainy, signature, cut off, draft',
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
    description: 'How much to weight the initial image in the diffusion process (closer to 1.0 = more influence)',
    default: 0.0,
    minimum: 0.0,
    maximum: 1.0,
    step: 0.01,
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
    maxLength: 5,
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
    maxLength: 5,
    isRequired: true,
  },
  {
    name: 'interpolation_init_images_power',
    label: 'Init image power',
    description: 'Power of the init_img_strength curve (how fast init_img_strength declines at the keyframes)',
    default: 3.0,
    minimum: 0.5,
    maximum: 5.0,
    step: 0.01,
    optional: true,
  },
  {
    name: 'interpolation_init_images_min_strength',
    label: 'Init image min strength',
    description: 'Min strength of the init_img during interpolation. Lower values will give the interpolation more freedom, leading to more visual changes at the cost of less smoothness',
    default: 0.25,
    minimum: 0.0,
    maximum: 0.75,
    step: 0.01,
    optional: true,
  },
  {
    name: 'interpolation_init_images_max_strength',
    label: 'Init image max strength',
    description: 'Max strength of the init_img during interpolation. Setting this to 1.0 will exactly reproduce the init imgs at some point in the video, but also causes a slight flicker',
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
    description: 'How much to weight the input init image in the diffusion process. Setting this to 0.0 will only use the guessed prompt and no img_guidance',
    default: 0.2,
    minimum: 0.0,
    maximum: 0.8,
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
    default: 'nude, naked, nsfw, poorly drawn face, ugly, tiling, out of frame, extra limbs, disfigured, deformed body, blurry, blurred, watermark, text, grainy, signature, cut off, draft',
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

const interrogateParameters = [
  {
    name: 'init_image_data',
    label: 'Image',
    description: 'URL of image to initiate image before diffusion (if null, use random noise)',
    default: null,
    mediaUpload: true,
    isRequired: true,
  },
]

const loraParameters = [
  {
    name: 'lora_training_urls',
    label: 'Training images',
    description: 'URLs for the image files of target concept to train a LORA for',
    mediaUpload: true,
    default: [],
    minLength: 1,
    maxLength: 8,
    isRequired: true,
  },
  {
    name: 'checkpoint',
    label: 'Base checkpoint',
    description: 'Base checkpoint to train from',
    default: 'eden:eden-v1',
    allowedValues: [
      'eden:eden-v1'
    ],
  },
  {
    name: 'name',
    label: 'LORA name',
    description: 'Choose a name to save the LORA. This also sets how you will trigger the concept when prompting: <lora_name>',
    default: null,
    isRequired: true,
  },
  {
    name: 'use_template',
    label: 'Template',
    description: 'Which template to train from. Person works well, style and object are still experimental.',
    default: 'person',
    allowedValues: ['person', 'object', 'style'],
    isRequired: true,
  },
  {
    name: 'train_text_encoder',
    label: 'Train text encoder',
    description: 'Train a LoRa on top of the text encoder',
    default: true,
    allowedValues: [false, true],
    optional: true,
  },
  {
    name: 'perform_inversion',
    label: 'Perform inversion',
    description: 'Perform textual inversion (find a token to represent your concept)',
    default: true,
    allowedValues: [false, true],
    optional: true,
  },
  {
    name: 'resolution',
    label: 'Resolution',
    description: 'Image resolution',
    default: 512,
    minimum: 512,
    maximum: 768,
    optional: true,
  },
  {
    name: 'train_batch_size',
    label: 'Batch size',
    description: 'Training batch size',
    default: 4,
    minimum: 1,
    maximum: 4,
    optional: true,
  },
  {
    name: 'gradient_accumulation_steps',
    label: 'Gradient accumulation steps',
    description: 'Gradient accumulation steps',
    default: 1,
    minimum: 1,
    maximum: 4,
    optional: true,
  },
  {
    name: 'scale_lr',
    label: 'Scale learning rate',
    description: 'Scale learning rate',
    default: true,
    allowedValues: [false, true],
    optional: true,
  },
  {
    name: 'learning_rate_ti',
    label: 'Textual inversion learning rate',
    description: 'Learning rate for textual inversion',
    default: 5e-4,
    minimum: 1e-5,
    maximum: 1e-3,
    step: 1e-5,
    optional: true,
  },
  {
    name: 'continue_inversion',
    label: 'Continue inversion',
    description: 'Continue textual inversion phase while training the LoRa model',
    default: true,
    allowedValues: [false, true],
    optional: true,
  },
  {
    name: 'continue_inversion_lr',
    label: 'Continue inversion learning rate',
    description: 'Continue inversion learning rate (should be relatively low)',
    default: 1e-5,
    minimum: 1e-6,
    maximum: 1e-4,
    step: 1e-6,
    optional: true,
  },
  {
    name: 'learning_rate_unet',
    label: 'U-Net learning rate',
    description: 'Learning rate for U-Net',
    default: 2e-5,
    minimum: 1e-6,
    maximum: 1e-4,
    step: 1e-6,
    optional: true,
  },
  {
    name: 'learning_rate_text',
    label: 'Text encoder learning rate',
    description: 'Learning rate for text encoder',
    default: 3e-5,
    minimum: 1e-6,
    maximum: 1e-4,
    step: 1e-6,
    optional: true,
  },
  {
    name: 'color_jitter',
    label: 'Color jitter',
    description: 'Color jitter',
    default: true,
    allowedValues: [false, true],
    optional: true,
  },
  {
    name: 'lr_scheduler',
    label: 'LR scheduler',
    description: 'Learning rate scheduler',
    default: 'linear',
    allowedValues: ['linear', 'cosine', 'cosine_with_restarts', 'polynomial', 'constant', 'constant_with_warmup'],
    optional: true,
  },
  {
    name: 'lr_warmup_steps',
    label: 'Warmup steps',
    description: 'Learning rate warmup steps',
    default: 0,
    minimum: 0,
    maximum: 100,
    optional: true,
  },
  // {
  //   name: 'placeholder_tokens',
  //   label: 'Placeholder tokens',
  //   description: 'Placeholder tokens for concept',
  //   default: '<person1>',
  //   optional: true,
  //   isRequired: true,
  // },
  //   {
  //        name: 'use_mask_captioned_data',
  //        label: 'Use mask captioned data',
  //        description: 'Use mask captioned data',
  //        default: false,
  //        //allowedValues: [false, true],
  //        allowedValues: [false],
  //        optional: true,
  //      },
  {
    name: 'max_train_steps_ti',
    label: 'Textual inversion max steps',
    description: 'Max train steps for textual inversion',
    default: 400,
    minimum: 50,
    maximum: 700,
    optional: true,
  },
  {
    name: 'max_train_steps_tuning',
    label: 'Tuning max steps',
    description: 'Max train steps for tuning (U-Net and text encoder)',
    default: 700,
    minimum: 50,
    maximum: 1000,
    optional: true,
  },
  {
    name: 'clip_ti_decay',
    label: 'CLIP textual inversion decay',
    description: 'CLIP textual inversion decay',
    default: true,
    allowedValues: [false, true],
    optional: true,
  },
  {
    name: 'weight_decay_ti',
    label: 'Textual inversion weight decay',
    description: 'Weight decay for textual inversion (regularizes the ti embedding), higher values will look less like the concept, but improve promptability',
    default: 0.0005,
    minimum: 0.0001,
    maximum: 0.005,
    step: 0.0001,
    optional: true,
  },
  {
    name: 'weight_decay_lora',
    label: 'Weight decay',
    description: 'Weight decay for LORA matrices, (regularizes the model), higher values will look less like the concept, but improve promptability',
    default: 0.001,
    minimum: 0.0001,
    maximum: 0.01,
    step: 0.001,
    optional: true,
  },
  {
    name: 'lora_rank_unet',
    label: 'U-Net rank',
    description: 'LORA rank for U-Net',
    default: 4,
    minimum: 1,
    maximum: 16,
    optional: true,
  },
  {
    name: 'lora_rank_text_encoder',
    label: 'Text encoder rank',
    description: 'LORA rank for text encoder',
    default: 8,
    minimum: 1,
    maximum: 16,
    optional: true,
  },
  {
    name: 'use_extended_lora',
    label: 'Extended LORA',
    description: 'Use extended LORA. (false for faces and objects, true for styles is recommended)',
    default: false,
    allowedValues: [false, true],
    optional: true,
  },
  {
    name: 'use_face_segmentation_condition',
    label: 'Face segmentation',
    description: 'Use face segmentation condition. Disable this when training styles / objects',
    default: true,
    allowedValues: [false, true],
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
    allowedValues: ['random', 'clone', 'angie', 'applejack', 'cond_latent_example', 'daniel', 'deniro', 'emma', 'freeman', 'geralt', 'halle', 'jlaw', 'lj', 'mol', 'myself', 'pat', 'pat2', 'rainbow', 'snakes', 'tim_reynolds', 'tom', 'train_atkins', 'train_daws', 'train_dotrice', 'train_dreams', 'train_empire', 'train_grace', 'train_kennard', 'train_lescault', 'train_mouse', 'weaver', 'william'],
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
 
const ttsFastParameters = [
  {
    name: 'text',
    label: 'Text',
    description: 'Text to synthesize as speech',
    default: null,
    isRequired: true,
  },
  {
    name: 'voice',
    label: 'Voice',
    description: 'Which preset voice to use',
    default: 'Jordan',
    allowedValues: ['Larry', 'Jordan', 'Susan', 'William', 'Oliver', 'Alfonso', 'Daniel', 'Charlotte', 'Adrian', 'Alexander', 'Anthony', 'Aurora', 'Axel', 'Carter', 'Daisy', 'Darcie', 'Ellie', 'Evelyn', 'Frankie', 'Frederick', 'Harrison', 'Hudson', 'Hunter', 'Julian', 'Lillian', 'Lottie', 'Maverick', 'Bret', 'Nolan', 'Nova', 'Owen', 'Phoebe', 'Stella', 'Theodore', 'Arthur', 'Bruce', 'Bryan', 'Carlo', 'Domenic', 'Hayden(Cooper)', 'Reynaldo'],
  },
  {
    name: 'speed',
    label: 'Speed',
    description: 'Speed of voice talking',
    default: 1.0,
    minimum: 0.5,
    maximum: 1.5,
    optional: true,
  },
  {
    name: 'preset',
    label: 'Preset',
    description: 'Quality vs speed mode',
    default: 'high-quality',
    allowedValues: ['real-time', 'balanced', 'low-latency', 'high-quality'],
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
    allowedValues: [false, true],
    optional: true,
  },
  {
    name: 'gfpgan_upscale',
    label: 'Upscale',
    description: 'Upsampling factor (only used if GFPGAN is enabled)',
    default: 1.0,
    allowedValues: [1.0, 2.0],
    optional: true,
  },
  {
    name: 'intro_text',
    label: 'Intro text',
    description: 'Add introductory text to wav2lip video (optional)',
    default: null,
    optional: true,
  }
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
  address: 'abraham-ai/eden-sd-pipelines',
  versionId: '591f2e3bb1e239eb3ef17d278c11e9d39ceafe9a93d078928330df523195a611',
  mode: 'generate',
  parameters: createParameters,
  isDeprecated: false,
}

const createGenerator = {
  generatorName: 'create',
  description: 'Create an image from a prompt',
  output: 'creation',
  versions: [createGeneratorVersion],
}

const interpolateGeneratorVersion = {
  provider: 'replicate',
  address: 'abraham-ai/eden-sd-pipelines',
  versionId: '591f2e3bb1e239eb3ef17d278c11e9d39ceafe9a93d078928330df523195a611',
  mode: 'interpolate',
  parameters: interpolationParameters,
  isDeprecated: false,
}

const interpolateGenerator = {
  generatorName: 'interpolate',
  description: 'Create a video interpolation between two prompts',
  output: 'creation',
  versions: [interpolateGeneratorVersion],
}

const real2realGeneratorVersion = {
  provider: 'replicate',
  address: 'abraham-ai/eden-sd-pipelines',
  versionId: '591f2e3bb1e239eb3ef17d278c11e9d39ceafe9a93d078928330df523195a611',
  mode: 'real2real',
  parameters: real2realParameters,
  isDeprecated: false
}

const real2realGenerator = {
  generatorName: 'real2real',
  description: 'Create a video interpolation between two images',
  output: 'creation',
  versions: [real2realGeneratorVersion]
}

const remixGeneratorVersion = {
  provider: 'replicate',
  address: 'abraham-ai/eden-sd-pipelines',
  versionId: '591f2e3bb1e239eb3ef17d278c11e9d39ceafe9a93d078928330df523195a611',
  mode: 'remix',
  parameters: remixParameters,
  isDeprecated: false
}

const remixGenerator = {
  generatorName: 'remix',
  description: 'Generate a remix of an image',
  output: 'creation',
  versions: [remixGeneratorVersion]
}

const interrogateGeneratorVersion = {
  provider: 'replicate',
  address: 'abraham-ai/eden-sd-pipelines',
  versionId: '591f2e3bb1e239eb3ef17d278c11e9d39ceafe9a93d078928330df523195a611',
  mode: 'interrogate',
  parameters: interrogateParameters,
  isDeprecated: false
}

const interrogateGenerator = {
  generatorName: 'interrogate',
  description: 'Generate a prompt from an image',
  output: 'creation',
  versions: [interrogateGeneratorVersion]
}

const loraGeneratorVersion = {
  provider: 'replicate',
  address: 'abraham-ai/eden-sd-lora',
  versionId: '50ea1c9fd328dc17ac466ed0e1ef7bfdd906cc94b6fb307f39523ef21ca09d46',
  mode: 'lora',
  parameters: loraParameters,
  isDeprecated: false
}

const loraGenerator = {
  generatorName: 'lora',
  description: 'Train a LORA finetuning from a set of images',
  output: 'lora',
  versions: [loraGeneratorVersion]
}

const ttsGeneratorVersion = {
  provider: 'replicate',
  address: 'abraham-ai/tts',
  versionId: '719cf3677389698d331878cda88c9f173bfea5d20f5695055013596436b321c5',
  mode: 'tts',
  parameters: ttsParameters,
  isDeprecated: false
}

const ttsGenerator = {
  generatorName: 'tts',
  description: 'Generate a speech file from a text input',
  output: 'creation',
  versions: [ttsGeneratorVersion]
}

const ttsFastGeneratorVersion = {
  provider: 'tts',
  address: 'playHt/tts',
  versionId: '1',
  mode: 'tts_fast',
  parameters: ttsFastParameters,
  isDeprecated: false
}

const ttsFastGenerator = {
  generatorName: 'tts_fast',
  description: 'Generate a speech file from a text input (fast)',
  output: 'creation',
  versions: [ttsFastGeneratorVersion]
}

const wav2lipGeneratorVersion = {
  provider: 'replicate',
  address: 'abraham-ai/character',
  versionId: 'c06e12c0e39e46e4ce5469a17dfd6af5165d149bb42b069ecd8a6ab990e52450',
  mode: 'wav2lip',
  parameters: wav2lipParameters,
  isDeprecated: false
}

const wav2lipGenerator = {
  generatorName: 'wav2lip',
  description: 'Lip-sync an image or video from a speech file',
  output: 'creation',
  versions: [wav2lipGeneratorVersion]
}

const completeGeneratorVersion = {
  provider: 'replicate',
  address: 'abraham-ai/character',
  versionId: '959a4717d30a99331e162f051565eb286cfb19a2b0ab598d6fee369e510e0d75',
  mode: 'complete',
  parameters: completeParameters,
  isDeprecated: false
}

const completeGenerator = {
  generatorName: 'complete',
  description: 'Generate a prompt completion with GPT',
  output: 'llm',
  versions: [completeGeneratorVersion]
}

db.generators.insertMany([
  createGenerator,
  interpolateGenerator,
  real2realGenerator,
  remixGenerator,
  interrogateGenerator,
  loraGenerator,
  ttsGenerator,
  wav2lipGenerator,
  completeGenerator,
]);

db.generators.insertMany([
  ttsFastGenerator,
]);


const wav2lipGeneratorVersion1 = {
  provider: 'replicate',
  address: 'abraham-ai/character',
  versionId: 'c06e12c0e39e46e4ce5469a17dfd6af5165d149bb42b069ecd8a6ab990e52450',
  mode: 'wav2lip',
  parameters: wav2lipParameters,
  isDeprecated: false
}

const filter = { generatorName: 'wav2lip' };
const update = { $push: { versions: wav2lipGeneratorVersion1 } };
// db.generators.updateOne(filter, update);


const completeGeneratorVersion1 = {
  provider: 'llm',
  address: 'openai/gpt3',
  versionId: '1',
  mode: 'complete',
  parameters: completeParameters,
  isDeprecated: false
}
const filter1 = { generatorName: 'complete' };
const update1 = { $push: { versions: completeGeneratorVersion1 } };
db.generators.updateOne(filter1, update1);





db.generators.updateOne(
  { generatorName: 'create' }, 
  { $push: { versions: createGeneratorVersion } }
);
db.generators.updateOne(
  { generatorName: 'interpolate' }, 
  { $push: { versions: interpolateGeneratorVersion } }
);
db.generators.updateOne(
  { generatorName: 'remix' }, 
  { $push: { versions: remixGeneratorVersion } }
);
db.generators.updateOne(
  { generatorName: 'real2real' }, 
  { $push: { versions: real2realGeneratorVersion } }
);

db.generators.updateOne(
  { generatorName: 'interrogate' }, 
  { $push: { versions: interrogateGeneratorVersion } }
);

db.generators.updateOne(
  { generatorName: 'lora' }, 
  { $push: { versions: loraGeneratorVersion } }
);







const wav2lipGeneratorVersion2 = {
  provider: 'replicate',
  address: 'abraham-ai/character',
  versionId: 'c8898cee9ba231c7d31a3ffc6435eb2135f027cf9c3f11cfd77030a117f16768',
  mode: 'wav2lip',
  parameters: wav2lipParameters,
  isDeprecated: false
}


db.generators.updateOne(
  { generatorName: 'tts' }, 
  { $push: { versions: ttsGeneratorVersion } }
);
