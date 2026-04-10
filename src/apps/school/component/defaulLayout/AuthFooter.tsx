import { Box, List, ListItem } from "@mui/material";
import { Link } from "react-router-dom";
import Svg from "@/assets/Svg";

export default function AuthFooter() {
  return (
    <>
      <Box className="social-main">
        <List className="social-ul">
          <ListItem className="social-li">
            <Link className="social-link text-decoration-none" to="/">
              <Box className="social-box">
                <img src={(Svg as any).facebook} className="social-icons" alt="Facebook" />
              </Box>
            </Link>
          </ListItem>
          <ListItem className="social-li">
            <Link className="social-link text-decoration-none" to="/">
              <Box className="social-box">
                <img src={(Svg as any).instagram} className="social-icons" alt="Instagram" />
              </Box>
            </Link>
          </ListItem>
          <ListItem className="social-li">
            <Link className="social-link text-decoration-none" to="/">
              <Box className="social-box">
                <img src={(Svg as any).twitter} className="social-icons" alt="Twitter" />
              </Box>
            </Link>
          </ListItem>
          <ListItem className="social-li">
            <Link className="social-link text-decoration-none" to="/">
              <Box className="social-box">
                <img src={(Svg as any).linkedin} className="social-icons" alt="LinkedIn" />
              </Box>
            </Link>
          </ListItem>
          <ListItem className="social-li">
            <Link className="social-link text-decoration-none" to="/">
              <Box className="social-box">
                <img src={(Svg as any).discord} className="social-icons" alt="Discord" />
              </Box>
            </Link>
          </ListItem>
        </List>
      </Box>
    </>
  );
}
