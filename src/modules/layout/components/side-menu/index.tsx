"use client"

import { Popover, PopoverPanel, Transition } from "@headlessui/react"
import { ArrowRightMini, XMark } from "@medusajs/icons"
import { Text, clx, useToggleState } from "@medusajs/ui"
import { Fragment } from "react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CountrySelect from "../country-select"
import { HttpTypes } from "@medusajs/types"

const SideMenuItems = {
  Home: "/",
  Store: "/store",
  Account: "/account",
  Cart: "/cart",
}

const SideMenu = ({ regions }: { regions: HttpTypes.StoreRegion[] | null }) => {
  const toggleState = useToggleState()

  return (
    <div className="h-full">
      <div className="flex items-center h-full">
        <Popover className="h-full flex">
          {({ open, close }) => (
            <>
              <div className="relative flex h-full">
                <Popover.Button
                  data-testid="nav-menu-button"
                  className="relative h-full flex items-center text-brand-accent-dark uppercase text-sm transition-all ease-out duration-200 focus:outline-none hover:opacity-70"
                >
                  Menu
                </Popover.Button>
              </div>

              {open && (
                <div
                  className="fixed inset-0 z-[50] bg-brand-accent-dark/20 pointer-events-auto"
                  onClick={close}
                  data-testid="side-menu-backdrop"
                />
              )}

              <Transition
                show={open}
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 -translate-x-full"
                enterTo="opacity-100 translate-x-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-x-0"
                leaveTo="opacity-0 -translate-x-full"
              >
                <PopoverPanel 
                  className="fixed left-0 top-0 bottom-0 w-full sm:w-80 z-[51] shadow-lg"
                  style={{
                    backgroundImage: "url('/menu-bg.jpg')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                  }}
                >
                  <div className="relative h-full w-full bg-brand-primary/60">
                    <div
                      data-testid="nav-menu-popup"
                      className="flex flex-col h-full relative z-10"
                    >
                    {/* Header with close button */}
                    <div className="flex justify-between items-center p-6 border-b border-brand-accent/20">
                      <span className="text-sm uppercase tracking-wide text-brand-accent-dark font-semibold">Menu</span>
                      <button 
                        data-testid="close-menu-button" 
                        onClick={close}
                        className="text-brand-accent-dark hover:opacity-70 transition-opacity"
                      >
                        <XMark className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Menu items */}
                    <div className="flex-1 overflow-y-auto p-6">
                      <ul className="flex flex-col gap-6">
                        {Object.entries(SideMenuItems).map(([name, href]) => {
                          return (
                            <li key={name}>
                              <LocalizedClientLink
                                href={href}
                                className="text-2xl md:text-3xl text-brand-accent-dark hover:text-brand-accent transition-colors uppercase tracking-wide"
                                onClick={close}
                                data-testid={`${name.toLowerCase()}-link`}
                              >
                                {name}
                              </LocalizedClientLink>
                            </li>
                          )
                        })}
                      </ul>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-brand-accent/20 p-6 space-y-4">
                      <div
                        className="flex justify-between items-center"
                        onMouseEnter={toggleState.open}
                        onMouseLeave={toggleState.close}
                      >
                        {regions && (
                          <CountrySelect
                            toggleState={toggleState}
                            regions={regions}
                          />
                        )}
                        <ArrowRightMini
                          className={clx(
                            "transition-transform duration-150 text-brand-accent-dark",
                            toggleState.state ? "-rotate-90" : ""
                          )}
                        />
                      </div>
                      <Text className="text-xs text-brand-accent-dark">
                        © {new Date().getFullYear()} Your Store. All rights reserved.
                      </Text>
                    </div>
                  </div>
                  </div>
                </PopoverPanel>
              </Transition>
            </>
          )}
        </Popover>
      </div>
    </div>
  )
}

export default SideMenu
