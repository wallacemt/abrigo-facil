import { supabase, SUPABASE_AVATAR_BUCKET } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Arquivo não enviado" },
        { status: 400 }
      );
    }


    const fileExtension =
      file.name.split(".").pop()?.toLowerCase() || "jpg";

    const filePath = `/avatars/${Date.now()}-${crypto.randomUUID()}.${fileExtension}`;

    const { error: uploadError } = await supabase.storage
      .from(process.env.SUPABASE_AVATAR_BUCKET!)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from(process.env.SUPABASE_AVATAR_BUCKET!)
      .getPublicUrl(filePath);

    return NextResponse.json({
      data: {
        url: data.publicUrl,
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Erro ao fazer upload" },
      { status: 500 }
    );
  }
}