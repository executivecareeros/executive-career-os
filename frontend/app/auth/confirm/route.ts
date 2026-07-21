import {NextRequest,NextResponse} from "next/server";
import {storeSession} from "@/lib/auth/cookies";
import {supabaseAuth} from "@/lib/auth/supabase-auth";
import {acceptRememberedInvitation} from "@/lib/beta/invitations";
import {applicationOrigin} from "@/lib/auth/application-origin";

function safeNext(value:string|null){return value?.startsWith("/")&&!value.startsWith("//")?value:"/onboarding";}
export async function GET(request:NextRequest){const tokenHash=request.nextUrl.searchParams.get("token_hash");const type=request.nextUrl.searchParams.get("type");const next=safeNext(request.nextUrl.searchParams.get("next"));const origin=applicationOrigin();if(!tokenHash||type!=="email")return NextResponse.redirect(new URL("/verify-email?error=invalid",origin));try{const session=await supabaseAuth.verifyEmail(tokenHash);if(!session.user.email_confirmed_at)throw new Error("Email is not verified");await acceptRememberedInvitation(session.access_token);await storeSession(session,true);return NextResponse.redirect(new URL(next,origin));}catch{return NextResponse.redirect(new URL("/verify-email?error=invalid",origin));}}
