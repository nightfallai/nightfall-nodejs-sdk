export namespace Alerts {
  export interface Config {
    slack?: Slack;
    email?: Email;
    url?: Webhook;
  }

  export interface Slack {
    target: string;
  }

  export interface Email {
    address: string;
  }

  export interface Webhook {
    address: string;
  }
}
