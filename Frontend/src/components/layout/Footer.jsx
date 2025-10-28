import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 text-center p-3">
      <p>
        Made with ❤️ by <span className="text-blue-400 font-semibold">Priyanshu Soni</span> &nbsp;| &nbsp;
        © {new Date().getFullYear()} QuoteVerse
      </p>
    </footer>
  );
}
