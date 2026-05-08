import { useNavigate } from "react-router";
import { PostEditor, emptyPost, formToPayload } from "~/components/admin/PostEditor";
import { useCreatePost } from "~/lib/queries";

export default function PostNewPage() {
  const navigate = useNavigate();
  const create = useCreatePost();

  return (
    <PostEditor
      initialValue={emptyPost}
      title="New Post"
      eyebrow="Blog"
      saving={create.isPending}
      onSave={(form) => {
        create.mutate(formToPayload(form) as any, {
          onSuccess: () => navigate("/admin/posts"),
        });
      }}
    />
  );
}
