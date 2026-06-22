/**
 * SYLVE Source — Route serveur /api/source/ask (Phase 2)
 *
 * POST { question } -> { answer, out_of_base, sources[] }
 *
 * Gate PERSO (mono-utilisateur) : en plus du login, vérifie SERVER-SIDE que
 * la session Supabase correspond au SEUL compte fondateur (FOUNDER_USER_ID).
 * Sinon 401. Aucun secret exposé : tout reste server-side.
 */

import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { runSourcePipeline } from "@/lib/source/pipeline";

export async function POST(request: Request) {
  // --- Gate fondateur (session SSR via cookies) ------------------------------
  const ssr = await createClient();
  const {
    data: { user },
  } = await ssr.auth.getUser();

  if (!user || user.id !== process.env.FOUNDER_USER_ID) {
    return NextResponse.json({ error: "Accès réservé." }, { status: 401 });
  }

  // --- Question --------------------------------------------------------------
  let question: string;
  try {
    const body = await request.json();
    question = typeof body?.question === "string" ? body.question.trim() : "";
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }
  if (!question) {
    return NextResponse.json({ error: "Question vide." }, { status: 400 });
  }

  // --- Pipeline (client service-role : RLS sans policy = service-role only) --
  try {
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

    const result = await runSourcePipeline(question, { supabase, anthropic });
    return NextResponse.json(result);
  } catch (e) {
    console.error("[source/ask]", e);
    return NextResponse.json(
      { error: "Erreur serveur lors du traitement." },
      { status: 500 }
    );
  }
}
