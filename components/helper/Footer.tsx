import React from "react";

export const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-[#ffe8ba] py-6 text-center z-10">
      <p className="text-[#606c38] font-semibold">
        Web ini dibuat oleh{" "}
        <span className="text-[#bc6c25]">AmbaToBuy - Tim 9</span>
      </p>
      <a
        href="https://www.instagram.com/danny_env/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#e09f3e] hover:underline font-bold"
      >
        @danny_env & Teams
      </a>
    </footer>
  );
};
