
import { useEffect, useState } from "react";
import { Table, Button, Input, Pagination, Checkbox, Select, DatePicker } from "antd";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";
import { useDebounce } from "../hooks/debounceHook"; // Adjust path to your debounce hook
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import moment from "moment";

const { Option } = Select;
const { RangePicker } = DatePicker;

interface FilterOption {
  key: string;
  type: "search" | "checkbox" | "select" | "dateRange";
  placeholder?: string;
  options?: { value: string; label: string }[]; // For select dropdowns
  label?: string; // For checkbox
}

interface ReusableTableProps<T> {
  title: string;
  columns: any[]; // Antd Table columns
  fetchData: (
    page: number,
    limit: number,
    filters: Record<string, any>
  ) => Promise<{ data: T[]; totalPages: number }>;
  initialFilters?: Record<string, any>;
  filterOptions?: FilterOption[];
  rowKey: string;
  limit?: number;
  tableClassName?: string;
}

const ReusableTable = <T extends object>({
  title,
  columns,
  fetchData,
  initialFilters = {},
  filterOptions = [],
  rowKey,
  limit = 5,
  tableClassName = "min-w-[600px]",
}: ReusableTableProps<T>) => {
  const [data, setData] = useState<T[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<Record<string, any>>(initialFilters);
  const navigate = useNavigate();

  const debouncedFilters = useDebounce(filters, 300); // Debounce all filters

  const fetchTableData = async (page: number) => {
    try {
      setLoading(true);
      const response = await fetchData(page, limit, debouncedFilters);
      setData(response.data);
      setTotalPages(response.totalPages);
    } catch (error: any) {
      console.error(error);
      if (error.redirectPath) {
        toast.error(error.errorMessage || "Session expired. Please login again.");
        navigate(error.redirectPath);
      } else {
        toast.error(`Failed to load ${title.toLowerCase()}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTableData(currentPage);
  }, [currentPage, debouncedFilters]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchTableData(currentPage);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-xl sm:text-2xl font-semibold text-green-700 mb-6">
        {title}
      </h1>

      {/* Filters */}
      {filterOptions.length > 0 && (
        <div className="mb-6 bg-white p-4 sm:p-6 rounded-xl shadow-md">
          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 flex-wrap"
          >
            {filterOptions.map((filter) => (
              <div key={filter.key} className="flex items-center gap-2 w-full sm:w-auto">
                {filter.type === "search" && (
                  <div className="relative w-full sm:w-80">
                    <Input
                      value={filters[filter.key] || ""}
                      onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                      placeholder={filter.placeholder}
                      prefix={<SearchOutlined className="text-gray-400" />}
                      className="w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                    />
                  </div>
                )}
                {filter.type === "checkbox" && (
                  <label className="flex items-center text-sm sm:text-base text-gray-700">
                    <Checkbox
                      checked={filters[filter.key] || false}
                      onChange={(e) => handleFilterChange(filter.key, e.target.checked)}
                      className="mr-2"
                    />
                    {filter.label}
                  </label>
                )}
                {filter.type === "select" && (
                  <>
                    <FilterOutlined className="text-gray-600 text-base" />
                    <Select
                      placeholder={filter.placeholder}
                      className="w-full sm:w-48"
                      onChange={(value) => handleFilterChange(filter.key, value)}
                      allowClear
                      value={filters[filter.key] || undefined}
                    >
                      {filter.options?.map((option) => (
                        <Option key={option.value} value={option.value}>
                          {option.label}
                        </Option>
                      ))}
                    </Select>
                  </>
                )}
                {filter.type === "dateRange" && (
                  <>
                    <FilterOutlined className="text-gray-600 text-base" />
                    <RangePicker
                      onChange={(dates) => {
                        if (dates && dates[0] && dates[1]) {
                          handleFilterChange(filter.key, [
                            moment(dates[0].toDate()),
                            moment(dates[1].toDate()),
                          ]);
                        } else {
                          handleFilterChange(filter.key, null);
                        }
                      }}
                      format="YYYY-MM-DD"
                      className="w-full sm:w-auto"
                      value={filters[filter.key] || undefined}
                    />
                  </>
                )}
              </div>
            ))}
            <Button
              type="primary"
              icon={<SearchOutlined />}
              htmlType="submit"
              className="w-full sm:w-auto h-10 px-4 text-sm sm:text-base font-medium bg-green-600 hover:bg-green-700"
            >
              Apply Filters
            </Button>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md overflow-x-auto">
        <Table
          dataSource={data}
          columns={columns}
          rowKey={rowKey}
          loading={loading}
          pagination={false}
          className={tableClassName}
        />
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-end">
        <Pagination
          current={currentPage}
          total={totalPages * limit}
          pageSize={limit}
          onChange={(page) => setCurrentPage(page)}
          showSizeChanger={false}
          responsive
        />
      </div>
    </div>
  );
};

export default ReusableTable;
