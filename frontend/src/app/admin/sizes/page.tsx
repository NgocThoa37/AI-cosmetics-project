'use client';

import { useState, useEffect } from 'react';
import { SearchFilterBar } from '@/components/admin/common/SearchFilterBar';
import { ConfirmModal } from '@/components/admin/common/ConfirmModal';
import { SizeForm } from '@/components/admin/forms/SizeForm';
import { adminService } from '@/services/api/admin.service';
import { Size } from '@/types/admin.types';
import toast from 'react-hot-toast';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function AdminVariantSizes() {
  const [sizes, setSizes] = useState<Size[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSize, setEditingSize] = useState<Size | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Size | null>(null);
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isReordering, setIsReordering] = useState(false);

  useEffect(() => {
    fetchSizes();
  }, []);

  const fetchSizes = async () => {
    try {
      const data = await adminService.getAllSizes();
      setSizes(data || []);
    } catch (error) {
      console.error('Failed to fetch size variants:', error);
      toast.error('Không thể tải danh sách kích thước');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: Partial<Size>) => {
    try {
      if (editingSize) {
        await adminService.updateSize(editingSize.id, data);
        toast.success('Cập nhật kích thước thành công');
      } else {
        await adminService.createSize(data as { name: string });
        toast.success('Thêm kích thước thành công');
      }
      fetchSizes();
      setIsFormOpen(false);
      setEditingSize(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi lưu kích thước');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminService.deleteSize(deleteTarget.id);
      toast.success('Xóa kích thước thành công');
      fetchSizes();
      setDeleteTarget(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể xóa kích thước vì đang được sử dụng');
    }
  };

  const handleDeleteMultiple = async () => {
    if (selectedIds.length === 0) return;
    try {
      await adminService.deleteMultipleSizes(selectedIds);
      toast.success(`Xóa ${selectedIds.length} kích thước thành công`);
      setSelectedIds([]);
      fetchSizes();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi xóa nhiều kích thước');
    }
  };

  const handleReorder = async (result: any) => {
    if (!result.destination) return;
    
    setIsReordering(true);
    const items = Array.from(sizes);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setSizes(items);
    
    try {
      const orderIds = items.map(item => item.id);
      await adminService.reorderSizes(orderIds);
      toast.success('Cập nhật thứ tự thành công');
      fetchSizes();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi cập nhật thứ tự');
      fetchSizes();
    } finally {
      setIsReordering(false);
    }
  };

  const filteredSizes = sizes.filter(s => {
    const name = s.name?.toLowerCase() || '';
    return name.includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-forest-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
      {/* Header - Chỉ có tiêu đề */}
      <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-800">Quản lý kích thước</h3>
        {selectedIds.length > 0 && (
          <button
            onClick={handleDeleteMultiple}
            className="bg-rose-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-rose-700 transition-colors"
          >
            Xóa {selectedIds.length} kích thước
          </button>
        )}
      </div>

      {/* SearchFilterBar - CÓ NÚT THÊM */}
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter="ALL"
        onStatusFilterChange={() => {}}
        statusOptions={[]}
        onReset={() => setSearchQuery('')}
        onAdd={() => {
          setEditingSize(null);
          setIsFormOpen(true);
        }}
        addButtonLabel=" Thêm kích thước"
        placeholder="Tìm theo tên kích thước"
      />

      {isReordering && (
        <div className="mx-4 mt-3 p-2 bg-blue-50 border border-blue-200 text-blue-600 text-xs rounded-lg">
          🔄 Đang cập nhật thứ tự...
        </div>
      )}

      <div className="p-4">
        <div className="text-xs text-slate-500 mb-2">
          💡 Kéo thả để sắp xếp thứ tự hiển thị
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="p-3 w-12 text-center text-slate-500 font-semibold uppercase tracking-wider">#</th>
                <th className="p-3 text-slate-500 font-semibold uppercase tracking-wider">ID</th>
                <th className="p-3 text-slate-500 font-semibold uppercase tracking-wider">Tên kích thước</th>
                <th className="p-3 text-slate-500 font-semibold uppercase tracking-wider">Thứ tự</th>
                <th className="p-3 text-center text-slate-500 font-semibold uppercase tracking-wider w-24">Thao tác</th>
              </tr>
            </thead>

            <DragDropContext onDragEnd={handleReorder}>
              <Droppable droppableId="sizes">
                {(provided) => (
                  <tbody {...provided.droppableProps} ref={provided.innerRef} className="divide-y divide-slate-100">
                    {filteredSizes.map((size, index) => (
                      <Draggable key={size.id} draggableId={String(size.id)} index={index}>
                        {(provided) => (
                          <tr
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="hover:bg-slate-50/70 transition-colors"
                          >
                            <td className="p-3 text-center text-slate-400 cursor-grab" {...provided.dragHandleProps}>
                              ⠿
                            </td>
                            <td className="p-3 font-mono text-slate-400">#{size.id}</td>
                            <td className="p-3 font-semibold text-slate-800">{size.name}</td>
                            <td className="p-3 text-slate-500">{index + 1}</td>
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => {
                                    setEditingSize(size);
                                    setIsFormOpen(true);
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100"
                                  title="Chỉnh sửa"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => setDeleteTarget(size)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                                  title="Xóa"
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </tbody>
                )}
              </Droppable>
            </DragDropContext>
          </table>
        </div>

        {filteredSizes.length === 0 && (
          <div className="text-center py-8 text-slate-400 text-sm">
            Không có kích thước nào
          </div>
        )}
      </div>

      <SizeForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingSize(null);
        }}
        onSave={handleSave}
        initialData={editingSize}
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Xác nhận xóa kích thước"
        message={`Bạn có chắc chắn muốn xóa kích thước "${deleteTarget?.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {selectedSize && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Chi tiết kích thước</h3>
            <div className="space-y-3">
              <div><span className="font-semibold">ID:</span> {selectedSize.id}</div>
              <div><span className="font-semibold">Tên kích thước:</span> {selectedSize.name}</div>
              <div><span className="font-semibold">Thứ tự:</span> {selectedSize.id || 0}</div>
            </div>
            <button
              onClick={() => setSelectedSize(null)}
              className="mt-4 w-full bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-200"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}