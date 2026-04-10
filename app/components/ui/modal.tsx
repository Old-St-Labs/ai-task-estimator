// app/components/ui/modal.tsx
"use client";

import { useState } from "react";

interface ModalProps {
  title: string;
  trigger: React.ReactNode;
  children: React.ReactNode;
}

export function Modal({ title, trigger, children }: ModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <span onClick={() => setIsOpen(true)} className="cursor-pointer">
        {trigger}
      </span>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div onClick={(e) => e.stopPropagation()}>
              {children}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
