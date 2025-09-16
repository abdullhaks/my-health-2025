import { useEffect, useState } from "react";
import { manageUsers, getUsers } from "../../api/admin/adminApi";
import { toast } from "react-toastify";
import { FaLock, FaUnlock, FaSearch } from "react-icons/fa";
import { Popconfirm } from "antd";

interface User {
  _id: string;
  fullName: string;
  email: string;
  isBlocked: boolean;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const limit = 5;

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsers(search, page, limit);
      console.log("users are........", response);
      setUsers(response.users);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUnblock = async (id: string, isBlocked: boolean) => {
    try {
      const response = await manageUsers(id, isBlocked);
      if (!response) {
        toast.error(`User ${isBlocked ? "unblocked" : "blocked"} failed`);
      }
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === id ? { ...user, isBlocked: !isBlocked } : user
        )
      );
      toast.success(`User ${isBlocked ? "unblocked" : "blocked"} successfully`);
    } catch (error) {
      console.error(error);
      toast.error("Action failed");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-xl sm:text-2xl font-semibold text-green-700 mb-6">
        Manage Users
      </h1>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email"
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base bg-white"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base font-medium flex items-center justify-center"
          >
            <FaSearch className="mr-2 w-4 h-4 sm:w-5 sm:h-5" /> Search
          </button>
        </div>
      </form>

      {/* Table */}
      {loading ? (
        <p className="text-center text-gray-600 text-sm sm:text-base">Loading...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-x-auto">
          <table className="min-w-[600px] w-full">
            <thead className="bg-green-50">
              <tr>
                <th className="py-3 px-4 text-left text-sm sm:text-base font-semibold text-gray-700">Name</th>
                <th className="py-3 px-4 text-left text-sm sm:text-base font-semibold text-gray-700">Email</th>
                <th className="py-3 px-4 text-left text-sm sm:text-base font-semibold text-gray-700">Status</th>
                <th className="py-3 px-4 text-center text-sm sm:text-base font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-6 text-gray-500 text-sm sm:text-base">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-sm sm:text-base text-gray-700 truncate">
                      {user.fullName}
                    </td>
                    <td className="py-3 px-4 text-sm sm:text-base text-gray-700 truncate">
                      {user.email}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-sm sm:text-base font-semibold ${
                          user.isBlocked ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {user.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Popconfirm
                        title="Manage user"
                        description={`Are you sure to ${user.isBlocked ? "unblock" : "block"} this user?`}
                        onConfirm={() => handleBlockUnblock(user._id, user.isBlocked)}
                        okText="Yes"
                        cancelText="No"
                      >
                        <button
                          className={`w-full sm:w-auto px-4 py-2 rounded-lg text-white text-sm sm:text-base font-medium transition-colors ${
                            user.isBlocked
                              ? "bg-green-600 hover:bg-green-700"
                              : "bg-red-600 hover:bg-red-700"
                          }`}
                        >
                          {user.isBlocked ? (
                            <span className="flex items-center justify-center">
                              <FaUnlock className="mr-1 w-4 h-4 sm:w-5 sm:h-5" /> Unblock
                            </span>
                          ) : (
                            <span className="flex items-center justify-center">
                              <FaLock className="mr-1 w-4 h-4 sm:w-5 sm:h-5" /> Block
                            </span>
                          )}
                        </button>
                      </Popconfirm>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center items-center mt-6 space-x-3 sm:space-x-4">
        <button
          disabled={page === 1}
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm sm:text-base font-medium"
        >
          Prev
        </button>
        <span className="text-sm sm:text-base text-gray-700">
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm sm:text-base font-medium"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AdminUsers;