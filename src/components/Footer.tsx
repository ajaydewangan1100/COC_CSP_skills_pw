import React from "react";

export default function Footer() {
  return (
    <footer className="bg-surface text-center py-6 px-5 text-sm text-text-secondary mt-10 border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.4)] relative z-10">
      <div className="text-2xl font-extrabold text-text mb-2 flex items-center justify-center">
        PW<span className="text-primary">Skills</span>
      </div>
      <p>
        © {new Date().getFullYear()}{" "}
        <a href="https://pwskills.com" className="text-primary font-semibold mx-1 no-underline">
          PW Skills
        </a>
        . All rights reserved.
      </p>
    </footer>
  );
}
