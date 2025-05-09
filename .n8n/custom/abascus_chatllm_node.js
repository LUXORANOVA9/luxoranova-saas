
const { NodeApiError } = require('n8n-workflow');

class AbascusChatLLM {
  constructor() {
    this.id = 'abascusChatLLM';
    this.name = 'Abascus ChatLLM';
    this.description = 'Interact with Large Language Models through Abascus AI';
    this.version = 1;
    this.icon = 'file:abascus.svg';
    this.group = ['transform'];
    this.documentationUrl = 'https://docs.abascusai.com/integration/n8n';
    this.defaults = {
      name: 'Abascus ChatLLM',
    };
    this.inputs = ['main'];
    this.outputs = ['main'];
  }

  async execute() {
    const items = this.getInputData();
    const returnData = [];
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.json.prediction || (item.json.strategy && item.json.market_context)) {
        if (item.json.prediction) {
          console.log('Processing prediction:', item.json.prediction);
          
          returnData.push({
            json: {
              status: 'processed',
              timestamp: new Date().toISOString(),
              input: item.json,
              analysis: {
                projected_return: item.json.prediction.projected_ROI,
                risk_assessment: `Risk Score: ${item.json.prediction.risk_score}/10`,
                action_item: item.json.prediction.recommended_next_move,
                confidence_score: 0.85
              }
            }
          });
        } else {
          console.log('Processing strategy:', item.json.strategy);
          console.log('Market context:', item.json.market_context);
          
          returnData.push({
            json: {
              status: 'processed',
              timestamp: new Date().toISOString(),
              input: item.json,
              analysis: {
                strategy: item.json.strategy,
                market_conditions: item.json.market_context,
                recommendation: 'Processing market context for high volatility scenarios'
              }
            }
          });
        }
      }
    }
    
    return returnData;
  }
}

module.exports = { nodeType: AbascusChatLLM };
