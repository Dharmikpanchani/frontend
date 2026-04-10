import { Table, TableHead, TableRow, TableBody, TableCell, Box } from "@mui/material";

export default function NotAllowPermission() {
  const pathName = window.location.pathname
    ?.slice(1)
    .replace(/-list$/, "")
    .replace(/-/g, " ");

  const finalPath = pathName?.includes("cms") ? "CMS" : pathName;

  return (
    <Table aria-label="simple table" className="table">
      <TableHead className="table-head">
        <TableRow className="table-row"></TableRow>
      </TableHead>
      <TableBody className="table-body">
        <TableRow>
          <TableCell className="table-not-found-td" colSpan={12}>
            <Box className="loader-position">
              <Box className="loader-main">
                <b>{`Access Denied! You do not have permission to view ${finalPath} page.`}</b>{" "}
                <br />
              </Box>
            </Box>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
