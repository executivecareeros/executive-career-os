import type { AgentPriority } from "./types";
export type NotificationChannel = "dashboard" | "email" | "slack" | "push";
export type AgentNotification = { id:string; channel:NotificationChannel; priority:AgentPriority; title:string; body:string; createdAt:string; actionUrl?:string };
export interface NotificationProvider { readonly channel: NotificationChannel; send(notification: AgentNotification): Promise<{ accepted: boolean; providerId?: string }>; }
export class NotificationRouter { constructor(private providers: ReadonlyMap<NotificationChannel, NotificationProvider>) {} async send(notification:AgentNotification){const provider=this.providers.get(notification.channel);return provider ? provider.send(notification) : {accepted:false};} }
