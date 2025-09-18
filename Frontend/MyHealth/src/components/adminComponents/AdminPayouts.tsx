import { useEffect, useState } from "react";
import { getPayouts, updatePayout } from "../../api/admin/adminApi";
import {
  Table,
  Select,
  DatePicker,
  Button,
  Pagination,
  Tag,
  Modal,
  Form,
  Input,
  DatePicker as SingleDatePicker,
  InputNumber,
  Popconfirm,
  message,
} from "antd";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";
import moment from "moment";

interface Transaction {
  _id: string;
  bankAccNo: string;
  bankAccHolderName: string;
  bankIfscCode: string;
  totalAmount: number;
  paid: number;
  serviceAmount: number;
  status: string;
  transactionId?: string;
  invoiceLink?: string;
  on?: string;
  createdAt: string;
  updatedAt: string;
}

const { Option } = Select;
const { RangePicker } = DatePicker;

const AdminPayouts = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(5);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: "requested",
    dateRange: null as [moment.Moment, moment.Moment] | null,
  });
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState<Transaction | null>(null);
  const [form] = Form.useForm();

  const fetchTransactions = async (page: number) => {
    setLoading(true);
    try {
      const response = await getPayouts(page, limit, {
        status: filters.status,
        startDate: filters.dateRange
          ? filters.dateRange[0].toISOString()
          : undefined,
        endDate: filters.dateRange
          ? filters.dateRange[1].toISOString()
          : undefined,
      });
      setTransactions(response.payouts);
      setTotalPages(response.totalPages);
    } catch (err) {
      console.error("Error fetching transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(currentPage);
  }, [currentPage, filters]);

  useEffect(() => {
    if (selected && visible) {
      form.setFieldsValue({
        paid: selected.paid,
        transactionId: selected.transactionId || "",
        invoiceLink: selected.invoiceLink || "",
        on: moment(),
      });
    }
  }, [selected, visible, form]);

  const handleFilterChange = (
    key: string,
    value: string | [moment.Moment, moment.Moment] | null
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handlePay = (record: Transaction) => {
    setSelected(record);
    setVisible(true);
  };

  const onFinishPay = async (values: {
    paid: number;
    transactionId: string;
    invoiceLink: string;
    on: { toISOString: () => string };
  }) => {
    if (!selected) return;
    try {
      const updateData = {
        status: "paid",
        paid: values.paid,
        transactionId: values.transactionId,
        invoiceLink: values.invoiceLink || "",
        on: values.on.toISOString(),
      };
      await updatePayout(selected._id, updateData);
      setVisible(false);
      fetchTransactions(currentPage);
    } catch (err) {
      console.error("Error updating payout:", err);
    }
  };

  const handleReject = async (record: Transaction) => {
    try {
      const updateData = {
        status: "rejected",
        on: new Date().toISOString(),
      };
      const rewt = await updatePayout(record._id, updateData);
      console.log("rsrew. isslfjsd", rewt);
      setVisible(false);
      fetchTransactions(currentPage);
    } catch (err) {
      console.error("Error rejecting payout:", err);
      message.error("payment updation failed");
    }
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => (
        <span className="text-sm sm:text-base text-gray-700">
          {moment(date).format("MMM DD, YYYY h:mm A")}
        </span>
      ),
    },
    {
      title: "Acc.No",
      dataIndex: "bankAccNo",
      key: "bankAccNo",
      render: (text: string) => (
        <span className="text-sm sm:text-base text-gray-700 truncate">
          {text}
        </span>
      ),
    },
    {
      title: "Name",
      dataIndex: "bankAccHolderName",
      key: "bankAccHolderName",
      render: (text: string) => (
        <span className="text-sm sm:text-base text-gray-700 truncate">
          {text}
        </span>
      ),
    },
    {
      title: "IFSC",
      dataIndex: "bankIfscCode",
      key: "bankIfscCode",
      render: (text: string) => (
        <span className="text-sm sm:text-base text-gray-700 truncate">
          {text}
        </span>
      ),
    },
    {
      title: "Total",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount: number) => (
        <span className="text-sm sm:text-base text-gray-700">Rs {amount}</span>
      ),
    },
    {
      title: "Paid",
      dataIndex: "paid",
      key: "paid",
      render: (amount: number) => (
        <span className="text-sm sm:text-base text-gray-700">Rs {amount}</span>
      ),
    },
    {
      title: "Serv Amnt",
      dataIndex: "serviceAmount",
      key: "serviceAmount",
      render: (amount: number) => (
        <span className="text-sm sm:text-base text-gray-700">Rs {amount}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text: string) => {
        let color = "blue";
        if (text === "paid") color = "green";
        if (text === "rejected") color = "red";
        return (
          <Tag
            color={color}
            className="text-xs sm:text-sm font-medium truncate"
          >
            {text.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "Action Date",
      dataIndex: "on",
      key: "on",
      render: (date: string, record: Transaction) => (
        <span className="text-sm sm:text-base text-gray-700">
          {record.status !== "requested" && date
            ? moment(date).format("MMM DD, YYYY h:mm A")
            : "-"}
        </span>
      ),
    },
    {
      title: "Trans Id",
      dataIndex: "transactionId",
      key: "transactionId",
      render: (text: string, record: Transaction) =>
        record.invoiceLink ? (
          <a
            href={record.invoiceLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-sm sm:text-base underline transition-colors"
          >
            {text || "View"}
          </a>
        ) : (
          <span className="text-sm sm:text-base text-gray-700">
            {text || "N/A"}
          </span>
        ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (record: Transaction) =>
        record.status === "requested" ? (
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              type="primary"
              onClick={() => handlePay(record)}
              className="w-full sm:w-auto h-10 px-4 text-sm sm:text-base font-medium"
            >
              Pay
            </Button>
            <Popconfirm
              title="Are you sure you want to reject this payout?"
              onConfirm={() => handleReject(record)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                danger
                className="w-full sm:w-auto h-10 px-4 text-sm sm:text-base font-medium"
              >
                Reject
              </Button>
            </Popconfirm>
          </div>
        ) : null,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-6">
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">
        Admin Payouts
      </h2>

      {/* Filters */}
      <div className="mb-6 bg-white p-4 sm:p-6 rounded-xl shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 flex-wrap">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <FilterOutlined className="text-gray-600 text-base" />
            <Select
              placeholder="Filter by Status"
              className="w-full sm:w-48"
              value={filters.status}
              onChange={(value) => handleFilterChange("status", value)}
              allowClear
            >
              <Option value="requested">Requested</Option>
              <Option value="paid">Paid</Option>
              <Option value="rejected">Rejected</Option>
            </Select>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <FilterOutlined className="text-gray-600 text-base" />
            <RangePicker
              onChange={(dates) => {
                if (dates && dates[0] && dates[1]) {
                  handleFilterChange("dateRange", [
                    moment(dates[0].toDate()),
                    moment(dates[1].toDate()),
                  ]);
                } else {
                  handleFilterChange("dateRange", null);
                }
              }}
              format="YYYY-MM-DD"
              className="w-full sm:w-auto"
            />
          </div>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={() => fetchTransactions(currentPage)}
            className="w-full sm:w-auto h-10 px-4 text-sm sm:text-base font-medium"
          >
            Apply Filters
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md overflow-x-auto">
        <Table
          dataSource={transactions}
          columns={columns}
          rowKey="_id"
          loading={loading}
          pagination={false}
          className="min-w-[800px]"
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

      {/* Pay Modal */}
      <Modal
        title="Update Payout Details"
        open={visible}
        onCancel={() => setVisible(false)}
        onOk={form.submit}
        okText="Submit"
        cancelText="Cancel"
        width={window.innerWidth < 640 ? "90%" : 520}
      >
        <Form
          form={form}
          onFinish={onFinishPay}
          layout="vertical"
          className="space-y-4"
        >
          <Form.Item
            name="paid"
            label="Paid Amount"
            rules={[
              { required: true, message: "Please enter the paid amount" },
            ]}
          >
            <InputNumber min={0} className="w-full" />
          </Form.Item>
          <Form.Item
            name="transactionId"
            label="Transaction ID"
            rules={[
              { required: true, message: "Please enter the transaction ID" },
            ]}
          >
            <Input className="w-full" />
          </Form.Item>
          <Form.Item name="invoiceLink" label="Invoice Link">
            <Input className="w-full" />
          </Form.Item>
          <Form.Item
            name="on"
            label="Action Date"
            rules={[
              { required: true, message: "Please select the action date" },
            ]}
          >
            <SingleDatePicker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              className="w-full"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminPayouts;
