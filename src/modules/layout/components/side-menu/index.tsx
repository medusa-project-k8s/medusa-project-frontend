"use client"

import { Popover, PopoverPanel, Transition } from "@headlessui/react"
import { XMark } from "@medusajs/icons"
import { Text } from "@medusajs/ui"
import { Fragment } from "react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

const SideMenuItems = {
  Home: "/",
  Store: "/store",
  Account: "/account",
  Cart: "/cart",
}

const SideMenu = () => {

  return (
    <div className="h-full">
      <div className="flex items-center h-full">
        <Popover className="h-full flex">
          {({ open, close }) => (
            <>
              <div className="relative flex h-full">
                <Popover.Button
                  data-testid="nav-menu-button"
                  className="relative h-full flex items-center text-brand-accent-dark uppercase transition-all ease-out duration-200 focus:outline-none hover:opacity-70"
                >
                  Menu
                </Popover.Button>
              </div>

              {open && (
                <>
                  {/* Fullscreen background image */}
                  <div 
                    className="fixed inset-0 bg-cover bg-center z-[49]"
                    style={{
                      backgroundImage: "url('/menu-bg.jpg')",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                    }}
                  />
                  {/* Backdrop overlay */}
                  <div
                    className="fixed inset-0 z-[50] bg-brand-accent-dark/20 pointer-events-auto"
                    onClick={close}
                    data-testid="side-menu-backdrop"
                  />
                </>
              )}

              <Transition
                show={open}
                as={Fragment}
                enter="transition ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="transition ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <PopoverPanel className="fixed inset-0 flex flex-col items-center justify-center z-[51]">
                  {/* Close button */}
                  <button 
                    data-testid="close-menu-button" 
                    onClick={close}
                    className="absolute top-6 right-6 text-white hover:opacity-70 transition-opacity z-10"
                  >
                    <XMark className="w-6 h-6" />
                  </button>

                  <div
                    data-testid="nav-menu-popup"
                    className="flex flex-col items-center justify-center relative z-10"
                  >
                    {/* Menu items - centered */}
                    <ul className="flex flex-col items-center justify-center gap-8 mb-12">
                      {Object.entries(SideMenuItems).map(([name, href]) => {
                        return (
                          <li key={name} className="text-center">
                            <LocalizedClientLink
                              href={href}
                              className="text-3xl md:text-4xl text-white hover:opacity-80 transition-all duration-300 uppercase tracking-wider font-light"
                              onClick={close}
                              data-testid={`${name.toLowerCase()}-link`}
                            >
                              {name}
                            </LocalizedClientLink>
                          </li>
                        )
                      })}
                    </ul>

                    {/* Footer - only copyright */}
                    <Text className="text-xs text-white text-center">
                      © {new Date().getFullYear()} Your Store. All rights reserved.
                    </Text>
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
