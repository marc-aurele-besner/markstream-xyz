"use client";

import { FileSnippet } from "@/components/file-snippet";
import { Menu } from "@/components/menu";
import { PodcastEmptyPlaceholder } from "@/components/podcast-empty-placeholder";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { labels } from "@/data/labels";
import { LastFilesQuery, useLastFilesSuspenseQuery } from "@/gql/graphql";
import { PlusCircle } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

export default function HomePage() {
  const [data, setData] = useState<LastFilesQuery | null>(null);

  const getData = useCallback(async () => {
    const { data } = await useLastFilesSuspenseQuery({
      variables: {},
    });
    if (data) setData(data);
  }, []);

  useEffect(() => {
    getData();
  }, []);

  return (
    <>
      <div className="md:hidden">
        <Image
          src="/music-light.png"
          width={1280}
          height={1114}
          alt="Music"
          className="block dark:hidden"
        />
        <Image
          src="/music-dark.png"
          width={1280}
          height={1114}
          alt="Music"
          className="hidden dark:block"
        />
      </div>
      <div className="hidden md:block">
        <Menu />
        <div className="border-t">
          <div className="bg-background">
            <div className="grid lg:grid-cols-5">
              <Sidebar labels={labels} className="hidden lg:block" />
              <div className="col-span-3 lg:col-span-4 lg:border-l">
                <div className="h-full px-4 py-6 lg:px-8">
                  <Tabs defaultValue="files" className="h-full space-y-6">
                    <div className="space-between flex items-center">
                      <TabsList>
                        <TabsTrigger value="files" className="relative">
                          Files
                        </TabsTrigger>
                        <TabsTrigger value="folders">Folders</TabsTrigger>
                      </TabsList>
                      <div className="ml-auto mr-4">
                        <Button>
                          <PlusCircle />
                          Add label
                        </Button>
                      </div>
                    </div>
                    <TabsContent
                      value="files"
                      className="border-none p-0 outline-none"
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h2 className="text-2xl font-semibold tracking-tight">
                            Files
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            Latest files uploaded on Autonomys Network
                          </p>
                        </div>
                      </div>
                      <Separator className="my-4" />
                      <div className="relative">
                        <ScrollArea>
                          <div className="flex space-x-4 pb-4">
                            {data &&
                              data.files_files.map(
                                (
                                  file: LastFilesQuery["files_files"][number],
                                  index: number
                                ) => (
                                  <FileSnippet
                                    key={index}
                                    file={file}
                                    className="w-[250px]"
                                  />
                                )
                              )}
                          </div>
                          <ScrollBar orientation="horizontal" />
                        </ScrollArea>
                      </div>
                      {/* <div className="mt-6 space-y-1">
                        <h2 className="text-2xl font-semibold tracking-tight">
                          Made for You
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          Your personal playlists. Updated daily.
                        </p>
                      </div>
                      <Separator className="my-4" />
                      <div className="relative">
                        <ScrollArea>
                          <div className="flex space-x-4 pb-4">
                            {data.files_files.map(
                              (file: any, index: number) => (
                                <FileSnippet
                                  key={index}
                                  file={file}
                                  className="w-[250px]"
                                  aspectRatio="portrait"
                                  width={250}
                                  height={330}
                                />
                              )
                            )}
                          </div>
                          <ScrollBar orientation="horizontal" />
                        </ScrollArea>
                      </div> */}
                    </TabsContent>
                    <TabsContent
                      value="folders"
                      className="border-none p-0 outline-none"
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h2 className="text-2xl font-semibold tracking-tight">
                            Folders
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            Latest folders uploaded on Autonomys Network
                          </p>
                        </div>
                      </div>
                      <Separator className="my-4" />
                      <div className="relative">
                        <ScrollArea>
                          <div className="flex space-x-4 pb-4">
                            {/* {data.files_files.map(
                              (
                                file: LastFilesQuery["files_files"][number],
                                index: number
                              ) => (
                                <FileSnippet
                                  key={index}
                                  file={file}
                                  className="w-[250px]"
                                />
                              )
                            )} */}
                          </div>
                          <ScrollBar orientation="horizontal" />
                        </ScrollArea>
                      </div>
                      {/* <div className="mt-6 space-y-1">
                        <h2 className="text-2xl font-semibold tracking-tight">
                          Made for You
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          Your personal playlists. Updated daily.
                        </p>
                      </div>
                      <Separator className="my-4" />
                      <div className="relative">
                        <ScrollArea>
                          <div className="flex space-x-4 pb-4">
                            {data.files_files.map(
                              (file: any, index: number) => (
                                <FileSnippet
                                  key={index}
                                  file={file}
                                  className="w-[250px]"
                                  aspectRatio="portrait"
                                  width={250}
                                  height={330}
                                />
                              )
                            )}
                          </div>
                          <ScrollBar orientation="horizontal" />
                        </ScrollArea>
                      </div> */}
                    </TabsContent>
                    <TabsContent
                      value="podcasts"
                      className="h-full flex-col border-none p-0 data-[state=active]:flex"
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h2 className="text-2xl font-semibold tracking-tight">
                            New Episodes
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            Your favorite podcasts. Updated daily.
                          </p>
                        </div>
                      </div>
                      <Separator className="my-4" />
                      <PodcastEmptyPlaceholder />
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
