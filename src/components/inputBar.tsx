"use client";

import TextareaAutosize from "react-textarea-autosize";
import {
  ChangeEvent,
  Dispatch,
  FormEvent,
  SetStateAction,
  useCallback,
  useState,
} from "react";
import { ChatRequestOptions, CreateMessage, Message } from "ai";
import { Toggle } from "@/components/toogle";
import { Brain, FilePdf, Lightning, XCircle } from "@phosphor-icons/react";
import { Plus, CircleNotch } from "@phosphor-icons/react";
import { useDropzone } from "react-dropzone";

interface InputBarProps {
  setCollectionName: Dispatch<SetStateAction<string>>;
  value: string;
  onChange: (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>,
  ) => void;
  isFast: boolean;
  setIsFast: (arg0: boolean) => void;
  username: string;
  userId: string;
  chatId: string;
  orgSlug: string;
  orgId: string;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions | undefined,
  ) => Promise<string | null | undefined>;
  setInput: Dispatch<SetStateAction<string>>;
  isChatCompleted: boolean;
}

const InputBar = (props: InputBarProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    if (props.value.trim() === "") {
      return;
    }
    const message = {
      role: "user",
      content: props.value,
      name: `${props.username},${props.userId}`,
    };
    props.append(message as Message);
    props.setInput("");
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log("accepted file", acceptedFiles[0]);
    setFile(acceptedFiles[0]);
    props.setInput(acceptedFiles[0].name);
  }, []);

  const removeFile = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.preventDefault();
      e.stopPropagation();
      setFile(null);
      props.setInput("");
    },
    [],
  );

  const onDropCallback = useCallback(
    (acceptedFiles: File[]) => {
      onDrop(acceptedFiles);
    },
    [onDrop],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropCallback,
    accept: { "application/pdf": [".pdf"] },
  });

  const handleFileUpload = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);
    console.log("uploading");
    props.setInput("Getting url to upload");
    if (file) {
      const response = await fetch(`/api/postPdf`, {
        method: "POST",
        body: JSON.stringify({
          fileName: file?.name,
          fileType: file?.type,
          username: props.username,
          userId: props.userId,
          chatId: props.chatId,
          orgSlug: props.orgSlug,
          orgId: props.orgId,
        }),
      });
      const data = await response.json();
      const { postUrl, getUrl } = data;
      props.setInput("Uploading...");
      console.log("getUrl", getUrl);
      const upload = await fetch(postUrl, {
        method: "PUT",
        body: file,
      });

      props.setInput("Generating Embeddings");
      try {
        const response = await fetch(`${process.env.EMBEDDING_ENDPOINT}`, {
          method: "POST",
          body: JSON.stringify({
            url: getUrl,
          }),
        });

        const data = await response.json();
        console.log("data", data);
      } catch (err) {
        console.log("err", err);
      }

      // testing the get url
      // try{
      //   let file = await fetch(getUrl);
      //   console.log("file", await file.json())
      // } catch(err) {
      //   console.log("jsonn error", err)
      // }

      if (upload.ok) {
        console.log("Uploaded successfully!");
      } else {
        console.error("Upload failed.");
      }
    }
    setIsUploading(false);
    setFile(null);
    props.setInput("");
    // setOpen(false)
  };

  return (
    <form onSubmit={!!file ? handleFileUpload : handleSubmit}>
      <div className="flex bg-linear-900 p-2 pt-2 rounded-sm  ">
        <Toggle
          disabled={props.isChatCompleted}
          className="mr-2"
          pressed={props.isFast}
          onPressedChange={() => props.setIsFast(!props.isFast)}
        >
          {props.isFast ? <Brain /> : <Lightning />}
        </Toggle>
        <div className="w-full relative">
          <TextareaAutosize
            disabled={props.isChatCompleted || isUploading}
            maxRows={10}
            rows={!!file ? 2 : 1}
            // placeholder={!!file ? "" : "Type your message here..."}
            autoFocus
            value={props.value}
            onChange={props.onChange}
            className={`w-full flex-none resize-none rounded-sm grow bg-linear-400 border border-linear-50 text-gray-200 p-2 text-sm ${
              !!file ? "pl-20" : ""
            }`}
          />
          {!!file && (
            <div className="absolute top-0 left-4">
              {" "}
              <FilePdf
                size={36}
                className="absolute top-0"
                color="#fafafa"
                weight="bold"
              />
              <button
                type="button"
                className="absolute top-0 left-8"
                onClick={removeFile}
              >
                <XCircle color="#ffffff" weight="bold" />
              </button>
            </div>
          )}
          {!!!file && (
            <button
              type="button"
              className="absolute right-4 top-2"
              disabled={props.isChatCompleted}
              {...getRootProps()}
            >
              <input {...getInputProps()} />
              <Plus color="white" />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="p-2 text-green-400 hover:text-green-100 flex justify-end disabled:text-gray-500"
          disabled={props.isChatCompleted}
        >
          {!!file && isUploading ? (
            <CircleNotch className="animate-spin" />
          ) : (
            "Send"
          )}
        </button>
      </div>
    </form>
  );
};

export default InputBar;
