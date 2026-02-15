"use client";

import { useState } from "react";
import { REDDIT_POST_TEMPLATES, LINKEDIN_CONTENT_TEMPLATES } from "@/lib/content-templates";
import { Copy, Check, MessageSquare, Linkedin } from "lucide-react";

export default function ContentPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Content Templates</h1>
        <p className="text-sm text-gray-500 mt-1">
          Pre-written content for Reddit and LinkedIn organic growth. Copy, customize, and post.
        </p>
      </div>

      {/* Reddit Templates */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-orange-500" />
          Reddit Posts
        </h2>
        {REDDIT_POST_TEMPLATES.map((template, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                {template.subreddit}
              </span>
              <span className="text-xs text-gray-400">Best time: {template.bestTimeToPost}</span>
            </div>
            <h3 className="font-semibold text-gray-900">{template.title}</h3>
            <pre className="text-sm text-gray-600 whitespace-pre-wrap font-sans leading-relaxed bg-gray-50 rounded-xl p-4 max-h-48 overflow-y-auto">
              {template.body}
            </pre>
            <div className="flex items-center justify-between">
              <p className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                💡 {template.engagementTip}
              </p>
              <button
                onClick={() => handleCopy(`${template.title}\n\n${template.body}`, `reddit-${i}`)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {copied === `reddit-${i}` ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                {copied === `reddit-${i}` ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* LinkedIn Templates */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Linkedin className="w-5 h-5 text-blue-600" />
          LinkedIn Posts
        </h2>
        {LINKEDIN_CONTENT_TEMPLATES.map((template, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full capitalize">
                {template.type.replace("_", " ")}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900">{template.title}</h3>
            <pre className="text-sm text-gray-600 whitespace-pre-wrap font-sans leading-relaxed bg-gray-50 rounded-xl p-4 max-h-48 overflow-y-auto">
              {template.hook}{template.body}
            </pre>
            <div className="flex items-center justify-between">
              <p className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                💡 {template.engagementTip}
              </p>
              <button
                onClick={() => handleCopy(`${template.hook}${template.body}`, `linkedin-${i}`)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {copied === `linkedin-${i}` ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                {copied === `linkedin-${i}` ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
