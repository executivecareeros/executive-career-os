import { NextResponse } from "next/server";
import { currentSession } from "@/lib/auth/session";
import { MAX_IMPORT_BYTES } from "@/lib/import/file-policy";
import { extractHistoryDocument } from "@/lib/import/document-extraction";

export const runtime="nodejs";

export async function POST(request:Request){
  if(!await currentSession())return NextResponse.json({error:"Authentication required."},{status:401});
  try{
    const body=await request.formData(),file=body.get("file");
    if(!(file instanceof File))return NextResponse.json({error:"Select a CV or resume file."},{status:400});
    if(file.size>MAX_IMPORT_BYTES)return NextResponse.json({error:"File exceeds the 5 MB import limit."},{status:413});
    return NextResponse.json(await extractHistoryDocument(file));
  }catch(error){return NextResponse.json({error:error instanceof Error?error.message:"The document could not be extracted safely."},{status:422});}
}
