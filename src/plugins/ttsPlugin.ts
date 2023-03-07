import type { FastifyInstance } from 'fastify';
import axios from 'axios';

export class PlayHT {
  headers: { 'Content-Type': string; Authorization: string; 'X-User-ID': string; };
  url: string;
  
  constructor(url: string, apiKey: string, apiSecret: string) {
    this.url = url;
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': apiSecret,
      'X-User-ID': apiKey
    }
  }
  
  startTask = async (voice: string, text: string) => {
    const body = {
      voice: voice,
      content: [text]
    }
    let response = await axios.post(this.url, body, { headers: this.headers });
    if (response.status !== 201) {
      throw new Error('Failed')
    }
    const jobId = response.data.transcriptionId;
    console.log(`Submitted job ${jobId} to PlayHT`)
    return jobId;
  }
  
  pollForTask = async (pollingInterval: number, jobId: string) => {
    const urlFetch = `https://play.ht/api/v1/articleStatus?transcriptionId=${jobId}`
    let finished = false;
    while (!finished) {
      let response = await axios.get(urlFetch, {headers: this.headers });
      console.log("response2", response.data)
      if (response.status !== 200) {
        throw new Error('Failed')
      }
      const data = response.data;
      if (data.transcriped) {
        finished = true;
        const audioUrl = data.audioUrl[0];
        console.log(`Got audio url ${audioUrl}`)
        return audioUrl;
      }
      await new Promise((resolve) => setTimeout(resolve, pollingInterval));
    }  
  }

}

export const registerTts = async (fastify: FastifyInstance) => {
  
  try {
    const playHt = new PlayHT(
      'https://play.ht/api/v1/convert',
      process.env.PLAYHT_API_KEY!,
      process.env.PLAYHT_API_SECRET!,
    );
    fastify.decorate('tts', playHt);
    fastify.log.info('Successfully registered playHtPlugin');
  } catch (err) {
    fastify.log.error('Plugin: Tts, error on register', err);
  }
};

declare module "fastify" {
  interface FastifyInstance {
    tts?: PlayHT;
  }
}

export default registerTts;