"use client";

import MarkStreamLabelAbi from "@/abis/MarkStreamLabel.json";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { LastFilesQuery } from "@/gql/indexer/graphql";
import { SubgraphLabelsQuery } from "@/gql/subgraph/graphql";
import { cn } from "@/lib/utils";
import { detectFileType, extractFileData } from "@/utils/file";
import { blake3HashFromCid, stringToCid } from "@autonomys/auto-dag-data";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { PlusCircle } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount, useWriteContract } from "wagmi";

interface AlbumArtworkProps extends React.HTMLAttributes<HTMLDivElement> {
  labels: SubgraphLabelsQuery["labels"];
  file: LastFilesQuery["files_files"][number];
}

type PreviewData = {
  type: string;
  data: ArrayBuffer;
  isEncrypted: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uploadOptions: any;
};

export function FileSnippet({
  labels,
  file,
  className,
  ...props
}: AlbumArtworkProps) {
  console.log("1. file", file);
  const [rawData, setRawData] = useState<PreviewData | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const { address, isConnected, chain } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { writeContractAsync } = useWriteContract();

  const getDataTypes = useCallback(async () => {
    const { dataArrayBuffer, isEncrypted, uploadOptions } = extractFileData({
      files_files: [file],
    });
    if (!dataArrayBuffer) return;
    const fileType = await detectFileType(dataArrayBuffer);
    console.log(fileType);
    setRawData({
      type: fileType,
      data: dataArrayBuffer,
      isEncrypted,
      uploadOptions,
    });
  }, [file]);

  const getPreviewUrl = useCallback((rawData: PreviewData) => {
    if (rawData) {
      if (rawData.type.startsWith("image/svg")) {
        const url = `data:${rawData.type};charset=utf-8,${encodeURIComponent(
          Buffer.from(rawData.data).toString("utf-8")
        )}`;
        setImageSrc(url);
        return () => {};
      } else {
        const url = URL.createObjectURL(
          new Blob([rawData.data], { type: rawData.type })
        );
        setImageSrc(url);
        return () => {
          URL.revokeObjectURL(url);
        };
      }
    }
  }, []);

  const preview = useMemo(() => {
    if (!imageSrc) return <></>;

    switch (true) {
      case rawData?.isEncrypted:
        return (
          <div className="flex items-center">
            {/* <LockClosedIcon className={'ml-2 size-6 shrink-0'} stroke='#DE67E4' /> */}
            <p className="text-sm font-medium text-grayDarker dark:text-white md:text-xl">
              No preview available for encrypted files
            </p>
          </div>
        );
      case rawData?.type.startsWith("image"):
        return (
          <Image
            src={imageSrc}
            alt="File Preview"
            width={520}
            height={520}
            style={{ width: "50%", height: "auto" }}
          />
        );
      case rawData?.type.startsWith("application/pdf"):
      case rawData?.type.startsWith("application/ai"):
        return (
          <object
            data={imageSrc}
            type={rawData?.type}
            width="100%"
            height="800px"
          >
            <p>
              Alternative text - include a link{" "}
              <a href={imageSrc}>to the PDF!</a>
            </p>
          </object>
        );
      case rawData && rawData?.type && rawData !== null: {
        try {
          const ReactJson = dynamic(() => import("react-json-view"), {
            ssr: false,
          });
          const rawDataString = Buffer.from(rawData.data).toString("utf-8");
          const data = JSON.parse(rawDataString);
          console.log("data", data);
          return (
            <div className="border-blueLight bg-blueLight mb-4 w-full break-all rounded-lg border p-4 shadow dark:border-none dark:bg-white/10">
              <ReactJson
                src={data}
                iconStyle="circle"
                // theme={theme}
                collapseStringsAfterLength={20}
                shouldCollapse={(field) => {
                  return field.type === "object" &&
                    Object.entries(field.src).length > 6
                    ? true
                    : false;
                }}
              />
            </div>
          );
        } catch {
          return <div>No preview available</div>;
        }
      }
      default:
        return <div>No preview available</div>;
    }
  }, [imageSrc, rawData]);

  useEffect(() => {
    getDataTypes();
  }, [getDataTypes]);

  useEffect(() => {
    if (rawData) getPreviewUrl(rawData);
  }, [rawData, getPreviewUrl]);

  return (
    <div className={cn("space-y-3", className)} {...props}>
      <ContextMenu>
        <ContextMenuTrigger>
          <div className="overflow-hidden rounded-md">{preview}</div>
        </ContextMenuTrigger>
        {isConnected ? (
          <ContextMenuContent className="w-40">
            <ContextMenuItem disabled>Add to favorites</ContextMenuItem>
            <ContextMenuSub>
              <ContextMenuSubTrigger>Add label</ContextMenuSubTrigger>
              <ContextMenuSubContent className="w-48">
                <ContextMenuItem disabled>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Label
                </ContextMenuItem>
                <ContextMenuSeparator />
                {labels.map((label) => (
                  <ContextMenuItem
                    key={label.id}
                    onClick={async () => {
                      const fileHash =
                        "0x" +
                        Buffer.from(
                          blake3HashFromCid(stringToCid(file.id))
                        ).toString("hex");
                      // const fileCidVerified = cidToString(
                      //   cidFromBlakeHash(Buffer.from(fileHash, "hex"))
                      // );

                      await writeContractAsync({
                        address: "0xbCB71d4dA1F96109690eB8b48a154e4a9088D951",
                        abi: MarkStreamLabelAbi,
                        functionName: "upVoteFileLabel",
                        args: [fileHash, label.labelId],
                      });
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="mr-2 h-4 w-4"
                      viewBox="0 0 24 24"
                    >
                      <path d="M21 15V6M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM12 12H3M16 6H3M12 18H3" />
                    </svg>
                    {label.description}
                  </ContextMenuItem>
                ))}
              </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuSeparator />
            <ContextMenuItem disabled>No labels</ContextMenuItem>
            {/* <ContextMenuItem>Play Later</ContextMenuItem>
          <ContextMenuItem>Create Station</ContextMenuItem> */}
            <ContextMenuSeparator />
            <ContextMenuItem>Report</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem>Like</ContextMenuItem>
            <ContextMenuItem>Share</ContextMenuItem>
          </ContextMenuContent>
        ) : (
          <ContextMenuContent className="w-40">
            <ContextMenuItem onClick={openConnectModal}>
              Connect wallet
            </ContextMenuItem>
          </ContextMenuContent>
        )}
      </ContextMenu>
      <div className="space-y-1 text-sm">
        <h3 className="font-medium leading-none">{file && file.name}</h3>
        <p className="text-xs text-muted-foreground text-wrap break-all">
          {file && file.id}
        </p>
      </div>
    </div>
  );
}
