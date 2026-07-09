"use client";

import { useCallback, useEffect, useState } from "react";
import type { PAYMENT_STATUSES } from "@/lib/validators";

type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

type Registration = {
  id: string;
  full_name: string;
  phone: string;
  whatsapp: string;
  email: string;
  city_country: string;
  player_role: string;
  batting_style: string;
  bowling_style: string;
  payment_method: string;
  utr_transaction_id: string;
  payment_sender_name: string;
  payment_proof_path: string | null;
  payment_proof_url: string | null;
  payment_status: PaymentStatus;
  created_at: string;
  updated_at: string;
};

const STATUS_STYLES: Record<PaymentStatus, string> = {
  pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  verified: "bg-emerald-glow/15 text-emerald-glow border-emerald-glow/30",
  rejected: "bg-red-500/15 text-red-400 border-red-500/30",
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | PaymentStatus>(
    "all"
  );
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [listError, setListError] = useState("");

  const fetchRegistrations = useCallback(async (pwd: string) => {
    setLoading(true);
    setListError("");
    try {
      const response = await fetch("/api/admin/registrations", {
        headers: { "x-admin-password": pwd },
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        if (response.status === 401) {
          setAuthed(false);
          setLoginError("Incorrect admin password.");
        } else {
          setListError(result.message || "Could not load registrations.");
        }
        return;
      }

      setRegistrations(result.registrations || []);
      setAuthed(true);
    } catch {
      setListError("Network error while loading registrations.");
    } finally {
      setLoading(false);
    }
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    await fetchRegistrations(password);
  }

  async function updateStatus(id: string, status: PaymentStatus) {
    setUpdatingId(id);
    try {
      const response = await fetch(`/api/admin/registrations/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({ payment_status: status }),
      });
      const result = await response.json();

      if (response.ok && result.success) {
        setRegistrations((prev) =>
          prev.map((r) => (r.id === id ? { ...r, payment_status: status } : r))
        );
      } else {
        alert(result.message || "Could not update status.");
      }
    } catch {
      alert("Network error while updating status.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function exportCsv() {
    try {
      const response = await fetch("/api/admin/export", {
        headers: { "x-admin-password": password },
      });
      if (!response.ok) {
        alert("Could not export CSV.");
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `smpl-t20-registrations-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Network error while exporting CSV.");
    }
  }

  useEffect(() => {
    // No-op on mount: require explicit login each session for security.
  }, []);

  const filtered = registrations.filter((r) => {
    const matchesStatus =
      statusFilter === "all" || r.payment_status === statusFilter;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      r.full_name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.phone.toLowerCase().includes(q) ||
      r.utr_transaction_id.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const counts = registrations.reduce(
    (acc, r) => {
      acc[r.payment_status] = (acc[r.payment_status] || 0) + 1;
      return acc;
    },
    { pending: 0, verified: 0, rejected: 0 } as Record<PaymentStatus, number>
  );

  if (!authed) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <form
          onSubmit={handleLogin}
          className="card w-full max-w-sm p-8 space-y-4"
        >
          <h1 className="text-xl font-semibold text-gray-50 text-center mb-1">
            Admin Login
          </h1>
          <p className="text-xs text-gray-400 text-center mb-4">
            SMPL T20 Kenya Tour Registration
          </p>
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">
              Admin Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg bg-pitch-900 border border-gold-700/30 px-4 py-3 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-gold-500/60"
              placeholder="Enter admin password"
            />
          </div>
          {loginError && (
            <p className="text-sm text-red-400">{loginError}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-gold-600 to-gold-500 px-6 py-3 text-sm font-semibold text-pitch-950 hover:from-gold-500 hover:to-gold-400 disabled:opacity-60"
          >
            {loading ? "Checking..." : "Login"}
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-50">
              Registrations Admin Panel
            </h1>
            <p className="text-sm text-gray-400">
              {registrations.length} total registrations
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => fetchRegistrations(password)}
              className="rounded-lg border border-gold-700/40 px-4 py-2 text-sm text-gray-200 hover:bg-gold-600/10 transition"
            >
              Refresh
            </button>
            <button
              onClick={exportCsv}
              className="rounded-lg bg-gradient-to-r from-gold-600 to-gold-500 px-4 py-2 text-sm font-semibold text-pitch-950 hover:from-gold-500 hover:to-gold-400 transition"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Status summary */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="card p-4 text-center">
            <p className="text-xs text-gray-400">Pending</p>
            <p className="text-xl font-bold text-yellow-400">
              {counts.pending}
            </p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-xs text-gray-400">Verified</p>
            <p className="text-xl font-bold text-emerald-glow">
              {counts.verified}
            </p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-xs text-gray-400">Rejected</p>
            <p className="text-xl font-bold text-red-400">
              {counts.rejected}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Search by name, email, phone, or UTR..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-lg bg-pitch-900 border border-gold-700/30 px-4 py-2.5 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-gold-500/60"
          />
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "all" | PaymentStatus)
            }
            className="rounded-lg bg-pitch-900 border border-gold-700/30 px-4 py-2.5 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-gold-500/60"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {listError && (
          <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {listError}
          </div>
        )}

        {/* Table (desktop) */}
        <div className="hidden lg:block card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gold-700/20 text-left text-gray-400">
                <th className="px-4 py-3 font-medium">Player</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Role / Style</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Proof</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Registered</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-gold-700/10 align-top hover:bg-pitch-800/40"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-100">{r.full_name}</p>
                    <p className="text-xs text-gray-500">{r.city_country}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    <p>{r.phone}</p>
                    <p className="text-xs text-gray-500">WA: {r.whatsapp}</p>
                    <p className="text-xs text-gray-500">{r.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    <p>{r.player_role}</p>
                    <p className="text-xs text-gray-500">{r.batting_style}</p>
                    <p className="text-xs text-gray-500">{r.bowling_style}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    <p>{r.payment_method}</p>
                    <p className="text-xs text-gray-500">
                      UTR: {r.utr_transaction_id}
                    </p>
                    <p className="text-xs text-gray-500">
                      By: {r.payment_sender_name}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    {r.payment_proof_url ? (
                      <a
                        href={r.payment_proof_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-gold-400 underline underline-offset-2 hover:text-gold-300"
                      >
                        View Proof
                      </a>
                    ) : (
                      <span className="text-xs text-gray-500">N/A</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${STATUS_STYLES[r.payment_status]}`}
                    >
                      {r.payment_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {new Date(r.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex gap-1.5">
                        <StatusButton
                          label="Pending"
                          active={r.payment_status === "pending"}
                          disabled={updatingId === r.id}
                          onClick={() => updateStatus(r.id, "pending")}
                        />
                        <StatusButton
                          label="Verify"
                          active={r.payment_status === "verified"}
                          disabled={updatingId === r.id}
                          onClick={() => updateStatus(r.id, "verified")}
                          variant="verified"
                        />
                        <StatusButton
                          label="Reject"
                          active={r.payment_status === "rejected"}
                          disabled={updatingId === r.id}
                          onClick={() => updateStatus(r.id, "rejected")}
                          variant="rejected"
                        />
                      </div>
                      {r.payment_status === "verified" && (
                        <a
                          href={buildWhatsAppLink(r)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-emerald-glow underline underline-offset-2 hover:text-emerald-glow/80"
                        >
                          WhatsApp confirmation
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && !loading && (
            <p className="p-8 text-center text-sm text-gray-500">
              No registrations match your filters.
            </p>
          )}
        </div>

        {/* Cards (mobile) */}
        <div className="lg:hidden space-y-4">
          {filtered.map((r) => (
            <div key={r.id} className="card p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium text-gray-100">{r.full_name}</p>
                  <p className="text-xs text-gray-500">{r.city_country}</p>
                </div>
                <span
                  className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${STATUS_STYLES[r.payment_status]}`}
                >
                  {r.payment_status}
                </span>
              </div>
              <dl className="text-xs text-gray-400 space-y-1 mb-3">
                <p>📞 {r.phone} · WA: {r.whatsapp}</p>
                <p>✉️ {r.email}</p>
                <p>
                  🏏 {r.player_role} · {r.batting_style} · {r.bowling_style}
                </p>
                <p>
                  💳 {r.payment_method} · UTR: {r.utr_transaction_id}
                </p>
                <p>👤 Sender: {r.payment_sender_name}</p>
                <p>🕒 {new Date(r.created_at).toLocaleString()}</p>
              </dl>
              <div className="flex flex-wrap items-center gap-2">
                {r.payment_proof_url && (
                  <a
                    href={r.payment_proof_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-gold-400 underline underline-offset-2"
                  >
                    View Proof
                  </a>
                )}
                <StatusButton
                  label="Pending"
                  active={r.payment_status === "pending"}
                  disabled={updatingId === r.id}
                  onClick={() => updateStatus(r.id, "pending")}
                />
                <StatusButton
                  label="Verify"
                  active={r.payment_status === "verified"}
                  disabled={updatingId === r.id}
                  onClick={() => updateStatus(r.id, "verified")}
                  variant="verified"
                />
                <StatusButton
                  label="Reject"
                  active={r.payment_status === "rejected"}
                  disabled={updatingId === r.id}
                  onClick={() => updateStatus(r.id, "rejected")}
                  variant="rejected"
                />
                {r.payment_status === "verified" && (
                  <a
                    href={buildWhatsAppLink(r)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-emerald-glow underline underline-offset-2"
                  >
                    WhatsApp
                  </a>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && !loading && (
            <p className="p-8 text-center text-sm text-gray-500">
              No registrations match your filters.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

function StatusButton({
  label,
  active,
  disabled,
  onClick,
  variant,
}: {
  label: string;
  active: boolean;
  disabled: boolean;
  onClick: () => void;
  variant?: "verified" | "rejected";
}) {
  const base =
    "rounded-md border px-2.5 py-1 text-xs font-medium transition disabled:opacity-50 disabled:cursor-not-allowed";
  const colorClasses = active
    ? variant === "verified"
      ? "border-emerald-glow/50 bg-emerald-glow/15 text-emerald-glow"
      : variant === "rejected"
        ? "border-red-500/50 bg-red-500/15 text-red-400"
        : "border-yellow-500/50 bg-yellow-500/15 text-yellow-400"
    : "border-gold-700/30 text-gray-400 hover:bg-gold-600/10";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${colorClasses}`}
    >
      {label}
    </button>
  );
}

function buildWhatsAppLink(r: Registration) {
  const digits = r.whatsapp.replace(/[^0-9]/g, "");
  const message = encodeURIComponent(
    `Hi ${r.full_name}, your registration for the Summer Mombasa Premier League T20 - Kenya Tour has been verified and confirmed. Welcome aboard!`
  );
  return `https://wa.me/${digits}?text=${message}`;
}
