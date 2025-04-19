# Abascus ChatLLM Node for n8n


This custom node for n8n enables seamless integration with Large Language Models (LLMs) through the Abascus AI platform, specifically designed for the Luxoranova Executive AI Subbrain's 60-second neural loop system.

## Features

* Connect to OpenAI or Abascus AI API endpoints

* Support for multiple LLM models (GPT-4, GPT-3.5, Claude, etc.)

* Task-specific prompting for sales, outreach, content creation, and investor relations

* Contextual memory to maintain conversation history across workflow runs

* Structured data extraction based on task type

* Customizable model parameters (temperature, max tokens, etc.)

* Support for both chat completions and text completions

* JSON response format option for structured outputs

## Installation

### Method 1: Manual Installation

1. Create a `.n8n/custom` directory in your home directory if it doesn't exist:\\


bash\\


mkdir -p \~/.n8n/custom

1. Copy the `abascus_chatllm_node.json` file to this directory: