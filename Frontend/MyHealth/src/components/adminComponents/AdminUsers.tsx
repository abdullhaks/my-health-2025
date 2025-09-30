import { useEffect, useState } from "react";
import { manageUsers, getUsers } from "../../api/admin/adminApi";
import { toast } from "react-toastify";
import { FaLock, FaUnlock } from "react-icons/fa";
import { Table, Button, Popconfirm, Input, Pagination } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useDebounce } from "../../hooks/debounceHook";

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
  const debouncedSearch = useDebounce(search, 300); // Debounce search input by 300ms

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsers(debouncedSearch, page, limit);
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
    setPage(1); // Reset to first page on search
    fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, [page, debouncedSearch]); // Trigger fetchUsers when debouncedSearch or page changes

  const columns = [
    {
      title: "Name",
      dataIndex: "fullName",
      key: "fullName",
      render: (text: string) => (
        <span className="text-sm sm:text-base text-gray-700 truncate">
          {text}
        </span>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (text: string) => (
        <span className="text-sm sm:text-base text-gray-700 truncate">
          {text}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "isBlocked",
      key: "isBlocked",
      render: (isBlocked: boolean) => (
        <span
          className={`text-sm sm:text-base font-semibold ${
            isBlocked ? "text-red-600" : "text-green-600"
          }`}
        >
          {isBlocked ? "Blocked" : "Active"}
        </span>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: User) => (
        <Popconfirm
          title="Manage user"
          description={`Are you sure to ${record.isBlocked ? "unblock" : "block"} this user?`}
          onConfirm={() => handleBlockUnblock(record._id, record.isBlocked)}
          okText="Yes"
          cancelText="No"
        >
          <Button
            type="primary"
            danger={!record.isBlocked}
            className={`text-sm sm:text-base font-medium transition-colors ${
              record.isBlocked ? "bg-green-600 hover:bg-green-700" : ""
            }`}
            icon={record.isBlocked ? <FaUnlock /> : <FaLock />}
          >
            {record.isBlocked ? "Unblock" : "Block"}
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-xl sm:text-2xl font-semibold text-green-700 mb-6">
        Manage Users
      </h1>

      {/* Search */}
      <div className="mb-6 bg-white p-4 sm:p-6 rounded-xl shadow-md">
        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4"
        >
          <div className="relative w-full sm:w-80">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email"
              prefix={<SearchOutlined className="text-gray-400" />}
              className="w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
            />
          </div>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            htmlType="submit"
            className="w-full sm:w-auto h-10 px-4 text-sm sm:text-base font-medium bg-green-600 hover:bg-green-700"
          >
            Search
          </Button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md overflow-x-auto">
        <Table
          dataSource={users}
          columns={columns}
          rowKey="_id"
          loading={loading}
          pagination={false}
          className="min-w-[600px]"
        />
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-end">
        <Pagination
          current={page}
          total={totalPages * limit}
          pageSize={limit}
          onChange={(page) => setPage(page)}
          showSizeChanger={false}
          responsive
        />
      </div>
    </div>
  );
};

export default AdminUsers;