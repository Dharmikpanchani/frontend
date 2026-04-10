import { Box } from "@mui/material";
import Png from "@/assets/Png";

export default function PageNotFound() {
      return (
            <Box className="page-not-found-content-main">
                  <img src={Png.pageNotFound} className='page-not-found-img' />
            </Box>
      )
}
