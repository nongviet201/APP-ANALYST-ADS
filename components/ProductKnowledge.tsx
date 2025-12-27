import React, { useMemo } from 'react';
import { Button } from './Button';
import { DataTable } from './DataTable';

interface ProductKnowledgeProps {
  data: any[][] | null;
  onRefresh: () => void;
  lastUpdated: number | null;
}

export const ProductKnowledge: React.FC<ProductKnowledgeProps> = ({ data, onRefresh, lastUpdated }) => {
  
  const formattedData = useMemo(() => {
    if (!data || data.length < 2) return [];
    const headers = data[0].map((h: any) => h?.toString().trim() || "");
    const rows = data.slice(1);

    return rows.map(row => {
      const obj: any = {};
      headers.forEach((header: string, index: number) => {
        const key = header || `Col ${index + 1}`;
        obj[key] = row[index] || "";
      });
      return obj;
    });
  }, [data]);

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Table Section */}
      <div className="flex-1 min-h-[400px]">
          <DataTable 
              title="Kho Sản Phẩm" 
              data={formattedData} 
              isUpdating={false}
              status={lastUpdated ? 'active' : 'idle'}
              onExpand={onRefresh} // Using expand icon as refresh on this screen
          />
      </div>
    </div>
  );
};
