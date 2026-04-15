import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const image = await db.image.findUnique({
      where: { slug }
    });

    if (!image) {
      return new NextResponse("Image not found", { status: 404 });
    }

    // You can either redirect to Supabase Storage or proxy the image
    // For SEO and simplicity, we can redirect or serve the URL
    // A redirect is simpler and leverages Supabase CDN
    return NextResponse.redirect(image.url);
    
    /* 
    // If you want to proxy it (stay on same domain):
    const response = await fetch(image.url);
    const blob = await response.blob();
    return new NextResponse(blob, {
      headers: {
        "Content-Type": image.mimeType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
    */
  } catch (error) {
    console.error("Error serving image:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
