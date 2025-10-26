import { UserButton } from "@clerk/clerk-react";
import { Code, Moon, Sun } from "lucide-react";
import React from "react";

export default function Navbar({ handleTheme, dark }) {
  return (
    <div className="w-full bg-base-300">
      <div className="flex items-center justify-between px-4 h-16">
        {/* Left side: Logo */}
        <div className="flex items-center gap-2">
          <Code className="w-8 h-8" />
          <h1 className="text-3xl font-bold">SyncPad</h1>
        </div>

        {/* Right side: Menu */}
        <ul className="flex items-center gap-4">
          <li>
            <button onClick={handleTheme}>
              {dark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </button>
          </li>
          <li>
            <UserButton />
          </li>
        </ul>
      </div>
    </div>
  );
}
