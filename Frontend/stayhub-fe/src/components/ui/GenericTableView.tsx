"use client";

import buildQueryParams from "@/utils/BuildQueryParams";
import { Button, message, Space, Table } from "antd";
import { EyeOutlined, EditOutlined, DeleteOutlined, ExclamationCircleFilled } from "@ant-design/icons";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Dispatch, ReactNode, SetStateAction, useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { MdFilterList } from "react-icons/md";
import confirm from "antd/es/modal/confirm";

export type TableColumn = {
    title: string;
    dataIndex?: string;
    key: string;
    render: (...args: any[]) => any;
    className?: string;
}
export interface GenericTableViewProps<TData extends Record<string, any>, TFilter extends Record<string, any>> {
    resourceName: string;
    searchPlaceholder: string;
    tableDataEndpoint: string;
    loading: boolean;
    setLoading: Dispatch<SetStateAction<boolean>>;

    renderCreateModal: (injected: {
        open: boolean;
        onClose: () => void;
        onSuccess: () => Promise<void>;
    }) => ReactNode;
    renderFilterModal: (injected: {
        open: boolean;
        setOpen: Dispatch<SetStateAction<boolean>>;
        query: TFilter;
        setQuery: Dispatch<SetStateAction<TFilter>>;
    }) => ReactNode;
    renderEditModal: (injected: {
        open: boolean;
        current: TData | null;
        onClose: () => void;
        onSuccess: () => Promise<void>;
    }) => ReactNode;

    tableColumns: TableColumn[];
    
    currentRecord: TData | null;
    setCurrentRecord: Dispatch<SetStateAction<TData | null>>;

    generatedDeletePrompt: (record: TData) => string;
    generatedDeleteEndpoint: (record: TData) => string;
}


