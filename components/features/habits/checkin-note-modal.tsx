"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { Habit } from "@/types";

interface CheckinNoteModalProps {
  habit: Habit;
  isOpen: boolean;
  onClose: () => void;
  onQuickComplete: () => void;
  onCompleteWithNote: (note: string) => void;
}

export function CheckinNoteModal({
  habit,
  isOpen,
  onClose,
  onQuickComplete,
  onCompleteWithNote,
}: CheckinNoteModalProps) {
  const [note, setNote] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);

  if (!isOpen) return null;

  const handleQuickComplete = () => {
    onQuickComplete();
    handleClose();
  };

  const handleCompleteWithNote = () => {
    if (note.trim()) {
      onCompleteWithNote(note.trim());
      handleClose();
    }
  };

  const handleClose = () => {
    setNote("");
    setShowNoteInput(false);
    onClose();
  };

  const handleAddNoteClick = () => {
    setShowNoteInput(true);
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 z-10">
        <div className="surface p-6 max-w-md mx-auto shadow-xl">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-muted)] flex items-center justify-center text-2xl">
                {habit.icon}
              </div>
              <div>
                <h2 className="text-lg font-semibold">{habit.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {habit.description || "Check in your habit"}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="icon-btn"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!showNoteInput ? (
            <>
              {/* Initial Options */}
              <div className="space-y-3 mt-6">
                <button
                  onClick={handleQuickComplete}
                  className="w-full py-3 rounded-xl bg-[var(--color-brand)] text-white font-semibold hover:brightness-95 active:scale-[0.98] transition-all"
                >
                  Quick Complete
                </button>
                <button
                  onClick={handleAddNoteClick}
                  className="w-full py-3 rounded-xl bg-[var(--color-muted)] hover:bg-[var(--color-muted)]/80 font-semibold transition-all"
                >
                  Add Note
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Note Input */}
              <div className="mt-4">
                <label className="text-sm font-medium mb-2 block">
                  Add a note (optional)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="How did it go? Any thoughts or reflections..."
                  className="w-full input resize-none"
                  rows={4}
                  maxLength={500}
                  autoFocus
                />
                <p className="text-xs text-muted-foreground text-right mt-1">
                  {note.length}/500
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowNoteInput(false)}
                  className="flex-1 py-3 rounded-xl bg-[var(--color-muted)] hover:bg-[var(--color-muted)]/80 font-semibold transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleCompleteWithNote}
                  disabled={!note.trim()}
                  className="flex-1 py-3 rounded-xl bg-[var(--color-brand)] text-white font-semibold hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
                >
                  Complete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
