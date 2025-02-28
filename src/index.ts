import type { Plugin } from "@elizaos/core";
import { WhatsAppClient } from "./client";
import type { WhatsAppConfig, WhatsAppMessage, WhatsAppWebhookEvent } from "./types";
import { MessageHandler, WebhookHandler } from "./handlers";
import { validateConfig } from "./utils/validators";

export class WhatsAppPlugin implements Plugin {
    private client: WhatsAppClient;
    private messageHandler: MessageHandler;
    private webhookHandler: WebhookHandler;

    name: string;
    description: string;

    static validate(config: Partial<WhatsAppConfig>): WhatsAppConfig {
        const fullConfig = {
            accessToken: config.accessToken || process.env.WHATSAPP_ACCESS_TOKEN || '',
            phoneNumberId: config.phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID || '',
            webhookVerifyToken: config.webhookVerifyToken || process.env.WHATSAPP_WEBHOOK_TOKEN,
            businessAccountId: config.businessAccountId || process.env.WHATSAPP_BUSINESS_ID
        };

        validateConfig(fullConfig);
        
        return fullConfig;
    }

    constructor(config: Partial<WhatsAppConfig>) {
        this.name = "WhatsApp Cloud API Plugin";
        this.description =
            "A plugin for integrating WhatsApp Cloud API with your application.";
        
        const validatedConfig = WhatsAppPlugin.validate(config);
        
        this.client = new WhatsAppClient(validatedConfig);
        this.messageHandler = new MessageHandler(this.client);
        this.webhookHandler = new WebhookHandler(this.client);
    }

    async sendMessage(message: WhatsAppMessage): Promise<any> {
        return this.messageHandler.send(message);
    }

    async handleWebhook(event: WhatsAppWebhookEvent): Promise<void> {
        return this.webhookHandler.handle(event);
    }

    async verifyWebhook(token: string): Promise<boolean> {
        return this.client.verifyWebhook(token);
    }
}

export * from "./types";