export default function GenericTableView<TData extends Record<string, any>, TFilter extends Record<string, any>>({
    resourceName,
    searchPlaceholder = "Search...",
    tableDataEndpoint,

    loading,
    setLoading,

    renderCreateModal,
    renderFilterModal,
    renderEditModal,

    tableColumns,
    
    currentRecord,
    setCurrentRecord,

    generatedDeletePrompt,
    generatedDeleteEndpoint

}: GenericTableViewProps<TData, TFilter>) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState<TFilter>(() => {
        // 1. Start with your defaults
        const initialState: Partial<TFilter> = {};


        // Iterate through every parameter currently sitting in the URL
        searchParams.forEach((value, key) => {
            // We have to use 'as' assertions because TypeScript types don't exist at runtime
            initialState[key as keyof TFilter] = value as unknown as TFilter[keyof TFilter];
        });
        return initialState as TFilter;
    })
    const [results, setResults] = useState<TData[]>([]);

    const [hasPrevious, setHasPrevious] = useState<boolean>(false);
    const [hasNext, setHasNext] = useState<boolean>(false);


    const [openCreateModal, setOpenCreateModal] = useState<boolean>(false);
    const [openFilterModal, setOpenFilterModal] = useState<boolean>(false);
    const [openEditModal, setOpenEditModal] = useState<boolean>(false);
    

        const showDeleteConfirm = (record: TData) => {
        confirm({
            title: generatedDeletePrompt(record),
            icon: <ExclamationCircleFilled />,
            content: 'This action cannot be undone.',
            okText: 'Continue',
            okType: 'danger',
            cancelText: 'No',
            async onOk() {
                try {
                    const res = await fetch(generatedDeleteEndpoint(record), {
                        method: 'DELETE',
                        credentials: "include"
                    });
                    if (res.ok) {
                        message.success(`${resourceName} deleted successfully!`);
                        setLoading(true);
                        await fetchData();
                        setLoading(false);
                    } else {
                        message.error(`Failed to delete ${resourceName}!`);
                    }
                } catch (e) {
                    message.error(`Error deleting ${resourceName}`);
                }
            },
        });
    };


    const columns: TableColumn[] = [
        ...tableColumns,
        {
            title: "ACTIONS",
            key: "actions",
            render: (_: unknown, record: TData) => (
                <Space size="middle">
                    <Button 
                        type="text" 
                        icon={<EditOutlined />} 
                        className="text-blue-500 hover:text-blue-700 font-semibold"
                        onClick={() => {setCurrentRecord(record);setOpenEditModal(true)}}
                    >
                        Edit
                    </Button>
                    <Button 
                        type="text" 
                        danger
                        icon={<DeleteOutlined />} 
                        className="font-semibold"
                        onClick={() => showDeleteConfirm(record)}
                    >
                        Delete
                    </Button>
                </Space>
            )
        }
    ]
    const fetchData = async () => {
        const params = buildQueryParams(query).toString()
        router.push(`${pathname}?${params}`);
        const res = await fetch(`${tableDataEndpoint}?${params}`, {
            method: "GET",
            credentials: "include",
        });
        const data = await res.json();
        setResults(data.response as TData[]);
        setHasPrevious(parseInt(query.page ?? '1') > 1);
        setHasNext(data.hasNext);
    }
    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;
        setLoading(true);
        const queryHandler = setTimeout(async () => {
            try {
                await fetchData();
            } catch (error) {
                if (error instanceof Error && error.name !== 'AbortError') {
                    console.error("An error occured: ", error);
                }
            } finally {
                if (!signal.aborted) setLoading(false);
            }
        }, 500);

        return () => {
            clearTimeout(queryHandler);
            controller.abort();
        }
    }, [query])

    return (
        <div className="flex flex-col gap-y-[30px] px-[30px] pt-[30px]">
            <div className="flex justify-between items-center gap-4 w-full bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                {/* Searching */}
                <div className="flex grow group items-center gap-x-4 h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 shadow-inner transition-all">
                    <FaMagnifyingGlass
                        className="text-slate-400 group-focus-within:text-emerald-500 transition-colors"
                        size={18}
                    />
                    <input
                        className="outline-none text-m font-medium placeholder:text-slate-400 transition-all group-focus-within:border-emerald-500 w-full"
                        type="text"
                        placeholder={searchPlaceholder}
                        name="query"
                        onChange={e => setQuery({ ...query, name: e.target.value })}
                        value={query.name ?? ""}
                    />
                </div>
                <div className="flex items-center gap-x-3">
                    {/* Create button */}
                    <Button onClick={() => setOpenCreateModal(true)} className="!flex-1 !md:flex-none !flex !items-center !justify-center !gap-2 !h-11 !px-6 !rounded-xl !bg-emerald-600 !text-white !font-bold !text-sm  !shadow-emerald-100" type="primary">
                        <FaPlus size={16} />
                        Create New {resourceName}
                    </Button>
                    {
                        renderCreateModal({
                            open: openCreateModal,
                            onClose: () => setOpenCreateModal(false),
                            onSuccess: async () => { setLoading(true); await fetchData(); setLoading(false) }
                        })
                    }
                    {/* filter button */}
                    <Button
                        size="large"
                        shape="default"
                        icon={<MdFilterList size={25} className="text-blue-600" />}
                        className="!text-emerald-600 hover:!border-emerald-600 !flex !justify-center"
                        onClick={() => setOpenFilterModal(true)}
                    />
                    {
                        renderFilterModal({
                            open: openFilterModal,
                            setOpen: setOpenFilterModal,
                            query: query,
                            setQuery: setQuery
                        })
                    }
                </div>

            </div>
            {
                loading ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-4 bg-white rounded-[32px] border border-slate-100 shadow-sm">
                        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-500 text-sm font-medium">Loading...</p>
                    </div>
                )
                    : (
                        <div className="flex flex-col gap-6">
                            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                                <Table
                                    columns={columns}
                                    dataSource={results}
                                    rowKey="id"
                                    pagination={false}
                                    className="w-full"
                                />
                                {
                                    renderEditModal({
                                        open: openEditModal,
                                        current: currentRecord,
                                        onClose: () => {
                                            setOpenEditModal(false);
                                            setCurrentRecord(null);
                                        },
                                        onSuccess: async () => {
                                            setLoading(true);
                                            await fetchData();
                                            setLoading(false);
                                        }
                                    })
                                }

                            </div>



                            <div className="flex items-center justify-center gap-4 py-2">
                                <button
                                    className={`flex justify-center items-center w-10 h-10 rounded-xl border transition-all ${hasPrevious
                                            ? "bg-white border-slate-200 text-slate-600 hover:border-emerald-500 hover:text-emerald-600 shadow-sm cursor-pointer"
                                            : "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"
                                        }`}
                                    disabled={!hasPrevious}
                                    onClick={() => setQuery({ ...query, page: (Math.max(parseInt(query.page ?? '1') - 1, 1)).toString() })}
                                >
                                    <span className="text-lg font-light">{"<"}</span>
                                </button>

                                <div className="px-6 py-2 bg-white border border-slate-100 rounded-xl shadow-sm">
                                    <p className="select-none text-sm font-bold text-slate-700">
                                        Trang <span className="text-emerald-600">{query.page ?? '1'}</span>
                                    </p>
                                </div>

                                <button
                                    className={`flex justify-center items-center w-10 h-10 rounded-xl border transition-all ${hasNext
                                            ? "bg-white border-slate-200 text-slate-600 hover:border-emerald-500 hover:text-emerald-600 shadow-sm cursor-pointer"
                                            : "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"
                                        }`}
                                    disabled={!hasNext}
                                    onClick={() => setQuery({ ...query, page: (parseInt(query.page ?? '1') + 1).toString() })}
                                >
                                    <span className="text-lg font-light">{">"}</span>
                                </button>
                            </div>
                        </div>
                    )
            }

        </div>
    )
}