import type { Plugin, Action, IAgentRuntime } from "@elizaos/core";
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
    actions: Action[];

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

        // Define las acciones disponibles como un array de Action
        this.actions = [
            {
                name: 'sendMessage',
                description: 'Send a message through WhatsApp',
                similes: ['send', 'message', 'whatsapp'],
                examples: [
                    [
                        {
                            user: '{{user1}}',
                            content: {
                                text: 'Send "Hello" to +1234567890'
                            }
                        },
                        {
                            user: '{{user2}}',
                            content: {
                                text: 'Message sent successfully',
                                action: 'sendMessage'
                            }
                        }
                    ]
                ],
                validate: async (params: any) => {
                    return params && params.to && params.content;
                },
                handler: async (runtime: IAgentRuntime, params: any) => {
                    const message = params as WhatsAppMessage;
                    return this.messageHandler.send(message);
                }
            },
            {
                name: 'handleWebhook',
                description: 'Handle incoming WhatsApp webhook events',
                similes: ['webhook', 'handle', 'event'],
                examples: [
                    [
                        {
                            user: '{{user1}}',
                            content: {
                                text: 'Handle incoming message webhook'
                            }
                        },
                        {
                            user: '{{user2}}',
                            content: {
                                text: 'Webhook handled successfully',
                                action: 'handleWebhook'
                            }
                        }
                    ]
                ],
                validate: async (params: any) => {
                    return params && params.object === 'whatsapp_business_account';
                },
                handler: async (runtime: IAgentRuntime, params: any) => {
                    const event = params as WhatsAppWebhookEvent;
                    return this.webhookHandler.handle(event);
                }
            },
            {
                name: 'verifyWebhook',
                description: 'Verify WhatsApp webhook token',
                similes: ['verify', 'token', 'webhook'],
                examples: [
                    [
                        {
                            user: '{{user1}}',
                            content: {
                                text: 'Verify webhook with token "abc123"'
                            }
                        },
                        {
                            user: '{{user2}}',
                            content: {
                                text: 'Token verified successfully',
                                action: 'verifyWebhook'
                            }
                        }
                    ]
                ],
                validate: async (params: any) => {
                    return typeof params === 'string' && params.length > 0;
                },
                handler: async (runtime: IAgentRuntime, params: any) => {
                    const token = params as string;
                    return this.client.verifyWebhook(token);
                }
            }
        ];
    }

    // Métodos internos para el manejo directo
    private async sendMessage(message: WhatsAppMessage): Promise<any> {
        return this.messageHandler.send(message);
    }

    private async handleWebhook(event: WhatsAppWebhookEvent): Promise<void> {
        return this.webhookHandler.handle(event);
    }

    private async verifyWebhook(token: string): Promise<boolean> {
        return this.client.verifyWebhook(token);
    }
}

export * from "./types";

// Export a default instance of the plugin
export default new WhatsAppPlugin({});