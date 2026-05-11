import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { PostEditor, formToPayload, postToForm } from "~/components/admin/PostEditor";
import { useAdminPost, useDeletePost, useUpdatePost } from "~/lib/queries";

export default function PostEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: post, isLoading, isError } = useAdminPost(id ?? "");
  const update = useUpdatePost();
  const remove = useDeletePost();

  const formValue = useMemo(() => post ? postToForm(post) : undefined, [post]);

  if (isLoading) {
    return (
      <div className="px-6 py-8 lg:px-10 lg:py-10">
        <div className="space-y-4">
          <div className="h-8 w-64 animate-pulse bg-stone-100" />
          <div className="h-96 animate-pulse rounded-md border border-stone-200 bg-white" />
        </div>
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="px-6 py-8 lg:px-10 lg:py-10">
        <p className="text-sm text-red-600">Post not found.</p>
        <Link to="/admin/posts" className="mt-3 inline-block text-[11px] font-bold uppercase tracking-[0.18em] text-black hover:underline">
          ← Back to posts
        </Link>
      </div>
    );
  }

  return (
    <PostEditor
      initialValue={formValue}
      title={post.title || "Edit Post"}
      eyebrow="Edit Post"
      saving={update.isPending}
      deleting={remove.isPending}
      onSave={(form) => {
        update.mutate({ id: post.id, ...(formToPayload(form) as any) }, {
          onSuccess: () => navigate("/admin/posts"),
        });
      }}
      onDelete={() => {
        if (!confirm(`Delete "${post.title}"? This can't be undone.`)) return;
        remove.mutate(post.id, {
          onSuccess: () => navigate("/admin/posts"),
        });
      }}
    />
  );
}
