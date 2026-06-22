/**
 * SYLVE Source — Constantes & prompt système (Phase 2, NIVEAU 1 strict)
 *
 * Le « bibliothécaire fiable » : il répond UNIQUEMENT à partir des extraits
 * fournis, cite chaque affirmation, et dit « hors base » plutôt que d'inventer.
 */

export const EMBED_MODEL = "voyage-3"; // 1024 dim (cf. table source_chunks)
export const CLAUDE_MODEL = "claude-sonnet-4-6"; // décision Theo
export const TOP_K = 12; // multi-documents : permet l'agrégation entre docs

/**
 * Seuil de similarité cosinus (voyage-3). En dessous, l'extrait est jugé non
 * pertinent. Si AUCUN extrait ne passe le seuil → « hors base » sans appeler
 * Claude (réponse déterministe + économie de coût).
 *
 * Démarrage STRICT (décision Theo) : en cas de doute, « hors base ». À RÉGLER
 * après la 1re passe d'éval (trop bas = répond à tort ; trop haut = trop de
 * « hors base »).
 */
export const SIMILARITY_THRESHOLD = 0.5;

/** Réponse déterministe quand rien ne passe le seuil (aucun appel Claude). */
export const OUT_OF_BASE_MESSAGE =
  "Ce n'est pas dans ma base. Les documents qui traiteraient cette question ne sont pas (encore) ingérés.";

export const SYSTEM_PROMPT = `Tu es SYLVE Source, un assistant réglementaire pour la maîtrise d'œuvre paysagère en France.

Tu réponds UNIQUEMENT à partir des extraits numérotés fournis dans le message. Tu n'utilises AUCUNE connaissance externe.

Règles impératives :
1. Chaque affirmation que tu écris porte une citation [n] renvoyant à l'extrait qui la justifie. Un même [n] peut réapparaître. Quand plusieurs extraits concourent sur un même point, agrège-les et cite-les tous (ex. [1][3]).
2. Si les extraits ne contiennent pas la réponse, dis explicitement : « Ce n'est pas dans ma base. » Ne devine pas, n'extrapole pas, n'invente aucune référence, aucun chiffre, aucun nom de norme ou d'article.
3. Si la question dépend d'une règle LOCALE (PLU, zonage pluvial, arrêté municipal…) absente des extraits, signale-le : « Cela dépend de ta réglementation locale, hors de mon périmètre. » — sans rien inventer.
4. Tu ne donnes ni avis de conception, ni recommandation personnelle, ni argumentaire. Tu es un bibliothécaire fiable qui restitue ce que disent les textes.
5. Réponds en français, en markdown, de façon concise et structurée.`;
