"use client";

import React, { useState } from "react";
import { useStudyHub } from "@/lib/store";
import { MessageSquare, ThumbsUp, Pin, Plus, Search, Tag, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function DiscussionTab() {
  const { posts, upvotePost, addPost, courses } = useStudyHub();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Form states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [formCourse, setFormCourse] = useState("CS 340");
  const [tagsInput, setTagsInput] = useState("");

  const filtered = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.content.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    addPost({
      courseCode: formCourse,
      title,
      content,
      author: "Alex Rivera (You)",
      authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&crop=face",
      tags: tagsInput ? tagsInput.split(",").map((s) => s.trim()) : ["General"],
    });
    setTitle("");
    setContent("");
    setTagsInput("");
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Peer Forum & Study Groups</h1>
          <p className="text-xs text-slate-400 mt-1">
            Connect with classmates, solve tricky homework doubts, and coordinate study sprints.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Discussion</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search discussions, questions, study sessions..."
          className="w-full rounded-xl border border-slate-800 bg-slate-900/80 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {filtered.map((post) => (
          <div
            key={post.id}
            className={cn(
              "rounded-2xl border p-5 backdrop-blur-sm transition-all shadow-md",
              post.isPinned
                ? "border-indigo-500/40 bg-gradient-to-r from-indigo-950/20 via-slate-900 to-slate-900"
                : "border-slate-800 bg-slate-900/70 hover:border-slate-700"
            )}
          >
            {/* Header info */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <img
                  src={post.authorAvatar}
                  alt={post.author}
                  className="h-9 w-9 rounded-full object-cover ring-2 ring-slate-800"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{post.author}</span>
                    {post.courseCode && (
                      <span className="rounded bg-indigo-500/15 px-1.5 py-0.5 text-[10px] font-bold text-indigo-400 border border-indigo-500/20">
                        {post.courseCode}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">{post.timestamp}</span>
                </div>
              </div>

              {post.isPinned && (
                <span className="flex items-center gap-1 rounded-full bg-indigo-500/10 px-2.5 py-1 text-[11px] font-bold text-indigo-400 border border-indigo-500/20">
                  <Pin className="h-3 w-3 fill-indigo-400" />
                  <span>Pinned Session</span>
                </span>
              )}
            </div>

            {/* Post Title & Content */}
            <h3 className="text-sm font-bold text-white mb-2">{post.title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{post.content}</p>

            {/* Tags & Actions */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80 pt-3 text-xs text-slate-400">
              <div className="flex flex-wrap gap-1.5">
                {post.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 rounded bg-slate-800/80 px-2 py-0.5 text-[10px] text-slate-400"
                  >
                    <Tag className="h-2.5 w-2.5" />
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => upvotePost(post.id)}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-slate-300 hover:border-indigo-500 hover:text-indigo-400 transition-all cursor-pointer"
                >
                  <ThumbsUp className="h-3 w-3" />
                  <span className="font-bold">{post.upvotes}</span>
                </button>

                <div className="flex items-center gap-1 text-slate-400">
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>{post.repliesCount} replies</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Post Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <form
            onSubmit={handleCreate}
            className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Start New Discussion</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-300">Topic / Question Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Help understanding Peterson's Algorithm critical section"
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Subject</label>
                  <select
                    value={formCourse}
                    onChange={(e) => setFormCourse(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="General">General / All</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.code}>
                        {c.code}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="e.g. Midterm, Doubt"
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Details / Description</label>
                <textarea
                  rows={4}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Explain the problem or announce study meetups..."
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 transition-all cursor-pointer"
              >
                Post Discussion
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
