import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold, Italic, Strikethrough, Code, Heading2, Heading3,
  List, ListOrdered, Quote, Link2, Image as ImageIcon,
  Undo2, Redo2, Minus,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  hasError?: boolean;
}

export function RichTextEditor({ value, onChange, placeholder, hasError }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-black underline underline-offset-2" } }),
      Image.configure({ HTMLAttributes: { class: "my-4 max-w-full border border-stone-200" } }),
      Placeholder.configure({ placeholder: placeholder ?? "Start writing the article…" }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "prose-blog min-h-[280px] max-w-none p-4 text-sm leading-relaxed text-black focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html === "<p></p>" ? "" : html);
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const next = value || "";
    if (current !== next && (next || current !== "<p></p>")) {
      editor.commands.setContent(next, { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) return null;

  const btn = (active: boolean) =>
    `flex h-8 w-8 items-center justify-center rounded transition-colors ${
      active ? "bg-black text-white" : "text-black/65 hover:bg-stone-100 hover:text-black"
    }`;

  function setLink() {
    const previous = editor!.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previous ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor!.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor!.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  function addImage() {
    const url = window.prompt("Image URL", "https://");
    if (url) editor!.chain().focus().setImage({ src: url }).run();
  }

  return (
    <div className={`mt-1.5 overflow-hidden border bg-white ${hasError ? "border-red-400" : "border-stone-200"}`}>
      <div className="flex flex-wrap items-center gap-0.5 border-b border-stone-200 bg-stone-50/60 p-1.5">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive("bold"))} title="Bold"><Bold className="h-3.5 w-3.5" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive("italic"))} title="Italic"><Italic className="h-3.5 w-3.5" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={btn(editor.isActive("strike"))} title="Strikethrough"><Strikethrough className="h-3.5 w-3.5" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleCode().run()} className={btn(editor.isActive("code"))} title="Inline code"><Code className="h-3.5 w-3.5" /></button>
        <span className="mx-1 h-5 w-px bg-stone-200" />
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btn(editor.isActive("heading", { level: 2 }))} title="Heading 2"><Heading2 className="h-3.5 w-3.5" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btn(editor.isActive("heading", { level: 3 }))} title="Heading 3"><Heading3 className="h-3.5 w-3.5" /></button>
        <span className="mx-1 h-5 w-px bg-stone-200" />
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive("bulletList"))} title="Bulleted list"><List className="h-3.5 w-3.5" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(editor.isActive("orderedList"))} title="Numbered list"><ListOrdered className="h-3.5 w-3.5" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btn(editor.isActive("blockquote"))} title="Quote"><Quote className="h-3.5 w-3.5" /></button>
        <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()} className={btn(false)} title="Divider"><Minus className="h-3.5 w-3.5" /></button>
        <span className="mx-1 h-5 w-px bg-stone-200" />
        <button type="button" onClick={setLink} className={btn(editor.isActive("link"))} title="Link"><Link2 className="h-3.5 w-3.5" /></button>
        <button type="button" onClick={addImage} className={btn(false)} title="Image"><ImageIcon className="h-3.5 w-3.5" /></button>
        <span className="ml-auto flex items-center gap-0.5">
          <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className={btn(false) + " disabled:opacity-30"} title="Undo"><Undo2 className="h-3.5 w-3.5" /></button>
          <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className={btn(false) + " disabled:opacity-30"} title="Redo"><Redo2 className="h-3.5 w-3.5" /></button>
        </span>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
