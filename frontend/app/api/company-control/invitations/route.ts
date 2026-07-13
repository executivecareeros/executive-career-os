import { NextResponse } from "next/server";
import { resolveFounderAccess } from "@/lib/auth/founder-access";
import { FounderInvitationService } from "@/lib/beta/invitation-management";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {applicationOrigin} from "@/lib/auth/application-origin";

async function service(){const access=await resolveFounderAccess();if(!access)return undefined;return new FounderInvitationService(createServerSupabaseClient(access.accessToken),access.context.workspace!.workspaceId);}
function message(error:unknown){return error instanceof Error?error.message:"Invitation operation failed.";}

export async function GET(){const invitations=await service();if(!invitations)return NextResponse.json({error:"Not found"},{status:404});try{return NextResponse.json({invitations:await invitations.list()});}catch(error){return NextResponse.json({error:message(error)},{status:400});}}

export async function POST(request:Request){const invitations=await service();if(!invitations)return NextResponse.json({error:"Not found"},{status:404});try{const body=await request.json() as {email?:string;expiresAt?:string};const email=body.email?.trim()??"";const expiresAt=body.expiresAt??"";if(!email||!expiresAt)return NextResponse.json({error:"Email and expiry are required."},{status:400});const created=await invitations.create(email,expiresAt);const origin=applicationOrigin();return NextResponse.json({id:created.id,invitationLink:`${origin}/register?invite=${encodeURIComponent(created.token)}&email=${encodeURIComponent(email.toLowerCase())}`},{status:201});}catch(error){return NextResponse.json({error:message(error)},{status:400});}}

export async function PATCH(request:Request){const invitations=await service();if(!invitations)return NextResponse.json({error:"Not found"},{status:404});try{const body=await request.json() as {id?:string};if(!body.id)return NextResponse.json({error:"Invitation ID is required."},{status:400});await invitations.revoke(body.id);return NextResponse.json({ok:true});}catch(error){return NextResponse.json({error:message(error)},{status:400});}}
