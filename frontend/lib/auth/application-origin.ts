import "server-only";

export function applicationOrigin(){const configured=process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/,"");if(configured){const parsed=new URL(configured);if(!["http:","https:"].includes(parsed.protocol))throw new Error("Application URL must use HTTP or HTTPS.");return parsed.origin;}return "http://localhost:3000";}
