
const express = require('express');
const { AbascusChatLLM } = require('./abascus_chatllm_node');
const LuxoraNode = require('./luxora_node');
const app = express();

app.use(express.json());

app.post('/luxora-trigger', async (req, res) => {
  try {
    const luxoraNode = require('./luxora_node')();
    const input = {
      strategy: req.body.strategy,
      context: req.body.context,
      prediction: req.body.prediction
    };

    const result = luxoraNode.execute(JSON.stringify(input));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Luxora trigger server running on port ${PORT}`);
});
