// src/client.ts
import axios from "axios";
var WhatsAppClient = class {
  client;
  config;
  constructor(config) {
    this.config = config;
    this.client = axios.create({
      baseURL: "https://graph.facebook.com/v17.0",
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        "Content-Type": "application/json"
      }
    });
  }
  async sendMessage(message) {
    const endpoint = `/${this.config.phoneNumberId}/messages`;
    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: message.to,
      type: message.type,
      ...message.type === "text" ? { text: { body: message.content } } : { template: message.content }
    };
    return this.client.post(endpoint, payload);
  }
  async verifyWebhook(token) {
    return token === this.config.webhookVerifyToken;
  }
};

// src/handlers/message.handler.ts
var MessageHandler = class {
  constructor(client) {
    this.client = client;
  }
  async send(message) {
    try {
      const response = await this.client.sendMessage(message);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Failed to send WhatsApp message: ${error.message}`
        );
      }
      throw new Error("Failed to send WhatsApp message");
    }
  }
};

// src/handlers/webhook.handler.ts
var WebhookHandler = class {
  constructor(client) {
    this.client = client;
  }
  async handle(event) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
    try {
      if ((_e = (_d = (_c = (_b = (_a = event.entry) == null ? void 0 : _a[0]) == null ? void 0 : _b.changes) == null ? void 0 : _c[0]) == null ? void 0 : _d.value) == null ? void 0 : _e.messages) {
        const messages = event.entry[0].changes[0].value.messages;
        for (const message of messages) {
          await this.handleMessage(message);
        }
      }
      if ((_j = (_i = (_h = (_g = (_f = event.entry) == null ? void 0 : _f[0]) == null ? void 0 : _g.changes) == null ? void 0 : _h[0]) == null ? void 0 : _i.value) == null ? void 0 : _j.statuses) {
        const statuses = event.entry[0].changes[0].value.statuses;
        for (const status of statuses) {
          await this.handleStatus(status);
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Failed to send WhatsApp message: ${error.message}`
        );
      }
      throw new Error("Failed to send WhatsApp message");
    }
  }
  async handleMessage(message) {
    console.log("Received message:", message);
  }
  async handleStatus(status) {
    console.log("Received status update:", status);
  }
};

// src/utils/validators.ts
function validateConfig(config) {
  if (!config.accessToken) {
    throw new Error("WhatsApp access token is required. Set WHATSAPP_ACCESS_TOKEN environment variable or provide in config.");
  }
  if (!config.phoneNumberId) {
    throw new Error("WhatsApp phone number ID is required. Set WHATSAPP_PHONE_NUMBER_ID environment variable or provide in config.");
  }
  return;
}

// src/index.ts
var WhatsAppPlugin = class _WhatsAppPlugin {
  client;
  messageHandler;
  webhookHandler;
  name;
  description;
  actions;
  static validate(config) {
    const fullConfig = {
      accessToken: config.accessToken || process.env.WHATSAPP_ACCESS_TOKEN || "",
      phoneNumberId: config.phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID || "",
      webhookVerifyToken: config.webhookVerifyToken || process.env.WHATSAPP_WEBHOOK_TOKEN,
      businessAccountId: config.businessAccountId || process.env.WHATSAPP_BUSINESS_ID
    };
    validateConfig(fullConfig);
    return fullConfig;
  }
  constructor(config) {
    this.name = "WhatsApp Cloud API Plugin";
    this.description = "A plugin for integrating WhatsApp Cloud API with your application.";
    const validatedConfig = _WhatsAppPlugin.validate(config);
    this.client = new WhatsAppClient(validatedConfig);
    this.messageHandler = new MessageHandler(this.client);
    this.webhookHandler = new WebhookHandler(this.client);
    this.actions = [
      {
        name: "sendMessage",
        description: "Send a message through WhatsApp",
        similes: ["send", "message", "whatsapp"],
        examples: [
          [
            {
              user: "{{user1}}",
              content: {
                text: 'Send "Hello" to +1234567890'
              }
            },
            {
              user: "{{user2}}",
              content: {
                text: "Message sent successfully",
                action: "sendMessage"
              }
            }
          ]
        ],
        validate: async (params) => {
          return params && params.to && params.content;
        },
        handler: async (runtime, params) => {
          const message = params;
          return this.messageHandler.send(message);
        }
      },
      {
        name: "handleWebhook",
        description: "Handle incoming WhatsApp webhook events",
        similes: ["webhook", "handle", "event"],
        examples: [
          [
            {
              user: "{{user1}}",
              content: {
                text: "Handle incoming message webhook"
              }
            },
            {
              user: "{{user2}}",
              content: {
                text: "Webhook handled successfully",
                action: "handleWebhook"
              }
            }
          ]
        ],
        validate: async (params) => {
          return params && params.object === "whatsapp_business_account";
        },
        handler: async (runtime, params) => {
          const event = params;
          return this.webhookHandler.handle(event);
        }
      },
      {
        name: "verifyWebhook",
        description: "Verify WhatsApp webhook token",
        similes: ["verify", "token", "webhook"],
        examples: [
          [
            {
              user: "{{user1}}",
              content: {
                text: 'Verify webhook with token "abc123"'
              }
            },
            {
              user: "{{user2}}",
              content: {
                text: "Token verified successfully",
                action: "verifyWebhook"
              }
            }
          ]
        ],
        validate: async (params) => {
          return typeof params === "string" && params.length > 0;
        },
        handler: async (runtime, params) => {
          const token = params;
          return this.client.verifyWebhook(token);
        }
      }
    ];
  }
  // Métodos internos para el manejo directo
  async sendMessage(message) {
    return this.messageHandler.send(message);
  }
  async handleWebhook(event) {
    return this.webhookHandler.handle(event);
  }
  async verifyWebhook(token) {
    return this.client.verifyWebhook(token);
  }
};
var index_default = new WhatsAppPlugin({});
export {
  WhatsAppPlugin,
  index_default as default
};
