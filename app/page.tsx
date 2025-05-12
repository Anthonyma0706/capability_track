'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    async function checkAuth() {
      try {
        // 动态导入Supabase客户端
        const { createClient } = await import("@/utils/supabase/client");
        const supabase = createClient();
        
        const { data: { user } } = await supabase.auth.getUser();
        
        // 如果用户已登录，重定向到受保护页面
        if (user) {
          router.push("/protected");
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("认证检查失败:", error);
        setIsLoading(false);
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
    <div className="flex-1 flex flex-col gap-20 items-center">
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  学生能力评估与档案管理系统
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  全面跟踪学生的学习能力、时间效率、学习习惯和执行能力，
                  帮助教师和家长更好地了解学生的成长过程。
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild size="lg">
                  <Link href="/sign-in">
                    立即开始
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/student_profile?example=true">
                    浏览示例
                  </Link>
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative w-full h-[400px] bg-muted rounded-lg overflow-hidden">
                <svg 
                  className="absolute w-full h-full text-primary/10" 
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill="currentColor"
                    d="M0,0 L100,0 L100,100 L0,100 Z"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg 
                    className="w-32 h-32 text-primary" 
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="w-full py-12 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">主要功能</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                我们提供全面的学生评估工具和直观的数据可视化
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 w-full max-w-5xl">
              <div className="flex flex-col items-center space-y-2 border rounded-lg p-4">
                <div className="p-2 bg-primary/10 rounded-full">
                  <svg 
                    className="w-6 h-6 text-primary" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">全面评估</h3>
                <p className="text-sm text-muted-foreground">
                  从多个维度评估学生能力
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 border rounded-lg p-4">
                <div className="p-2 bg-primary/10 rounded-full">
                  <svg 
                    className="w-6 h-6 text-primary" 
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
                </div>
                <h3 className="text-xl font-bold">数据可视化</h3>
                <p className="text-sm text-muted-foreground">
                  直观展示学生成长数据
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 border rounded-lg p-4">
                <div className="p-2 bg-primary/10 rounded-full">
                  <svg 
                    className="w-6 h-6 text-primary" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">进度跟踪</h3>
                <p className="text-sm text-muted-foreground">
                  跟踪记录学生的成长历程
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 border rounded-lg p-4">
                <div className="p-2 bg-primary/10 rounded-full">
                  <svg 
                    className="w-6 h-6 text-primary" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" 
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">个性化分析</h3>
                <p className="text-sm text-muted-foreground">
                  为每位学生提供个性化分析
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
