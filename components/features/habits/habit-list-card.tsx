"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MoreVertical, Edit, Pause, Play, Trash2, ChevronDown } from "lucide-react";
import { getFrequencyText } from "@/lib/utils/habits";
import type { Habit } from "@/types";

interface HabitListCardProps {
  habit: Habit;
  onEdit: (habit: Habit) => void;
  onToggleActive: (habitId: string, isActive: boolean) => void;
  onDelete: (habitId: string) => void;
}

export function HabitListCard({
  habit,
  onEdit,
  onToggleActive,
  onDelete,
}: HabitListCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
    orange: { bg: "bg-[#FF6600]/20", text: "text-[#FF6600]", border: "border-[#FF6600]/20" },
    "orange-light": { bg: "bg-[#FF9933]/20", text: "text-[#FF9933]", border: "border-[#FF9933]/20" },
    yellow: { bg: "bg-[#FFCC00]/20", text: "text-[#FFCC00]", border: "border-[#FFCC00]/20" },
    pink: { bg: "bg-[#FF66B2]/20", text: "text-[#FF66B2]", border: "border-[#FF66B2]/20" },
    green: { bg: "bg-[#33CC33]/20", text: "text-[#33CC33]", border: "border-[#33CC33]/20" },
    blue: { bg: "bg-[#3399FF]/20", text: "text-[#3399FF]", border: "border-[#3399FF]/20" },
    red: { bg: "bg-[#FF3333]/20", text: "text-[#FF3333]", border: "border-[#FF3333]/20" },
  };

  // Check if color is a custom hex code
  const isCustomColor = habit.color.startsWith("#");
  const customColor = habit.color;
  const colors = isCustomColor ? {
    bg: "bg-transparent",
    text: "text-transparent",
    border: "border-transparent",
  } : (colorClasses[habit.color] || colorClasses.orange);

  // Custom color styles
  const customColorStyles = isCustomColor ? {
    backgroundColor: `${customColor}20`, // 20% opacity
    color: customColor,
    borderColor: `${customColor}20`,
  } : {};

  const handlePauseToggle = () => {
    onToggleActive(habit.id, !habit.isActive);
    setShowMenu(false);
  };

  const handleEdit = () => {
    onEdit(habit);
    setShowMenu(false);
  };

  const handleDelete = () => {
    if (showConfirm) {
      onDelete(habit.id);
      setShowConfirm(false);
      setShowMenu(false);
    } else {
      setShowConfirm(true);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.2 }}
      className={`
        surface p-4 relative
        ${!habit.isActive ? "opacity-60" : ""}
        ${showMenu ? "z-50" : ""}
      `}
    >
      {/* Left accent bar */}
      {isCustomColor ? (
        <div
          className="absolute left-0 top-0 bottom-0 w-1"
          style={{ backgroundColor: customColor }}
        />
      ) : (
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${colors.bg.replace('/20', '')}`} />
      )}

      <div className="flex items-start gap-4 pl-3">
        {/* Icon */}
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${colors.bg}`}
          style={customColorStyles}
        >
          {habit.icon}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3
              className={`font-semibold ${colors.text}`}
              style={isCustomColor ? { color: customColor } : undefined}
            >
              {habit.name}
            </h3>
            {!habit.isActive && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[var(--color-muted)] text-[var(--color-muted-foreground)]">
                Paused
              </span>
            )}
          </div>

          {habit.description && (
            <span className="text-xs text-muted-foreground line-clamp-2 mb-2">
              {habit.description}
            </span>
          )}

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{getFrequencyText(habit)}</span>
            <span className="w-1 h-1 rounded-full bg-[var(--color-muted-foreground)]/30" />
            <span>
              {habit.isActive ? "Active" : "Paused"}
            </span>
          </div>
        </div>

        {/* Menu Button */}
        <div className="relative z-50">
          <motion.button
            onClick={() => setShowMenu(!showMenu)}
            className="icon-btn"
            whileTap={{ scale: 0.95 }}
          >
            <MoreVertical className="w-4 h-4" />
          </motion.button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {showMenu && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-[60]"
                  onClick={() => {
                    setShowMenu(false);
                    setShowConfirm(false);
                  }}
                />

                {/* Menu */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full z-[70] mt-2 w-48 surface shadow-xl overflow-hidden"
                >
                  {!showConfirm ? (
                    <>
                      {/* Edit */}
                      <button
                        onClick={handleEdit}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-[var(--color-muted)] transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>

                      {/* Pause/Resume */}
                      <button
                        onClick={handlePauseToggle}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-[var(--color-muted)] transition-colors"
                      >
                        {habit.isActive ? (
                          <>
                            <Pause className="w-4 h-4" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4" />
                            Resume
                          </>
                        )}
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => setShowConfirm(true)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </>
                  ) : (
                    <div className="p-3">
                      <p className="text-sm font-medium mb-3 px-1">
                        Delete this habit?
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setShowConfirm(false);
                            setShowMenu(false);
                          }}
                          className="flex-1 px-3 py-2 rounded-lg text-sm bg-[var(--color-muted)] hover:bg-[var(--color-muted)]/80 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleDelete}
                          className="flex-1 px-3 py-2 rounded-lg text-sm bg-red-500 text-white hover:bg-red-600 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
