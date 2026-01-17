import { useEffect, useState } from "react";

export default function Approvals() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Data
  const fetchApprovals = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5000/api/admin/approvals", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setPendingUsers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  // 2. Actions
  const handleAction = async (id, action) => {
    const token = localStorage.getItem("token");
    const method = action === "approve" ? "PUT" : "DELETE";
    const url = action === "approve" 
      ? `http://localhost:5000/api/admin/approve/${id}`
      : `http://localhost:5000/api/admin/reject/${id}`;

    try {
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        // Remove from list locally
        setPendingUsers((prev) => prev.filter((u) => u._id !== id));
      } else {
        alert("Action failed");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Pending Business Approvals</h1>

      {loading ? (
        <p>Loading...</p>
      ) : pendingUsers.length === 0 ? (
        <div className="text-gray-500">No pending approvals.</div>
      ) : (
        <div className="grid gap-4">
          {pendingUsers.map((user) => (
            <div key={user._id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">{user.companyName}</h3>
                <p className="text-sm text-gray-600">Owner: {user.name} (@{user.username})</p>
                <div className="mt-1 flex gap-3 text-xs text-gray-500">
                   {/* FIXED: user.GST -> user.gstNumber */}
                   <span>GST: {user.gstNumber || "N/A"}</span>
                   <span>•</span>
                   <span>Phone: {user.phone}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleAction(user._id, "reject")}
                  className="px-4 py-2 text-red-600 border border-red-200 rounded hover:bg-red-50"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleAction(user._id, "approve")}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}