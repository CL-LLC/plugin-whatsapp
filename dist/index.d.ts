import { Plugin, Action } from '@elizaos/core';

interface WhatsAppConfig {
    accessToken: string;
    phoneNumberId: string;
    webhookVerifyToken?: string;
    businessAccountId?: string;
}
interface WhatsAppMessage {
    type: "text" | "template";
    to: string;
    content: string | WhatsAppTemplate;
}
interface WhatsAppTemplate {
    name: string;
    language: {
        code: string;
    };
    components?: Array<{
        type: string;
        parameters: Array<{
            type: string;
            text?: string;
        }>;
    }>;
}
interface WhatsAppWebhookEvent {
    object: string;
    entry: Array<{
        id: string;
        changes: Array<{
            value: {
                messaging_product: string;
                metadata: {
                    display_phone_number: string;
                    phone_number_id: string;
                };
                statuses?: Array<{
                    id: string;
                    status: string;
                    timestamp: string;
                    recipient_id: string;
                }>;
                messages?: Array<{
                    from: string;
                    id: string;
                    timestamp: string;
                    text?: {
                        body: string;
                    };
                    type: string;
                }>;
            };
            field: string;
        }>;
    }>;
}

declare class WhatsAppPlugin implements Plugin {
    private client;
    private messageHandler;
    private webhookHandler;
    name: string;
    description: string;
    actions: Action[];
    static validate(config: Partial<WhatsAppConfig>): WhatsAppConfig;
    constructor(config: Partial<WhatsAppConfig>);
    private sendMessage;
    private handleWebhook;
    private verifyWebhook;
}

declare const _default: WhatsAppPlugin;

export { type WhatsAppConfig, type WhatsAppMessage, WhatsAppPlugin, type WhatsAppTemplate, type WhatsAppWebhookEvent, _default as default };
