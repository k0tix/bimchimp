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
import { api, api as mockApi } from "../lib/api";
import { File, Icon } from "lucide-react";
import { fileToBase64 } from "../lib/utils";
import { useProducts } from "./contexts/files";
import { toast } from "sonner";
import Spinner from "./Spinner";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Separator } from "@radix-ui/react-separator";

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
        <SidebarHeader>
          <div className="flex fle-row items-center">
            <img src="/chimp.jpg" alt="Logo" className="rounded-xl w-16 h-16" />
            <span className="text-lg font-mono ml-8">BIMCHIMP</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>
              <div className="flex justify-between items-center w-full">
                <span>Processed files</span>
                {filesLoading && <Spinner />}
              </div>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem className="overflow-y-auto max-h-[50vh]">
                  {availableFiles.map((file) => (
                    <SidebarMenuButton
                      className="mb-1"
                      isActive={currentFile?.id === file.id}
                      key={file.id}
                      onClick={async () => {
                        const fileblob = await mockApi.getFileBlob(file.id);

                        if (fileblob.size === 0) {
                          toast("Failed to load file", {
                            description: `Failed to load file ${file.title}, it seems to be empty :)`,
                            action: {
                              label: "Ok",
                              onClick: () => {},
                            },
                          });

                          return;
                        }

                        setCurrentFile(file);
                        PubSub.publish("loadBimFile", fileblob);
                      }}
                    >
                      <File size={24} />
                      {file.title}
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

                      const splittedFileName = file.name.split(".");
                      const fileName = splittedFileName[0];
                      const fileExtension = splittedFileName[1];

                      if (fileExtension !== "ifc") {
                        toast("Invalid file type", {
                          description: "Please upload an IFC file",
                          action: {
                            label: "Ok",
                            onClick: () => {},
                          },
                        });

                        // Reset the input
                        e.target.value = "";

                        return;
                      }

                      api.uploadFile(file).then((fileId) => {
                        toast("File uploaded", {
                          description: `File ${fileName} uploaded successfully, id: ${fileId}`,
                          action: {
                            label: "Ok",
                            onClick: () => {},
                          },
                        });

                        e.target.value = "";
                      });
                    }}
                  />
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup />
        </SidebarContent>
        <SidebarFooter>
          {currentFile && (
            <>
              {currentFile.stats.products.length > 0 && (
                <Table className="bg-card round-xl">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Product</TableHead>
                      <TableHead>Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentFile.stats.products.map((stat) => (
                      <TableRow key={stat.label ?? "Not selected"}>
                        <TableCell>{stat.label ?? "Not selected"}</TableCell>
                        <TableCell>{stat.amount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              {currentFile.stats.clash_types.length > 0 && (
                <Table className="bg-card round-xl">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Joint</TableHead>
                      <TableHead>Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentFile.stats.clash_types.map((stat) => (
                      <TableRow key={stat.label ?? "Unknown"}>
                        <TableCell>{stat.label ?? "Unknown"}</TableCell>
                        <TableCell>{stat.amount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </>
          )}

          <div className="flex flex-row items-center justify-between mt-4">
            <span className="text-xs">BIMCHIMP 2024</span>
            <span className="text-xs">v1.0.0</span>
          </div>
        </SidebarFooter>
      </Sidebar>
    </>
  );
};

export default SideBar;
