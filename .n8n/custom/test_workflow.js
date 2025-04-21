
const { NodeApiError } = require('n8n-workflow');
const { AbascusChatLLM } = require('./abascus_chatllm_node');

async function testNode() {
  const node = new AbascusChatLLM();
  
  // Test input data
  const testData = [{
    json: {
      strategy: 'lux_strategy_v2',
      market_context: 'high volatility scenario'
    }
  }];

  try {
    const result = await node.execute.call({
      getInputData: () => testData,
      helpers: {
        request: () => Promise.resolve({ data: { success: true } })
      }
    });
    
    console.log('Test Results:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('Test Failed:', error);
    throw error;
  }
}

testNode().catch(console.error);
