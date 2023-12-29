"use client";

export default function Err(error: any) {
  console.log("error", error);
  return (
    <div className="grid grid-cols-1 gap-2">
      <div className="grid md:grid-cols-4 gap-2">
        Error: This page is not working. Please visit it later.
      </div>
    </div>
  );
}
