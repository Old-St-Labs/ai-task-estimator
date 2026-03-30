"use client";

import { useState, useRef, type KeyboardEvent } from "react";
import type { TeamMember, TeamMemberRole } from "../types";

const ROLE_LABELS: Record<TeamMemberRole, string> = {
  FE: "Frontend",
  BE: "Backend",
  Fullstack: "Fullstack",
};

const ROLE_BADGE_CLASSES: Record<TeamMemberRole, string> = {
  FE: "bg-blue-100 text-blue-700",
  BE: "bg-emerald-100 text-emerald-700",
  Fullstack: "bg-violet-100 text-violet-700",
};

type Props = {
  members: TeamMember[];
  onChange: (members: TeamMember[]) => void;
};

export function TeamMembersInput({ members, onChange }: Props) {
  const [inputValue, setInputValue] = useState("");
  const [selectedRole, setSelectedRole] = useState<TeamMemberRole>("Fullstack");
  const inputRef = useRef<HTMLInputElement>(null);

  function addMember() {
    const name = inputValue.trim();
    if (!name || members.some((m) => m.name === name)) {
      setInputValue("");
      return;
    }
    onChange([...members, { name, role: selectedRole }]);
    setInputValue("");
    inputRef.current?.focus();
  }

  function removeMember(name: string) {
    onChange(members.filter((m) => m.name !== name));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addMember();
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. Alice"
          maxLength={60}
          className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 transition-colors focus:border-violet-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-300"
        />
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value as TeamMemberRole)}
          aria-label="Developer role"
          className="rounded-xl border border-zinc-200 bg-zinc-50 px-2 py-2 text-sm text-zinc-700 transition-colors focus:border-violet-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-300"
        >
          {(Object.keys(ROLE_LABELS) as TeamMemberRole[]).map((r) => (
            <option key={r} value={r}>{ROLE_LABELS[r]}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={addMember}
          className="rounded-xl bg-violet-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700 active:bg-violet-800"
        >
          Add
        </button>
      </div>

      {members.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {members.map((member) => (
            <li
              key={member.name}
              className="flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 py-1 pl-3 pr-1.5 text-sm text-violet-800"
            >
              <span>{member.name}</span>
              <span className={`rounded-full px-1.5 py-0.5 text-xs font-medium ${ROLE_BADGE_CLASSES[member.role]}`}>
                {member.role === "Fullstack" ? "FS" : member.role}
              </span>
              <button
                type="button"
                onClick={() => removeMember(member.name)}
                aria-label={`Remove ${member.name}`}
                className="rounded-full p-0.5 transition-colors hover:bg-violet-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
