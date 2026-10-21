"use client";
import { useState } from "react";
import { INFORMATION_PAGES } from "./content";
import { useStore } from "@/hooks/useStore";
import Link from "next/link";
export function InformationView({ slug }: { slug: string }) {
  const page = INFORMATION_PAGES[slug];
  const [sent, setSent] = useState(false);
  const { showToast } = useStore();
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 lg:py-24">
      <p className="eyebrow mb-5">J&amp;CO. CUSTOMER CARE</p>
      <h1 className="text-3xl tracking-wide uppercase mb-5">{page.title}</h1>
      <p className="muted mb-12">{page.intro}</p>
      <div className="space-y-2">
        {page.sections.map((section, i) => (
          <details
            key={section.title}
            open={i === 0}
            className="border-b border-[#eae3df] py-5"
          >
            <summary className="text-sm tracking-wide">{section.title}</summary>
            <p className="muted mt-5 max-w-xl">{section.body}</p>
          </details>
        ))}
      </div>
      {slug === "contact" &&
        (sent ? (
          <div className="workspace-panel mt-8">
            <h2 className="text-lg mb-3">Your preview message is saved.</h2>
            <p className="muted">
              This demo does not send email. Your message was saved in this
              browser.
            </p>
            <button
              className="outline-button mt-5"
              onClick={() => setSent(false)}
            >
              Write another message
            </button>
          </div>
        ) : (
          <form
            className="workspace-form mt-10"
            onSubmit={(e) => {
              e.preventDefault();
              try {
                const f = new FormData(e.currentTarget);
                const messages = JSON.parse(
                  localStorage.getItem("jco_contact_messages_v1") || "[]",
                );
                messages.push({
                  ...Object.fromEntries(f),
                  date: new Date().toISOString(),
                });
                localStorage.setItem(
                  "jco_contact_messages_v1",
                  JSON.stringify(messages),
                );
                setSent(true);
              } catch {
                showToast("Unable to save your preview message.");
              }
            }}
          >
            <label>
              Your name
              <input name="name" required />
            </label>
            <label>
              Email address
              <input type="email" name="email" required />
            </label>
            <label>
              Your message
              <textarea name="message" rows={5} required />
            </label>
            <p className="muted">Preview form · Messages are saved locally.</p>
            <button className="rose-button">Save message</button>
          </form>
        ))}
      <Link href="/collections/shop-all" className="outline-button mt-12">
        Back to shopping
      </Link>
    </main>
  );
}
