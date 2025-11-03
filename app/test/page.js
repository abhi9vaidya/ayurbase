'use client';

import axios from "axios";

export default function TestPage() {
    function handleClick() {
        console.log("Button clicked!");
        axios.get("/api/test")
            .then(response => {
                console.log("API Response:", response.data);
            })
            .catch(error => {
                console.error("API Error:", error);
            });
    }
        
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black sm:items-start">
        <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
          This is the test page.
          <button className="mt-4 rounded bg-blue-500 px-4 py-2 text-white" onClick={handleClick}>
            Click Me
          </button>
        </h1>
      </main>
    </div>
  );
}