import { NextRequest, NextResponse } from "next/server";
const publicPaths=["/login","/register","/forgot-password","/reset-password","/verify-email","/auth/confirm"];
export function proxy(request:NextRequest){if(process.env.NEXT_PUBLIC_DATA_ACCESS_MODE!=="supabase")return NextResponse.next();const path=request.nextUrl.pathname;if(publicPaths.some((item)=>path.startsWith(item))||path.startsWith("/api/auth/"))return NextResponse.next();if(!request.cookies.has("ecos-access-token")&&!request.cookies.has("ecos-refresh-token")){const url=new URL("/login",request.url);url.searchParams.set("next",path);return NextResponse.redirect(url);}return NextResponse.next();}
export const config={matcher:["/((?!_next/static|_next/image|favicon.ico).*)"]};
