import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default async function Login(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;
  return (
    <div className="bg-card p-8 rounded-lg border shadow-sm w-full">
      <form className="flex flex-col w-full">
        <h1 className="text-2xl font-bold mb-4">登录</h1>
        <p className="text-sm text-muted-foreground mb-6">
          还没有账号？{" "}
          <Link className="text-primary font-medium underline" href="/sign-up">
            注册
          </Link>
        </p>
        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">电子邮箱</Label>
            <Input name="email" placeholder="your@example.com" required />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">密码</Label>
              <Link
                className="text-xs text-primary underline"
                href="/forgot-password"
              >
                忘记密码？
              </Link>
            </div>
            <Input
              type="password"
              name="password"
              placeholder="您的密码"
              required
            />
          </div>
          <div className="mt-2">
            <SubmitButton pendingText="登录中..." formAction={signInAction} className="w-full">
              登录
            </SubmitButton>
          </div>
          <FormMessage message={searchParams} />
        </div>
      </form>
    </div>
  );
}
