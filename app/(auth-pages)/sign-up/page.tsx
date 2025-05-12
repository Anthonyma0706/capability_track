import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";

export default async function SignUp(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;
  if ("message" in searchParams) {
    return (
      <div className="w-full flex-1 flex items-center justify-center gap-2 p-4">
        <FormMessage message={searchParams} />
      </div>
    );
  }

  return (
    <>
      <div className="bg-card p-8 rounded-lg border shadow-sm w-full">
        <form className="flex flex-col w-full">
          <h1 className="text-2xl font-bold mb-4">注册</h1>
          <p className="text-sm text-muted-foreground mb-6">
            已有账号？{" "}
            <Link className="text-primary font-medium underline" href="/sign-in">
              登录
            </Link>
          </p>
          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">电子邮箱</Label>
              <Input name="email" placeholder="your@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                type="password"
                name="password"
                placeholder="您的密码"
                required
              />
            </div>
            <div className="mt-2">
              <SubmitButton pendingText="注册中..." formAction={signUpAction} className="w-full">
                注册
              </SubmitButton>
            </div>
            <FormMessage message={searchParams} />
          </div>
        </form>
      </div>
      <div className="mt-6">
        <SmtpMessage />
      </div>
    </>
  );
}
