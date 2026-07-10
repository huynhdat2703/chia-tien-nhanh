import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, doc, setDoc, Timestamp } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { db } from "../firebase";
import Footer from "../components/Footer";

export default function CreateGroup() {
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);

    const groupsRef = collection(db, "groups");
    const newGroupRef = doc(groupsRef);
    const editToken = uuidv4();

    await setDoc(newGroupRef, {
      name: name.trim(),
      editToken,
      createdAt: Date.now(),
      expiresAt: Timestamp.fromMillis(Date.now() + 3 * 24 * 60 * 60 * 1000),
      members: [],
      expenses: [],
      settlements: [],
    });

    navigate(`/g/${newGroupRef.id}?token=${editToken}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white text-xl">
              💵
            </div>
            <div>
              <p className="text-sm text-gray-500">Chia tiền nhanh</p>
              <h1 className="text-xl font-semibold text-gray-900">Tạo nhóm mới</h1>
            </div>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên nhóm
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: buổi trưa 300k"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={creating || !name.trim()}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium rounded-lg py-2.5 text-sm transition"
            >
              {creating ? "Đang tạo..." : "Tạo nhóm"}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
