import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const { action, name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    if (action === "signup") {
      const { data: existing } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .single();

      if (existing) {
        return NextResponse.json({ error: "Account already exists. Please sign in." }, { status: 409 });
      }

      const { data: newUser, error } = await supabase
        .from("users")
        .insert({
          name: name || email.split("@")[0],
          email,
          password_hash: hashPassword(password),
          credits: 5,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
      }

      return NextResponse.json({
        user: { id: newUser.id, name: newUser.name, email: newUser.email, credits: newUser.credits },
      });
    }

    if (action === "signin") {
      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .eq("password_hash", hashPassword(password))
        .single();

      if (error || !user) {
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
      }

      return NextResponse.json({
        user: { id: user.id, name: user.name, email: user.email, credits: user.credits },
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
