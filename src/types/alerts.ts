export namespace Alerts {
  export interface AlertConfig {
    slack?: SlackAlert;
    email?: EmailAlert;
    url?: WebhookAlert;
  }

  export interface SlackAlert {
    target: string;
  }

  export interface EmailAlert {
    address: string;
  }

  export interface WebhookAlert {
    address: string;
  }
}
