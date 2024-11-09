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
import { fileToBase64 } from "../lib/utils";
import { useProducts } from "./contexts/files";

const SideBar: React.FC = () => {
  const { availableFiles, setAvailableFiles, currentFile, setCurrentFile } =
    useProducts();

  const [filesLoading, setFilesLoading] = React.useState(false);

  const loadFiles = async () => {
    setFilesLoading(true);

    mockApi.getAvailableFiles().then((files) => {
      setAvailableFiles(files);
      setFilesLoading(false);
    });
  };

  React.useEffect(() => {
    loadFiles();

    const interval = setInterval(() => {
      console.log("Reloading files...");
      loadFiles();
    }, 15 * 1000);

    return () => clearInterval(interval);
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
                      className="mb-1"
                      isActive={currentFile?.id === file.id}
                      key={file.id}
                      onClick={async () => {
                        const fileblob = await mockApi.getFileBlob(file.id);
                        setCurrentFile(file);
                        PubSub.publish("loadBimFile", fileblob);
                      }}
                    >
                      <File size={24} />
                      {file.name}
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
                      const file = e.target.files?.[0];

                      if (!file) {
                        return;
                      }

                      const fileName = file.name.split(".")[0];
                      const fileAsBase64 = await fileToBase64(file);

                      console.log("File as base64:", fileAsBase64);

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
