"use client";
import React, { useState, useEffect } from "react";
import { Tag } from "antd";
import GenericTableView from "@/components/ui/GenericTableView";
import { Policy, PolicyFilterData } from "@/types/Policy";
import CreateModal from "./components/CreateModal";
import EditModal from "./components/EditModal";
import FilterModal from "./components/FilterModal";
import { BsCardChecklist, BsShieldCheck, BsClockHistory } from "react-icons/bs";
import { 
  FaWifi, FaSwimmer, FaLeaf, FaCoffee, FaCar, FaTv, FaSnowflake, FaPaw, 
  FaWineBottle, FaSmile, FaTshirt, FaGlassMartiniAlt, FaSmokingBan, FaUmbrella, FaDoorClosed, FaSuitcaseRolling 
} from "react-icons/fa";
import dayjs from "dayjs";

const AVAILABLE_ICONS = {
  FaWifi, FaSwimmer, FaLeaf, FaCoffee, FaCar, FaTv, FaSnowflake, FaPaw, 
  FaWineBottle, FaSmile, FaTshirt, FaGlassMartiniAlt, FaSmokingBan, FaUmbrella, FaDoorClosed, FaSuitcaseRolling
};

export default function PoliciesPage() {
  const [loading, setLoading] = useState<boolean>(false);
  const [currentRecord, setCurrentRecord] = useState<Policy | null>(null);

  const [stats, setStats] = useState({
    total: 0,
    lastRevision: null as string | null,
  });

  const fetchStats = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employee/policies/stats`, {
        method: "GET",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!loading) fetchStats();
  }, [loading]);

  return (
    <div className="flex flex-col w-full">
      <div className="px-[30px] pt-[30px]">
        <h1 className="text-2xl font-bold text-gray-800">Policies</h1>
        <p className="text-gray-500 mb-6">
          Define and manage the legal frameworks, operational rules, and guest guidelines.
        </p>

        <div className="grid grid-cols-2 gap-6 mb-[10px]">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Total Policies</p>
              <h2 className="text-3xl font-bold text-gray-800">{stats.total}</h2>
            </div>
            <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex justify-center items-center text-xl">
              <BsCardChecklist />
            </div>
          </div>



          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Last Revision</p>
              <h2 className="text-2xl font-bold text-gray-800">
                {stats.lastRevision ? dayjs(stats.lastRevision).format('MMM DD, YYYY') : 'N/A'}
              </h2>
            </div>
            <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-full flex justify-center items-center text-xl">
              <BsClockHistory />
            </div>
          </div>
        </div>
      </div>

      <GenericTableView<Policy, PolicyFilterData>
        resourceName="Policy"
        searchPlaceholder="Search policies..."
        tableDataEndpoint={`${process.env.NEXT_PUBLIC_API_URL}/employee/policies/list`}
        loading={loading}
        setLoading={setLoading}
        renderCreateModal={(injected) => <CreateModal {...injected} />}
        renderFilterModal={(injected) => <FilterModal {...injected} />}
        renderEditModal={(injected) => <EditModal {...injected} />}
        currentRecord={currentRecord}
        setCurrentRecord={setCurrentRecord}
        generatedDeletePrompt={(record) => `Do you want to delete policy: ${record.name}?`}
        generatedDeleteEndpoint={(record) => `${process.env.NEXT_PUBLIC_API_URL}/employee/policies/delete/${record.name}`}
        resourceId="name"
        tableColumns={[
          {
            title: "POLICY NAME",
            dataIndex: "name",
            key: "name",
            className: "font-semibold text-slate-800",
            render: (text, record) => {
              const IconComponent = (AVAILABLE_ICONS as any)[record.icon] || BsCardChecklist;
              return (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex justify-center items-center">
                    <IconComponent />
                  </div>
                  <span>{text}</span>
                </div>
              );
            }
          },
          {
            title: "DESCRIPTION",
            dataIndex: "description",
            key: "description",
            className: "text-slate-500",
            render: (text) => <div className="max-w-[250px] truncate" title={text}>{text}</div>
          },
          {
            title: "CATEGORY",
            dataIndex: "category",
            key: "category",
            render: (cat) => <Tag className="rounded-full bg-slate-100 text-slate-600 border-none font-semibold px-3 py-1 uppercase text-xs">{cat}</Tag>
          },
          {
            title: "LAST UPDATED",
            dataIndex: "updated_at",
            key: "updated_at",
            className: "text-slate-500",
            render: (date) => date ? dayjs(date).format('MMM DD, YYYY') : '-'
          },
        ]}
      />
    </div>
  );
}