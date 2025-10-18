import React from "react";
import ColumnsBox from "./columnsBox/columnsBox";
import TableData from "./tableData/tableData";
import "./tableContainer.css";

function TableContainer({ data, onEdit, onDelete }) {
  return (
    <div className="table-container">
      <ColumnsBox />
      <TableData data={data} onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
}

export default TableContainer;