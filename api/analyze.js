const profile = require("./profile")

const SYSTEM_PROMPT = `You are an expert technical recruiter and career coach
specializing in Android/mobile engineering roles in the Indian job market.
You analyze job descriptions against candidate profiles and give precise,
actionable feedback. Always return valid JSON, nothing else.`

function buildPrompt(jd, selectedCv) {
  const cvDesc = profile.cvVariants[selectedCv] || Object.values(profile.cvVariants)[0]

  return `Analyze how well this candidate fits the job description below.

CANDIDATE PROFILE:
Name: ${profile.name}
Title: ${profile.title}
Experience: ${profile.experienceYears} year(s)
Strong skills: ${profile.skills.strong.join(", ")}
Moderate skills: ${profile.skills.moderate.join(", ")}
Learning: ${profile.skills.learning.join(", ") || "none listed"}
Selected CV variant: "${selectedCv}"
CV focus: ${cvDesc}
Additional context: ${profile.notes}

JOB DESCRIPTION:
${jd}

Return ONLY a JSON object with this exact structure:
{
  "match_score": <0-100 integer>,
  "verdict": "Strong Match" | "Good Match" | "Partial Match" | "Weak Match",
  "verdict_reason": "<one sentence summary>",
  "matching_skills": ["<skill from JD that candidate has>", ...],
  "missing_skills": ["<skill from JD that candidate lacks>", ...],
  "recommended_cv": "<exact cv variant name that fits best>",
  "cv_reason": "<why this cv variant is better for this role>",
  "highlight_points": ["<thing to emphasise in application/interview>", ...],
  "red_flags": ["<potential concern the recruiter might raise>", ...],
  "referral_talking_points": ["<specific point to mention when asking someone for a referral>", ...],
  "interview_likely_topics": ["<technical topic likely to come up in interview>", ...]
}`
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  if (req.method === "OPTIONS") {
    return res.status(200).end()
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { jd, selectedCv } = req.body

  if (!jd || jd.trim().length < 50) {
    return res.status(400).json({ error: "JD is too short — paste the full job description." })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured on server." })
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key":         process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type":      "application/json",
      },
      body: JSON.stringify({
        model:      "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system:     SYSTEM_PROMPT,
        messages:   [{ role: "user", content: buildPrompt(jd, selectedCv) }],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error("Anthropic API error:", err)
      return res.status(502).json({ error: "Claude API request failed." })
    }

    const data  = await response.json()
    const raw   = data.content?.[0]?.text?.trim() || ""
    const clean = raw.replace(/```json/g, "").replace(/```/g, "").trim()

    let parsed
    try {
      parsed = JSON.parse(clean)
    } catch {
      console.error("Failed to parse Claude output:", raw)
      return res.status(502).json({ error: "Could not parse Claude response." })
    }

    return res.status(200).json(parsed)

  } catch (err) {
    console.error("Handler error:", err)
    return res.status(500).json({ error: "Internal server error." })
  }
}
