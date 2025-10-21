import React from "react";
import ColumnsBox from "./columnsBox/columnsBox";
import TableData from "./tableData/tableData";

function TableContainer({ data, onEdit, onDelete }) {
  return (
    <div className="w-[calc(100%-2vw)] h-[calc(100%-10vh)] 
                    absolute top-[8vh] left-[1vw] flex flex-col rounded border 
                  border-gray-200 bg-white box-border overflow-hidden">
      <ColumnsBox />
      <TableData data={data} onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
}

export default TableContainer;