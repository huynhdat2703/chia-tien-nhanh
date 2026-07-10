import { useState } from "react";

export default function ShareLinkBox({ groupId }) {
  const [copied, setCopied] = useState(null);
  const viewLink = `${window.location.origin}/g/${groupId}`;
  const editLink = window.location.href;

  const copy = async (text, key) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 flex flex-wrap items-center gap-3 justify-between">
      <p className="text-sm text-emerald-800">
        Gửi link xem cho nhóm chat, giữ link chỉnh sửa cho riêng bạn.
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => copy(viewLink, "view")}
          className="text-xs font-medium bg-white border border-emerald-300 text-emerald-700 rounded-lg px-3 py-1.5"
        >
          {copied === "view" ? "Đã copy!" : "Copy link xem"}
        </button>
        <button
          onClick={() => copy(editLink, "edit")}
          className="text-xs font-medium bg-emerald-600 text-white rounded-lg px-3 py-1.5"
        >
          {copied === "edit" ? "Đã copy!" : "Copy link chỉnh sửa"}
        </button>
      </div>
    </div>
  );
}
