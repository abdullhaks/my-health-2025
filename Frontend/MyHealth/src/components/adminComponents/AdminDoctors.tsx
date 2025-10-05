import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FaLock,FaUnlock } from "react-icons/fa";
import { getDoctors, manageDoctors } from "../../api/admin/adminApi";
import { Table, Button, Popconfirm, Input, Checkbox, Pagination } from "antd";
import { useDebounce } from "../../hooks/debounceHook";
import { SearchOutlined } from "@ant-design/icons";

interface Doctor {
  _id: string;
  fullName: string;
  email: string;
  isBlocked: boolean;
  adminVerified: number;
}

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [onlyPremium, setOnlyPremium] = useState(false);
  const [toVerify, setToVerify] = useState(false);

  const limit = 5;
  const debouncedSearch = useDebounce(search, 300); // Debounce search input by 300ms

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await getDoctors(debouncedSearch, page, limit, onlyPremium, toVerify);
      setDoctors(response.doctors);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load doctors");
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUnblock = async (id: string, isBlocked: boolean) => {
    try {
      const response = await manageDoctors(id, isBlocked);
      if (!response) {
        toast.error(`Doctor ${isBlocked ? "unblocked" : "blocked"} failed`);
      }
      setDoctors((prevDoctor) =>
        prevDoctor.map((doctor) =>
          doctor._id === id ? { ...doctor, isBlocked: !isBlocked } : doctor
        )
      );
      toast.success(
        `Doctor ${isBlocked ? "unblocked" : "blocked"} successfully`
      );
    } catch (error) {
      console.error(error);
      toast.error("Action failed");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); 
    fetchDoctors();
  };

  useEffect(() => {
    fetchDoctors();
  }, [page, debouncedSearch, onlyPremium, toVerify]); 
  const columns = [
    {
      title: "Name",
      dataIndex: "fullName",
      key: "fullName",
      render: (text: string) => (
        <span className="text-sm sm:text-base text-gray-700 truncate">
          Dr. {text}
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
      dataIndex: "adminVerified",
      key: "adminVerified",
      render: (adminVerified: number, record: Doctor) => {
        console.log("adminVerified:", adminVerified, "record:", record);

         if(adminVerified === 0) {
          return(
            <Button
            type="dashed"
            className="text-sm sm:text-base font-medium bg-blue-600 hover:bg-blue-700"
            onClick={() => window.location.href = `/admin/doctor/${record._id}`}
            
            >
              Verify

            </Button>
          )
        }else if(adminVerified === 1){
          return(
            <Button
            type="primary"
            className="text-sm sm:text-base font-medium bg-blue-600 hover:bg-blue-700"
            onClick={() => window.location.href = `/admin/doctor/${record._id}`}
            
            >
              View Details

            </Button>
          )

        }else{
        return (
         
        <p
          
          onClick={() => window.location.href = `/admin/doctor/${record._id}`}
          className={`text-sm sm:text-base font-semibold cursor-pointer underline transition-colors text-red-600 hover:text-red-800"`}
        >
          Rejected
        </p>
        )
      }
      }
      ,
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: Doctor) => (
        <Popconfirm
          title="Manage doctor"
          description={`Are you sure to ${record.isBlocked ? "unblock" : "block"} this doctor?`}
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
        Manage Doctors
      </h1>

      {/* Search and Filter */}
      <div className="mb-6 bg-white p-4 sm:p-6 rounded-xl shadow-md">
        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 flex-wrap"
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
          <label className="flex items-center text-sm sm:text-base text-gray-700">
            <Checkbox
              checked={onlyPremium}
              onChange={(e) => setOnlyPremium(e.target.checked)}
              className="mr-2"
            />
            premium doctors
          </label>

          <label className="flex items-center text-sm sm:text-base text-gray-700">
            <Checkbox
              checked={toVerify}
              onChange={(e) => {
                setToVerify(e.target.checked)
                setPage(1)
              }
              
              }
              className="mr-2"
            />
            to verify
          </label>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md overflow-x-auto">
        <Table
          dataSource={doctors}
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

export default AdminDoctors;