const OpenAI = require('openai');

const openai = new OpenAI();

async function generateImage(prompt) {
    const response = await openai.images.generate({
        model: "dall-e-2",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
      });
    console.log(response.data);
    image_url = response.data[0].url;
    return image_url;
}

module.exports = generateImage;