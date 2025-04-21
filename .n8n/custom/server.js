
const express = require('express');
const { AbascusChatLLM } = require('./abascus_chatllm_node');
const app = express();

app.use(express.json());

app.post('/luxora-trigger', async (req, res) => {
  try {
    const node = new AbascusChatLLM();
    const testData = [{
      json: {
        strategy: req.body.strategy || 'lux_strategy_v2',
        market_context: req.body.context || 'default context',
        prediction: req.body.prediction || {}
      }
    }];

    const result = await node.execute.call({
      getInputData: () => testData,
      getNodeParameter: (param, itemIndex, defaultValue) => defaultValue,
      getCredentials: () => ({ apiKey: process.env.ABASCUS_API_KEY })
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Luxora trigger server running on port ${PORT}`);
});
