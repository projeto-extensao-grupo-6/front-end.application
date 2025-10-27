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
      <Toolbar
        className="
          flex justify-between items-center
          !min-h-[65px] sm:!min-h-[75px] md:!min-h-[80px]
          px-3 sm:px-6 md:px-10
          transition-all duration-300
        "
      >
        {/* Menu + Logo */}
        <div className="flex items-center">
          <IconButton
            color="inherit"
            onClick={toggleSidebar}
            className={`transition-transform duration-300 ${
              sidebarOpen ? "rotate-90" : "rotate-0"
            }`}
          >
            <MenuIcon fontSize="medium" />
          </IconButton>

          {/* Logo responsivo */}
          <img
            src={Logo}
            alt="Logo"
            className="ml-2 h-8 sm:h-10 md:h-12 transition-all duration-300"
          />
        </div>

        {/* Usuário */}
        <div
          className="flex items-center gap-1 sm:gap-2 cursor-pointer"
          onClick={handleProfileClick}
        >
          {/* Só mostra nome/cargo em telas médias pra cima */}
          <div className="hidden sm:block text-right mr-1">
            <p className="text-xs sm:text-sm font-semibold">Julio Cesar</p>
            <p className="text-[11px] sm:text-xs text-gray-300">Cargo</p>
          </div>

          {/* Avatar responsivo */}
          <Avatar
            src={UserImg}
            className="!w-10 !h-10 sm:!w-12 sm:!h-12 md:!w-14 md:!h-14"
          />

          {/* Ícone de seta */}
          <ExpandMore
            className={`text-white transition-transform duration-300 ${
              open ? "rotate-180" : "rotate-0"
            } hidden sm:block`}
          />
        </div>

        {/* Menu suspenso */}
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
