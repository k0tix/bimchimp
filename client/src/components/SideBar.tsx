import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";
import { Input } from "./ui/input";

const SideBar: React.FC = () => {
  return (
    <>
      <Sidebar>
        <SidebarHeader>BIM CHIMP 🙉</SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Files</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => {
                      PubSub.publish("loadBimFile", "/c.wexBIM");
                    }}
                  >
                    c.ifc
                  </SidebarMenuButton>
                  <SidebarMenuButton
                    onClick={() => {
                      PubSub.publish("loadBimFile", "/space.wexbim");
                    }}
                  >
                    space.ifc
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* <Separator /> */}

                <div className="flex items-center gap-4" data-id="1">
                  <div
                    data-orientation="horizontal"
                    role="none"
                    className="bg-border h-[1px] w-full flex-1"
                    data-id="2"
                  ></div>
                  <span className="text-muted-foreground" data-id="3">
                    or
                  </span>
                  <div
                    data-orientation="horizontal"
                    role="none"
                    className="bg-border h-[1px] w-full flex-1"
                    data-id="4"
                  ></div>
                </div>

                <SidebarMenuItem key={"asdasd"}>
                  <Input
                    id="ifc-file"
                    type="file"
                    className="bg-card h-16 items-center text-center"
                  />
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup />
        </SidebarContent>
        <SidebarFooter />
      </Sidebar>
    </>
  );
};

export default SideBar;
