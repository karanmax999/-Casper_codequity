import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Basic validation
    if (!data.fullName || !data.email || !data.company) {
      return NextResponse.json(
        { error: "Full Name, Email, and Company are required." },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Insert into investors table
    const { error } = await supabase.from("investors").insert([
      {
        name: data.fullName,
        email: data.email,
        firm: data.company,
        job_title: data.jobTitle || null,
        website: data.website || null,
        linkedin: data.linkedin || null,
        aum: data.aum || null,
        check_size: data.checkSize || null,
        focus: data.focus || null,
        notes: data.notes || null,
        user_id: user ? user.id : null,
        approved: false
      },
    ]);

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "Failed to register investor. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Registration API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
