import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "./icon";
import Modal from "./modal";
import Trade from "./trade";
import User from "./user";
import Image from "./image";
import Notifications from "./notifications";
import Search from "./search";

export default function Header({ title, visible, showMenu, onClickBurger }) {
  const navigate = useNavigate();
  const [visibleModalSearch, setVisibleModalSearch] = useState(false);
  const [visibleModalTrade, setVisibleModalTrade] = useState(false);

  return (
    <>
      <header
        className={`fixed top-0 right-0 z-30 w-full bg-theme-on-surface-1/80 backdrop-blur-md border-b border-theme-stroke transition-colors duration-200 ${
          visible
            ? "left-[21.25rem] 2xl:left-76 xl:left-20 md:left-0"
            : "left-20 md:left-0"
        } ${showMenu ? "md:!bg-theme-on-surface-1" : ""}`}
      >
        <div
          className={`flex items-center h-20 md:h-16 max-w-7xl mx-auto px-10 lg:px-6 md:px-4 transition-shadow duration-200 ${
            showMenu
              ? "shadow-depth-1 dark:shadow-[inset_0_0_0_0.125rem_#272B30]"
              : ""
          }`}
        >
          {/* Logo for desktop */}
          <a className="hidden md:block mr-auto" href="/">
  <img
    className="h-12 w-auto drop-shadow-lg"
    src={require("./bitmartlogo.svg")}
    alt="BitMart"
    style={{ maxHeight: 48 }}
  />
</a>
          {/* Back button for mobile */}
          <button
            className="group inline-flex items-center mr-auto text-h5 md:hidden"
            onClick={() => navigate(-1)}
          >
            <div className="flex justify-center items-center w-10 h-10 mr-3.5 lg:mr-1 rounded-full bg-theme-on-surface-2">
              <Icon
                className="fill-theme-primary transition-transform group-hover:-translate-x-0.5"
                name="arrow-left"
              />
            </div>
            <span className="text-base-1s">{title}</span>
          </button>
          {/* Right controls */}
          <div className="flex items-center ml-auto gap-4 sm:gap-2">
            <button
              className="btn btn-primary px-5 py-2 rounded-full font-bold shadow md:hidden"
              onClick={() => setVisibleModalTrade(true)}
            >
              Buy & Sell
            </button>
            <button
              className="group w-12 h-12 md:w-8 md:h-8 flex items-center justify-center rounded-full hover:bg-theme-on-surface-2 transition"
              onClick={() => setVisibleModalSearch(true)}
            >
              <Icon
                className="fill-theme-secondary transition-colors group-hover:fill-theme-primary"
                name="search"
              />
            </button>
            <Notifications />
            <button
              className={`hidden md:block rounded-full overflow-hidden transition-shadow md:w-9 md:h-9 ${
                showMenu ? "shadow-[0_0_0_0.125rem_#0C68E9]" : ""
              }`}
              onClick={onClickBurger}
            >
              <Image
                className="w-9 h-9 object-cover rounded-full opacity-100"
                src="/images/avatar.jpg"
                width={36}
                height={36}
                alt="User"
              />
            </button>
            <User className="md:hidden" />
          </div>
        </div>
      </header>
      <Modal
        classWrap="max-w-[40rem] !p-0 rounded-3xl overflow-hidden"
        visible={visibleModalSearch}
        onClose={() => setVisibleModalSearch(false)}
      >
        <Search />
      </Modal>
      <Modal
        classWrap="p-8 md:!px-4 md:!py-6"
        visible={visibleModalTrade}
        onClose={() => setVisibleModalTrade(false)}
      >
        <Trade />
      </Modal>
    </>
  );
}
