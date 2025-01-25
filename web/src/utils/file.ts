// import { GetCidQuery } from 'gql/graphql'
import pako from "pako";

export const detectFileType = async (
  arrayBuffer: ArrayBuffer
): Promise<string> => {
  const bytes = [...new Uint8Array(arrayBuffer.slice(0, 4))]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();

  // File type magic numbers and corresponding types
  const magicNumbers = {
    "89504E47": "image/png",
    FFD8FFE0: "image/jpeg", // JPEG start of image marker
    FFD8FFE1: "image/jpeg", // JPEG EXIF
    FFD8FFE2: "image/jpeg", // JPEG EXIF
    FFD8FFE3: "image/jpeg", // JPEG EXIF
    FFD8FFE8: "image/jpeg", // JPEG SPIFF
    FFD8FFDB: "image/jpeg", // JPEG quantization table marker
    FFD8FFEE: "image/jpeg", // JPEG comment marker
    "47494638": "image/gif",
    "25504446": "application/pdf",
    "504B0304": "application/zip", // Also covers .docx, .xlsx, etc.
    "1F8B08": "application/gzip",
    "504B34": "application/jar",
    "494433": "audio/mp3",
    "000001BA": "video/mpeg",
    "000001B3": "video/mpeg",
    "66747970": "video/mp4", // Part of MP4 signature
    "3C3F786D": "image/svg+xml", // SVG XML declaration <?xml
    "3C737667": "image/svg+xml", // SVG starting with <svg
    "252150532D": "application/postscript", // EPS files start with %!PS-
    "4D5A": "application/exe", // Windows executable
    CAFEBABE: "application/java", // Java class file
    D0CF11E0: "application/msword", // Microsoft Office document
    "377ABCAF271C": "application/7z", // 7-Zip archive
    "52617221": "application/rar", // RAR archive
    "424D": "image/bmp", // Bitmap image
    "49492A00": "image/tiff", // TIFF image
    "4D4D002A": "image/tiff", // TIFF image
    "1A45DFA3": "video/webm", // WebM video
    "00000100": "image/x-icon", // ICO file
    "4F676753": "audio/ogg", // OGG audio
    "52494646": "audio/wav", // WAV audio
    "2E524D46": "audio/aiff", // AIFF audio
    "00000020": "video/quicktime", // QuickTime video
    "3026B2758E66CF11": "video/x-ms-wmv", // WMV video
    "4D546864": "audio/midi", // MIDI audio
    "1F9D": "application/tar-compressed", // TAR compressed file
    "1FA0": "application/tar-compressed", // TAR compressed file
    "7573746172": "application/tar", // TAR archive
    "3C21444F43545950452068746D6C3E": "text/html", // HTML document
    "3C48544D4C3E": "text/html", // HTML document
    "3C3F786D6C20": "application/xml", // XML document
    "3C3F786D6C": "application/xml", // XML document
    "49443303": "audio/mpeg", // MP3 audio
    "38425053": "application/psd", // Adobe Photoshop file
    "7B5C727466": "application/rtf", // RTF document
    "3C21454E54495459": "text/html", // HTML document
    "4D5A9000": "application/exe", // Windows executable
  };

  // Check the magic number against known file types
  for (const [signature, type] of Object.entries(magicNumbers)) {
    if (bytes.startsWith(signature)) {
      return type;
    }
  }

  return "unknown"; // File type not recognized
};

const extractFileDataByType = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
  type: "file" | "folder" | "metadata",
  index: number = 0
) => {
  let rawData: string = "";
  let dataArrayBuffer: ArrayBuffer = new ArrayBuffer(0);
  let depth = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let uploadOptions: any;
  console.log("1. index", index);
  console.log("1. type", type);
  console.log("1. data", data["files_" + type + "s"][index]);
  try {
    if (
      data["files_" + type + "s"][index] &&
      data["files_" + type + "s"][index].chunk?.uploadOptions
    ) {
      uploadOptions = JSON.parse(
        data["files_" + type + "s"][index].chunk?.uploadOptions
      );
      if (uploadOptions.encryption && uploadOptions.encryption.algorithm)
        return { rawData, dataArrayBuffer, isEncrypted: true, uploadOptions };
    }
  } catch (error) {
    console.error("Error checking uploadOptions:", error);
  }

  if (
    data["files_" + type + "s"][index] &&
    data["files_" + type + "s"][index][type + "_cids"].length === 0
  ) {
    rawData = data["files_" + type + "s"][index].chunk?.data ?? "";
    console.log("rawData", rawData);
    dataArrayBuffer = Object.values(
      JSON.parse(rawData)
    ) as unknown as ArrayBuffer;
  } else {
    if (
      data["files_" + type + "s"][index] &&
      data["files_" + type + "s"][index]
    ) {
      depth = data["files_" + type + "s"][index][type + "_cids"].length;
      let index2 = 0;
      while (depth > index2) {
        const _data =
          data["files_" + type + "s"][index][type + "_cids"][index2].chunk
            ?.data ?? "";
        const newData = Object.values(
          JSON.parse(_data)
        ) as unknown as ArrayBuffer;
        dataArrayBuffer = new Uint8Array([
          ...new Uint8Array(dataArrayBuffer),
          ...new Uint8Array(newData),
        ]).buffer;
        rawData = _data;
        index2++;
      }
    }
  }
  try {
    console.log("1. uploadOptions", uploadOptions);
    if (
      uploadOptions.compression &&
      uploadOptions.compression.algorithm === "ZLIB"
    ) {
      dataArrayBuffer = pako.inflate(
        new Uint8Array(dataArrayBuffer)
      ) as unknown as ArrayBuffer;
    }
  } catch (error) {
    console.error("Error decompressing data:", error);
  }
  return { rawData, dataArrayBuffer, isEncrypted: false, uploadOptions };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const extractFileData = (data: any, index: number = 0) => {
  if (data.files_files.length > 0)
    return extractFileDataByType(data, "file", index);
  else if (data.files_folders.length > 0)
    return extractFileDataByType(data, "folder", index);
  return extractFileDataByType(data, "metadata", index);
};
