import React, { type Dispatch, type SetStateAction } from "react";
import { Box, TablePagination } from "@mui/material";

interface PaginationInterface {
  page: number;
  rowsPerPage: number;
  setPage: Dispatch<SetStateAction<number>>;
  setRowsPerPage: Dispatch<SetStateAction<number>>;
  count: number;
}

export default function Pagination({
  page,
  rowsPerPage,
  setPage,
  setRowsPerPage,
  count,
}: PaginationInterface) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const mainContain = document.querySelector(".admin-dashboard-containt-main") || document.querySelector(".admin-dashboard-right-main");
    if (mainContain) {
      mainContain.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleChangePage = (
    _: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    setPage(newPage);
    scrollToTop();
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    scrollToTop();
  };

  return (
    <Box className="pagination-main">
      <TablePagination
        className="pagination"
        component="div"
        rowsPerPageOptions={[10, 25, 50, 100]}
        count={count}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
}

