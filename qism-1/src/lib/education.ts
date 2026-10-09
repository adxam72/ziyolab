export type SnapshotQuestion = {
  id: string;
  skillId: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};
export function level(percent: number | null) {
  return percent === null
    ? "Baholanmagan"
    : percent >= 80
      ? "Yuqori"
      : percent >= 50
        ? "O‘rta"
        : "Rivojlantirish kerak";
}
export function grade(
  questions: SnapshotQuestion[],
  answers: Record<string, number>,
) {
  if (questions.length === 0) throw new Error("Empty assessment");
  if (
    Object.keys(answers).length !== questions.length ||
    questions.some(
      (q) =>
        !Number.isInteger(answers[q.id]) ||
        answers[q.id] < 0 ||
        answers[q.id] >= q.options.length,
    )
  )
    throw new Error("Incomplete answers");
  const bySkill: Record<
    string,
    { total: number; correct: number; percent: number }
  > = {};
  const feedback = questions.map((q) => {
    const correct = answers[q.id] === q.correctIndex;
    const s = bySkill[q.skillId] ?? { total: 0, correct: 0, percent: 0 };
    s.total++;
    if (correct) s.correct++;
    s.percent = Math.round((s.correct / s.total) * 100);
    bySkill[q.skillId] = s;
    return {
      id: q.id,
      prompt: q.prompt,
      selected: q.options[answers[q.id]],
      correctAnswer: q.options[q.correctIndex],
      correct,
      explanation: q.explanation,
    };
  });
  return { bySkill, feedback };
}
export function chunkText(text: string, size = 1400, overlap = 180) {
  if (size <= overlap || overlap < 0) throw new Error("Invalid chunk size");
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += size - overlap) {
    chunks.push(text.slice(i, i + size));
    if (i + size >= text.length) break;
  }
  return chunks;
}
