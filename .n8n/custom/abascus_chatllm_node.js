
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
    console.log('Abascus ChatLLM node is running...');
    return [[]];
  }
}

module.exports = { nodeType: AbascusChatLLM };
