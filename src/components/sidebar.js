import React from "react";
import { Link } from "react-router-dom";
import Image from "./image";
import Icon from "./icon";
import ToggleTheme from "./ToggleTheme";
import Switch from "./switch";
import NavLink from "./navlink";
import UpgradeToPro from "./upgradetopro";
import { navigation } from "../constants/navigation";

export default function Sidebar({ className, visible, onClick }) {
  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 flex flex-col bg-theme-on-surface-1/95 backdrop-blur-lg border-r border-theme-stroke shadow-xl transition-all duration-300
        ${visible ? "w-[21.25rem] min-w-[18rem] pb-20 2xl:w-76 md:w-full md:pb-0" : "w-20 pb-[9.25rem]"}
        ${className || ""}`}
    >
      {/* Top Logo Row (mobile) */}
      <div
        className={`absolute top-0 left-0 right-0 flex items-center h-24 md:hidden ${
          visible ? "px-7" : "px-4"
        }`}
      >
        <Link className="flex justify-center items-center w-12 h-12" to="/">
          <Image
            className="w-10 opacity-100"
            src={"/images/logo-dark.svg"}
            width={40}
            height={40}
            alt="BitMart"
          />
        </Link>
      </div>
      {/* Sidebar collapse/expand toggle */}
      <button
        className={`group absolute w-12 h-12 md:hidden transition-all duration-150 ${
          visible ? "top-6 right-7" : "left-4 bottom-20"
        }`}
        onClick={onClick}
        aria-label="Toggle sidebar"
      >
        <Icon
          className="fill-theme-secondary opacity-50 transition group-hover:opacity-100 group-hover:fill-theme-primary"
          name="toggle"
        />
      </button>
      {/* Main Navigation */}
      <div
        className={`flex flex-col grow overflow-y-auto scroll-smooth scrollbar-none md:pb-6 transition-all duration-300 ${
          visible ? "px-6 md:px-4" : "px-4"
        }`}
      >
        <nav className="flex flex-col gap-1 mt-28 mb-auto md:mt-0">
          {navigation.map((link) => (
            <NavLink
              title={link.title}
              icon={link.icon}
              url={link.url}
              key={link.id}
              visible={visible}
            />
          ))}
        </nav>
        {/* Pro Upgrade call-to-action */}
        {visible && <UpgradeToPro />}
        {/* Utility Links/Controls (desktop only) */}
        <div className="hidden flex-col mt-8 pt-4 border-t border-theme-stroke gap-1 md:flex">
          <NavLink title="Contact support" icon="support" url="/support" visible={visible} />
          <div className="group flex items-center h-12 px-4 rounded-xl transition-colors hover:bg-theme-on-surface-2 md:hover:bg-transparent">
            <Icon
              className="shrink-0 mr-4 fill-theme-secondary transition-colors group-hover:fill-theme-primary md:group-hover:fill-theme-secondary"
              name={"moon"}
            />
            <div className="mr-auto text-base-1s text-theme-secondary transition-colors group-hover:text-theme-primary md:group-hover:text-theme-secondary">
              Dark Mode
            </div>
            <Switch small theme />
          </div>
          <NavLink title="News" icon="news" url="/news" visible={visible} />
          <NavLink title="Log out" icon="logout" url="/sign-up" visible={visible} />
        </div>
      </div>
      {/* Theme Toggle for Mobile */}
      <div
        className={`absolute left-0 right-0 bottom-0 pb-6 md:hidden transition-all duration-200 ${
          visible ? "pt-4 px-6" : "pt-2 px-4"
        }`}
      >
        <ToggleTheme visible={visible} />
      </div>
    </aside>
  );
}
