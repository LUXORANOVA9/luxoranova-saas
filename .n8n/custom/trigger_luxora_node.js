
const { AbascusChatLLM } = require('./abascus_chatllm_node');

async function triggerNode() {
  const node = new AbascusChatLLM();
  
  // Test data for the node
  const testData = [{
    json: {
      strategy: 'lux_strategy_v2',
      market_context: 'high volatility scenario',
      prediction: {
        projected_ROI: '15%',
        risk_score: 7,
        recommended_next_move: 'Adjust portfolio allocation'
      }
    }
  }];

  try {
    console.log('Triggering Luxora node...');
    const result = await node.execute.call({
      getInputData: () => testData,
      getNodeParameter: (param, itemIndex, defaultValue) => defaultValue,
      getCredentials: () => ({ apiKey: process.env.ABASCUS_API_KEY })
    });
    console.log('Results:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

triggerNode();
