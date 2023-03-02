import { MongoClient, ObjectId } from 'mongodb';


//ts-node -r tsconfig-paths/register -r dotenv/config --extensions ts,tsx misc/migrate.ts

const MONGO_URI = 'mongodb://____';

const client = new MongoClient(MONGO_URI);

async function iterateCreations() {
  try {

    console.log("connecting to db")
    await client.connect();
    console.log('Connected to the database');

    const tasks = client.db('eden-stg').collection('tasks');
    const generators = client.db('eden-stg').collection('generators');

    
    const createGenerator = await generators.findOne({generatorName: "create"});
    const createVersion0 = createGenerator.versions[0].versionId;

    const remixGenerator = await generators.findOne({generatorName: "remix"});
    const remixVersion0 = remixGenerator.versions[0].versionId;

    const interrogationGenerator = await generators.findOne({generatorName: "interrogate"});
    const interrogationVersion0 = interrogationGenerator.versions[0].versionId;

    const interpolateGenerator = await generators.findOne({generatorName: "interpolate"});
    const interpolateVersion0 = interpolateGenerator.versions[0].versionId;

    const real2realGenerator = await generators.findOne({generatorName: "real2real"});
    const real2realVersion0 = real2realGenerator.versions[0].versionId;

    const wav2lipGenerator = await generators.findOne({generatorName: "wav2lip"});
    const wav2lipVersion0 = wav2lipGenerator.versions[0].versionId;

    const ttsGenerator = await generators.findOne({generatorName: "tts"});
    const ttsVersion0 = ttsGenerator.versions[0].versionId;

    const gptGenerator = await generators.findOne({generatorName: "complete"});
    const gptVersion0 = gptGenerator.versions[0].versionId;

    const loraGenerator = await generators.findOne({generatorName: "lora"});
    const loraVersion0 = loraGenerator.versions[0].versionId;

    // print all

    console.log(createGenerator, createVersion0);
    console.log(remixGenerator, remixVersion0);
    console.log(interrogationGenerator, interrogationVersion0);
    console.log(interpolateGenerator, interpolateVersion0);
    console.log(real2realGenerator, real2realVersion0);
    console.log(wav2lipGenerator, wav2lipVersion0);
    console.log(ttsGenerator, ttsVersion0);
    console.log(gptGenerator, gptVersion0);
    console.log(loraGenerator, loraVersion0);


    console.log("DONE")


    let gennies = [];

    const cursor = tasks.find();
    let ct = 0;

    await cursor.forEach(async (task) => {
 

      const generator = await generators.findOne({
        _id: new ObjectId(task.generator),
      });

      ct+=1;

      if (generator == null) {
        console.log("no generator");
      }

      /*
      // If the corresponding document is null, log a message to the console
      if (generator == null) {

        console.log("no generator");
        let newGeneratorId;
        let newVersionId;

        // console.log(task.versionId)
        gennies.push(task.versionId);

        if (task.config.lora_training_urls) {
          // console.log("lora")
          newGeneratorId = loraGenerator._id;
          newVersionId = loraVersion0;
        }
        else if (task.config.max_tokens) {
          // console.log("gpt")
          newGeneratorId = gptGenerator._id;
          newVersionId = gptVersion0;
        }
        else if (task.config.preset) {
          // console.log("tts")
          newGeneratorId = ttsGenerator._id;
          newVersionId = ttsVersion0;
        }
        else if (task.config.face_url) {
          // console.log("wav2lip")
          newGeneratorId = wav2lipGenerator._id;
          newVersionId = wav2lipVersion0;
        }
        else if (task.config.interpolation_init_images) {
          // console.log("real2real");
          newGeneratorId = real2realGenerator._id;
          newVersionId = real2realVersion0;
        }
        else if (task.config.interpolation_texts) {
          // console.log("interpolate")
          newGeneratorId = interpolateGenerator._id;
          newVersionId = interpolateVersion0;
        }
        else if (task.output?.attributes?.interrogation) {
          //console.log("interrogation")
          newGeneratorId = interrogationGenerator._id;
          newVersionId = interrogationVersion0;
        }
        else if (task.config.init_image_strength>0) {
          // console.log("remix")
          newGeneratorId = remixGenerator._id;
          newVersionId = remixVersion0;
        }
        else if (task.config.text_input) {
          newGeneratorId = createGenerator._id;
          newVersionId = createVersion0;
        }


        if (newGeneratorId && newVersionId) {


          console.log("============")
          console.log("from")
          console.log(task.generator, task.versionId)
          console.log("to");
          console.log(newGeneratorId, newVersionId);
          // make sure types are same
          console.log("============")
          ct += 1;
          console.log(ct);

          await tasks.updateOne(
            { _id: task._id },
            { $set: { generator: newGeneratorId, versionId: newVersionId } }
          );
        }

        else {
          console.log("nothing")
        }


      
      }
      else {
        //console.log(generator);
      }
      */

      
    });
    

    // const gens = [...new Set(gennies)];
    // console.log(gens)

    // const counts = gennies.reduce((acc, curr) => {
    //   acc[curr] = (acc[curr] || 0) + 1;
    //   return acc;
    // }, {});

    // console.log("generator counts")
    // console.log(counts)
    

  } catch (error) {
    console.error(error);
  } finally {
    await client.close();
    console.log('Disconnected from the database');
  }
}



iterateCreations();




