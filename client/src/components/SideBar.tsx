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
import { mockApi } from "../lib/api";
import { File, Icon } from "lucide-react";

const SideBar: React.FC = () => {
  const [filesLoading, setFilesLoading] = React.useState(false);
  const [availableFiles, setAvailableFiles] = React.useState<string[]>([]);

  React.useEffect(() => {
    setFilesLoading(true);
    mockApi.getAvailableFiles().then((files) => {
      setAvailableFiles(files);
      setFilesLoading(false);
    });
  }, []);

  return (
    <>
      <Sidebar>
        <SidebarHeader>BIM CHIMP 🙉</SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Processed files</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  {filesLoading && "Loading files..."}

                  {availableFiles.map((file) => (
                    <SidebarMenuButton
                      key={file}
                      onClick={async () => {
                        const fileblob = await mockApi.getFileBlob(file);

                        PubSub.publish("loadBimFile", fileblob);
                      }}
                    >
                      <File size={24} />
                      {file}
                    </SidebarMenuButton>
                  ))}
                </SidebarMenuItem>

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

                <SidebarMenuItem>
                  <Input
                    id="ifc-file"
                    type="file"
                    className="bg-card h-16 items-center text-center"
                    onChange={async (e) => {
                      // do nothing for now
                      return;
                      // const file = e.target.files?.[0];
                      // if (file) {
                      //   const formData = new FormData();
                      //   formData.append("file", file);

                      //   try {
                      //     const response = await fetch("/upload", {
                      //       method: "POST",
                      //       body: formData,
                      //     });

                      //     if (response.ok) {
                      //       const result = await response.json();
                      //       const wexbimFile = result.wexbimFile;

                      //       PubSub.publish("loadBimFile", wexbimFile);
                      //     } else {
                      //       console.error("Failed to upload file");
                      //     }
                      //   } catch (error) {
                      //     console.error("Error uploading file:", error);
                      //   }
                      // }
                    }}
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
