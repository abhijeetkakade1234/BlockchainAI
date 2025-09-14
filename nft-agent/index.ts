import { Agentkit, AgentkitToolkit } from "@0xgasless/agentkit";
import { StructuredToolInterface } from "@langchain/core/tools";
import * as dotenv from "dotenv";
import * as readline from "readline";

// Simple Web3 Chat Agent
class Web3ChatAgent {
  private model: any;
  private tools: StructuredToolInterface[] = [];

  constructor(geminiApiKey: string) {
    const { GoogleGenerativeAI } = require("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(geminiApiKey);

    this.model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1024,
        topP: 0.9,
        topK: 40,
      },
    });
  }

  setTools(tools: StructuredToolInterface[]) {
    this.tools = tools;
    console.log("🔧 Available tools:", tools.map(t => t.name).join(", "));
  }

  // Main processing method
  async processMessage(message: string): Promise<string> {
    try {
      console.log("🔍 Processing message:", message);
      
      // Check if this is a web3 command
      const commandResult = await this.handleWeb3Command(message);
      if (commandResult) {
        return commandResult;
      }

      // Otherwise, send to Gemini for normal chat
      return await this.sendToGemini(message);
    } catch (error) {
      console.error("❌ Process message error:", error);
      return "❌ Sorry, I encountered an error processing your message.";
    }
  }

  // Handle web3 commands
  private async handleWeb3Command(message: string): Promise<string | null> {
    const lowerMessage = message.toLowerCase().trim();
    console.log("🔍 Checking for web3 commands in:", lowerMessage);
    
    // Balance command
    if (/\b(balance|bal|check balance|my balance|wallet balance|get balance)\b/.test(lowerMessage)) {
      console.log("✅ DETECTED: Balance command");
      return await this.executeBalanceCommand();
    }
    
    // Wallet/Address command
    if (/\b(wallet|address|eoa|my wallet|my address|wallet address|get address)\b/.test(lowerMessage) && !/\b(send|transfer|to)\b/.test(lowerMessage)) {
      console.log("✅ DETECTED: Wallet address command");
      return await this.executeAddressCommand();
    }
    
    // Transfer command - MOST IMPORTANT!
    if (/\b(send|transfer|pay|give)\b/.test(lowerMessage) && /\b(eth|sol|usdc|token|\d+)\b/.test(lowerMessage)) {
      console.log("✅ DETECTED: Transfer command");
      return await this.executeTransferCommand(message);
    }

    // Swap command  
    if (/\b(swap|exchange|convert)\b/.test(lowerMessage)) {
      console.log("✅ DETECTED: Swap command");
      return await this.executeSwapCommand(message);
    }
    
    console.log("❌ No web3 command detected - sending to Gemini");
    return null; // Not a web3 command
  }

  // Execute balance command
  private async executeBalanceCommand(): Promise<string> {
    const balanceTool = this.tools.find(t => t.name === "get_balance");
    if (!balanceTool) {
      return "❌ Balance tool not available. Please check your AgentKit configuration.";
    }
    try {
      const result = await balanceTool.call({});
      return typeof result === 'string' ? result : JSON.stringify(result);
    } catch (error) {
      console.error("❌ Balance tool error:", error);
      return `❌ Error checking balance: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  // Execute address command
  private async executeAddressCommand(): Promise<string> {
    const eoaTool = this.tools.find(t => t.name === "get_eoa_address");
    if (!eoaTool) {
      return "❌ Wallet address tool not available. Please check your AgentKit configuration.";
    }
    try {
      const result = await eoaTool.call({});
      return typeof result === 'string' ? result : JSON.stringify(result);
    } catch (error) {
      console.error("❌ EOA tool error:", error);
      return `❌ Error getting wallet address: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  // Execute transfer command
  private async executeTransferCommand(message: string): Promise<string> {
    console.log("🔧 Looking for smart_transfer tool...");
    const transferTool = this.tools.find(t => t.name === "smart_transfer");
    
    if (!transferTool) {
      console.log("❌ smart_transfer tool not found!");
      console.log("Available tools:", this.tools.map(t => t.name));
      return "❌ Transfer tool (smart_transfer) not available. Available tools: " + this.tools.map(t => t.name).join(", ");
    }

    console.log("✅ Found smart_transfer tool");
    
    try {
      // Parse transfer details from natural language
      const transferParams = this.parseTransferCommand(message);
      if (!transferParams) {
        return "❌ Could not parse transfer command. Please use format:\n'send [amount] [token] to [address]'\nExample: 'send 0.1 ETH to 0x123...'";
      }

      console.log("📤 Transfer params:", transferParams);
      const result = await transferTool.call(transferParams);
      return typeof result === 'string' ? result : JSON.stringify(result);
    } catch (error) {
      console.error("❌ Transfer error:", error);
      return `❌ Transfer failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  // Execute swap command
  private async executeSwapCommand(message: string): Promise<string> {
    const swapTool = this.tools.find(t => t.name === "smart_swap");
    if (!swapTool) {
      return "❌ Swap tool (smart_swap) not available. Available tools: " + this.tools.map(t => t.name).join(", ");
    }

    try {
      const swapParams = this.parseSwapCommand(message);
      if (!swapParams) {
        return "❌ Could not parse swap command. Please use format:\n'swap [amount] [from_token] for [to_token]'\nExample: 'swap 10 ETH for USDC'";
      }

      console.log("🔄 Swap params:", swapParams);
      const result = await swapTool.call(swapParams);
      return typeof result === 'string' ? result : JSON.stringify(result);
    } catch (error) {
      console.error("❌ Swap error:", error);
      return `❌ Swap failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  // Parse transfer command from natural language
  private parseTransferCommand(message: string): any | null {
    try {
      console.log("🔍 Parsing transfer command:", message);
      
      // Pattern: "send 0.1 ETH to 0x123..."
      const transferRegex = /(?:send|transfer|pay|give)\s+(\d+(?:\.\d+)?)\s+([A-Za-z]+)\s+to\s+(0x[a-fA-F0-9]{40})/i;
      const match = message.match(transferRegex);
      
      if (match) {
        const [, amount, token, toAddress] = match;
        const params = {
          amount: amount,
          token: token.toUpperCase(),
          to: toAddress
        };
        console.log("✅ Parsed transfer params:", params);
        return params;
      }

      // Pattern: "give 20 ETH from 0x... to 0x..."
      const fromToRegex = /(?:give|send|transfer)\s+(\d+(?:\.\d+)?)\s+([A-Za-z]+)\s+from\s+(0x[a-fA-F0-9]{40})\s+to\s+(0x[a-fA-F0-9]{40})/i;
      const fromToMatch = message.match(fromToRegex);
      
      if (fromToMatch) {
        const [, amount, token, fromAddress, toAddress] = fromToMatch;
        const params = {
          amount: amount,
          token: token.toUpperCase(),
          from: fromAddress,
          to: toAddress
        };
        console.log("✅ Parsed from-to transfer params:", params);
        return params;
      }

      console.log("❌ Could not parse transfer command");
      return null;
    } catch (error) {
      console.error("❌ Parse transfer error:", error);
      return null;
    }
  }

  // Parse swap command from natural language  
  private parseSwapCommand(message: string): any | null {
    try {
      console.log("🔍 Parsing swap command:", message);
      
      // Pattern: "swap 10 ETH for USDC" or "convert 1 USD to ETH"
      const swapRegex = /(?:swap|exchange|convert)\s+(\d+(?:\.\d+)?)\s+([A-Za-z]+)\s+(?:for|to|into)\s+([A-Za-z]+)/i;
      const match = message.match(swapRegex);
      
      if (match) {
        const [, amount, fromToken, toToken] = match;
        const params = {
          amount: amount,
          fromToken: fromToken.toUpperCase(),
          toToken: toToken.toUpperCase()
        };
        console.log("✅ Parsed swap params:", params);
        return params;
      }

      console.log("❌ Could not parse swap command");
      return null;
    } catch (error) {
      console.error("❌ Parse swap error:", error);
      return null;
    }
  }

  // Send message to Gemini for normal chat
  private async sendToGemini(message: string): Promise<string> {
    try {
      console.log("🤖 Sending to Gemini:", message);
      const chat = this.model.startChat();
      const parts = [{ text: message }];
      const response = await chat.sendMessage(parts);
      const responseText = await response.response.text();
      return responseText || "I'm here to help! You can ask me about web3 (balance, wallet address, transfers, swaps) or chat normally.";
    } catch (error) {
      console.error("❌ Gemini API Error:", error);
      return "❌ Sorry, I'm having trouble generating a response right now. You can still use web3 commands like 'balance', 'wallet address', or 'send [amount] [token] to [address]'.";
    }
  }
}

// Load environment variables
dotenv.config();

function validateEnv() {
  const requiredVars = ["PRIVATE_KEY", "RPC_URL", "API_KEY", "CHAIN_ID", "GEMINI_API_KEY"];
  const missing = requiredVars.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    console.error("❌ Missing env vars:", missing.join(", "));
    console.error("Please create a .env file with:");
    console.error("PRIVATE_KEY=0x...");
    console.error("RPC_URL=https://...");
    console.error("API_KEY=...");
    console.error("CHAIN_ID=1");
    console.error("GEMINI_API_KEY=...");
    process.exit(1);
  }
}

validateEnv();

// Initialize AgentKit + Chat Agent
async function initializeAgent() {
  try {
    console.log("🔄 Initializing chat agent...");
    const agent = new Web3ChatAgent(process.env.GEMINI_API_KEY!);

    console.log("🔄 Configuring AgentKit...");
    const agentkit = await Agentkit.configureWithWallet({
      privateKey: process.env.PRIVATE_KEY as `0x${string}`,
      rpcUrl: process.env.RPC_URL!,
      apiKey: process.env.API_KEY!,
      chainID: Number(process.env.CHAIN_ID),
    });

    console.log("🔄 Setting up tools...");
    const agentkitToolkit = new AgentkitToolkit(agentkit);
    const tools = agentkitToolkit.getTools() as StructuredToolInterface[];
    
    // Pass tools to the agent
    agent.setTools(tools);

    console.log(`✅ Loaded ${tools.length} AgentKit tools`);

    return agent;
  } catch (error) {
    console.error("❌ Initialization error:", error);
    throw error;
  }
}

// Interactive chat
async function runChat(agent: Web3ChatAgent) {
  console.log("\n🤖 Chat Agent Ready!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("💬 Normal chat: Ask me anything!");
  console.log("⚡ Web3 commands: 'balance', 'wallet address'");
  console.log("💸 Transfers: 'send 0.1 ETH to 0x123...'");
  console.log("🔄 Swaps: 'swap 10 ETH for USDC'");
  console.log("🚪 Type 'exit' to quit");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt: string) => new Promise<string>((res) => rl.question(prompt, res));

  let messageCount = 0;
  
  while (true) {
    try {
      const input = await question("You: ");
      
      if (input.toLowerCase().trim() === "exit") {
        console.log("👋 Goodbye!");
        break;
      }

      if (!input.trim()) {
        console.log("🤔 Please enter a message or command.");
        continue;
      }

      messageCount++;
      console.log(`\n[${messageCount}] Processing: "${input}"`);
      
      const startTime = Date.now();
      const response = await agent.processMessage(input);
      const endTime = Date.now();
      
      console.log(`🤖 AI (${endTime - startTime}ms):`, response);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
      
    } catch (error) {
      console.error("❌ Chat error:", error);
      console.log("🔄 Please try again.\n");
    }
  }

  rl.close();
}

// Main execution
(async () => {
  try {
    console.log("🚀 Starting Web3 Chat Agent...");
    const agent = await initializeAgent();
    await runChat(agent);
  } catch (error) {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  }
})();