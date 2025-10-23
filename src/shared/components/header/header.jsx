import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Fade,
} from "@mui/material";
import { Menu as MenuIcon, ExpandMore } from "@mui/icons-material";
import Logo from "../../../assets/logo/logo.png";
import UserImg from "../../../assets/User.png";

export default function Header({ toggleSidebar, sidebarOpen }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleProfileClick = (event) => setAnchorEl(event.currentTarget);
  const handleProfileClose = () => setAnchorEl(null);

return (
    <AppBar
        position="fixed"
        className="!bg-[#003d6b] !shadow-lg z-[1100]"
    >
        <Toolbar className="!min-h-[75px] flex justify-between">
            <div className="flex items-center">
                <IconButton
                    color="inherit"
                    onClick={toggleSidebar}
                    className={`transition-transform duration-300 ${
                        sidebarOpen ? "rotate-90" : "rotate-0"
                    }`}
                >
                    <MenuIcon />
                </IconButton>
                <img src={Logo} alt="Logo" className="h-10 ml-2" />
            </div>

            <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={handleProfileClick}
            >
                <div className="text-right mr-1">
                    <p className="text-sm font-semibold">Julio Cesar</p>
                    <p className="text-sm text-gray-300">Cargo</p>
                </div>
                <Avatar src={UserImg} className="!w-14 !h-14" />
                <ExpandMore
                    className={`text-white transition-transform duration-300 ${
                        open ? "rotate-180" : "rotate-0"
                    }`}
                />
            </div>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleProfileClose}
                TransitionComponent={Fade}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                PaperProps={{
                    sx: {
                        bgcolor: "#004080",
                        color: "white",
                        borderRadius: 2,
                        minWidth: 160,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                    },
                }}
            >
                <MenuItem onClick={handleProfileClose}>Meu Perfil</MenuItem>
                <MenuItem onClick={handleProfileClose}>Configurações</MenuItem>
                <Divider sx={{ bgcolor: "#0050b3" }} />
                <MenuItem onClick={handleProfileClose}>Sair</MenuItem>
            </Menu>
        </Toolbar>
    </AppBar>
);
}