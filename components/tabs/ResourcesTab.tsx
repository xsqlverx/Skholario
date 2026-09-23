"use client";

import React, { useState } from "react";
import { useStudyHub } from "@/lib/store";
import { ResourceItem } from "@/lib/types";
import { FolderDown, Search, ThumbsUp, Tag, Plus, FileText, Download, X, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export function ResourcesTab() {
  const { resources, courses, upvoteResource, addResource } = useStudyHub();
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [formCourse, setFormCourse] = useState(courses[0]?.id || "cs301");
  const [formType, setFormType] = useState<ResourceItem["type"]>("notes");
  const [tagsInput, setTagsInput] = useState("");

  const filtered = resources.filter((item) => {
    const matchesType = filterType === "all" || item.type === filterType;
    const matchesCourse = selectedCourse === "all" || item.courseId === selectedCourse;
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchesType && matchesCourse && matchesSearch;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    const courseObj = courses.find((c) => c.id === formCourse);
    addResource({
      courseId: formCourse,
      courseCode: courseObj?.code || "CS 301",
      title,
      description,
      type: formType,
      author: "Alex Rivera (You)",
      uploadDate: new Date().toISOString().split("T")[0],
      tags: tagsInput ? tagsInput.split(",").map((s) => s.trim()) : ["Shared"],
      fileSize: "1.5 MB",
    });
    setTitle("");
    setDescription("");
    setTagsInput("");
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Upload CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Resource Vault & Past Papers</h1>
          <p className="text-xs text-slate-400 mt-1">
            Community-driven study materials, handwritten summaries, and solved exam papers.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Upload Notes</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes, solved exams, formulas..."
            className="w-full rounded-xl border border-slate-800 bg-slate-900/80 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {["all", "cheatsheet", "past_paper", "notes"].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={cn(
                "rounded-xl px-3 py-2 text-xs font-semibold capitalize transition-all cursor-pointer",
                filterType === t
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              )}
            >
              {t === "all" ? "All Formats" : t.replace("_", " ")}
            </button>
          ))}

          {/* Subject Dropdown */}
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="all">All Subjects</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-sm hover:border-slate-700 transition-all shadow-lg"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <span className="rounded-lg bg-indigo-500/10 px-2 py-0.5 text-xs font-bold text-indigo-400 border border-indigo-500/20">
                  {item.courseCode}
                </span>

                <span className="rounded-lg bg-slate-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  {item.type.replace("_", " ")}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug">{item.title}</h3>
              <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">{item.description}</p>

              {/* Tag Pills */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {item.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 rounded bg-slate-800/80 px-2 py-0.5 text-[10px] text-slate-400"
                  >
                    <Tag className="h-2.5 w-2.5" />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer info & upvote */}
            <div className="mt-5 flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs text-slate-400">
              <div>
                <span className="text-slate-300 font-medium">By {item.author}</span>
                <span className="mx-2">•</span>
                <span>{item.fileSize || "1.2 MB"}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => upvoteResource(item.id)}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-slate-300 hover:border-indigo-500 hover:text-indigo-400 transition-all cursor-pointer"
                >
                  <ThumbsUp className="h-3 w-3" />
                  <span className="font-bold">{item.upvotes}</span>
                </button>

                <button
                  onClick={() => alert(`Downloading: ${item.title}`)}
                  className="flex items-center gap-1 rounded-lg bg-indigo-600/20 px-2.5 py-1 text-indigo-300 hover:bg-indigo-600/30 border border-indigo-500/30 transition-all cursor-pointer"
                >
                  <Download className="h-3 w-3" />
                  <span>Get</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <form
            onSubmit={handleCreate}
            className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Share Notes or Past Papers</h3>
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
                <label className="text-xs font-semibold text-slate-300">Document Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Midterm 2024 Solved Questions & Proofs"
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
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Format</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as ResourceItem["type"])}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="notes">Lecture Notes</option>
                    <option value="past_paper">Past Paper</option>
                    <option value="cheatsheet">Cheatsheet</option>
                    <option value="slides">Slides</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Description / Key Topics</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly describe what chapters or concepts this document covers..."
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="e.g. Graph, Dijkstra, Trees"
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 transition-all cursor-pointer"
              >
                Upload to Vault
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
