"use client";

import { useState } from "react";
import { saveGuidanceAnswersAction } from "@/app/assistant/actions";

type Question = {
  id: string;
  question: string;
  improves: string;
  existingAnswer?: string;
};

export function GuidanceQuestionReview({ questions }: { questions: Question[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const allSelected = selected.length === questions.length;

  function toggle(questionId: string) {
    setSelected(current => current.includes(questionId) ? current.filter(item => item !== questionId) : [...current, questionId]);
  }

  return (
    <form action={saveGuidanceAnswersAction} className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold">Questions that could change the decision</h3>
          <p className="mt-1 text-sm text-[#6f757b]">Choose one or several. Atlas will revisit saved answers after 30 days.</p>
        </div>
        <button type="button" onClick={() => setSelected(allSelected ? [] : questions.map(item => item.id))} className="rounded-full border border-[#cfd5d8] bg-white px-4 py-2 text-sm font-semibold text-[#30343a] hover:border-[#87939a]">
          {allSelected ? "Clear all" : "Select all"}
        </button>
      </div>
      <div className="mt-4 space-y-3">
        {questions.map(question => {
          const checked = selected.includes(question.id);
          return (
            <div key={question.id} className={`rounded-2xl border p-4 transition ${checked ? "border-[#3457d5] bg-[#f2f5ff] shadow-sm" : "border-[#e3e5e6] hover:border-[#b9c2c8]"}`}>
              <label className="flex cursor-pointer items-start gap-3">
                <input type="checkbox" name="selectedQuestion" value={question.id} checked={checked} onChange={() => toggle(question.id)} className="mt-1 h-4 w-4 accent-[#3457d5]" />
                <span>
                  <span className="block text-sm font-semibold text-[#30343a]">{question.question}</span>
                  <span className="mt-1 block text-xs text-[#7a8086]">Improves: {question.improves}</span>
                  {question.existingAnswer && !checked && <span className="mt-2 block text-xs font-semibold text-[#55705d]">Answered — select to review or update</span>}
                </span>
              </label>
              <input type="hidden" name={`question:${question.id}`} value={question.question} />
              {checked && <textarea name={`answer:${question.id}`} required rows={3} defaultValue={question.existingAnswer ?? ""} className="mt-4 w-full rounded-xl border border-[#cfd5d8] bg-white px-4 py-3 text-sm text-[#30343a] outline-none focus:border-[#3457d5] focus:ring-2 focus:ring-[#3457d5]/15" placeholder="Record your answer or the evidence you still need…" />}
            </div>
          );
        })}
      </div>
      <button type="submit" disabled={!selected.length} className="mt-5 rounded-xl bg-[#17191c] px-6 py-3 text-sm font-semibold text-white hover:bg-[#2b2e33] disabled:cursor-not-allowed disabled:opacity-40">
        Save {selected.length || "selected"} {selected.length === 1 ? "answer" : "answers"}
      </button>
    </form>
  );
}
