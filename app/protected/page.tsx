'use client';

import FetchDataSteps from "@/components/tutorial/fetch-data-steps";
import { InfoIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProtectedPage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        // 动态导入Supabase客户端
        const { createClient } = await import("@/utils/supabase/client");
        const supabase = createClient();
        
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push("/sign-in");
        } else {
          setUser(user);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("认证检查失败:", error);
        router.push("/sign-in");
      }
    }
    
    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-12 max-w-6xl mx-auto p-4 md:p-8">
      <div className="w-full">
        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
          <InfoIcon size="16" strokeWidth={2} />
          欢迎使用学生档案系统，您已成功登录
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <div>
          <h2 className="font-bold text-2xl mb-4">您的用户信息</h2>
          <pre className="text-xs font-mono p-3 rounded border max-h-32 overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center mb-4">
              <svg 
                className="w-8 h-8 text-primary mr-3" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
                />
              </svg>
              <h3 className="text-xl font-bold">学生档案应用</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              访问完整的学生档案应用，管理学生信息并进行能力评估
            </p>
            <Button asChild>
              <Link href="/student_profile">
                进入学生档案应用
              </Link>
            </Button>
          </div>

          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center mb-4">
              <svg 
                className="w-8 h-8 text-primary mr-3" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
                />
              </svg>
              <h3 className="text-xl font-bold">数据仪表盘</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              查看学生评估数据的汇总报告和趋势分析
            </p>
            <Button variant="outline" asChild>
              <Link href="/dashboard">
                查看数据仪表盘
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
