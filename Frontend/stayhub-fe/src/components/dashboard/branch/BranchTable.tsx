import { Button, Input, Space, Table } from "antd";
import { FaPlus } from "react-icons/fa";
import { IoFilter, IoSearch } from "react-icons/io5";

export default function BranchTable() {
    return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      
      {/* Top Toolbar */}
      <div className="flex justify-between items-center mb-6 gap-4">
        <Input
          prefix={<IoSearch className="text-gray-400" />} 
          placeholder="Search by username, email or full name..." 
          className="rounded-full flex-1 py-2 px-4"
        />
        <Space>
          <Button 
            type="primary" 
            icon={<FaPlus />} 
            className="bg-[#00a86b] hover:bg-[#008f5a] border-none rounded-full px-6 flex items-center h-10"
          >
            Create New User
          </Button>
          <Button 
            icon={<IoFilter />} 
            className="rounded-full w-10 h-10 flex items-center justify-center border-gray-300"
          />
        </Space>
      </div>

      {/* Main Table */}
      <Table 
        columns={columns} 
        dataSource={data} 
        rowKey="id" 
        loading={loading}
        pagination={false} 
        size="middle"
        bordered={false}
      />



    </div>
  );
}