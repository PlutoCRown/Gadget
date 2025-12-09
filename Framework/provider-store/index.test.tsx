import React, { useEffect } from "react";
import { createProviderStore } from ".";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { EventBus, readFile, parseAST } from "demo";

type State = {
  path: string;
  content: string;
  ast: any;
};

type Action = any;

type Store = State & Action;

const FileEditorStore = () =>
  create(
    immer<Store>((set, get) => ({
      path: "",
      file: null,
      content: "",
      ast: null,
      setFile: async (path: string) => {
        const content = await readFile(path);
        set({ path, content });
        return parseAST(content);
      },
    }))
  );

const { useFactoryStore: useFileStore, StoreProvider: FileProvider } =
  createProviderStore(FileEditorStore, {
    name: "FileEditorStore",
    effect: (store) => {
      const clearup = EventBus.on("system:file-change", (path) => {
        if (path === store.getState().path) {
          store.getState().setFile(path);
        }
      });
      return () => {
        clearup();
      };
    },
  });

export const FileOpener = (path: string) => {
  return (
    <FileProvider init={{ path }} id={path}>
      <FileEditor />
    </FileProvider>
  );
};

const FileEditor = () => {
  const { path, content, ast, setFile } = useFileStore();
  useEffect(() => {
    if (path) setFile(path);
  }, [path]);
  return (
    <div>
      <div>{path}</div>
      <div>{content}</div>
      <div>{ast}</div>
    </div>
  );
};
