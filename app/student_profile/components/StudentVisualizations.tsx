'use client';

import { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { Student, Assessment, DimensionKey } from '../types';
import { 
  calculateDimensionAverage, 
  calculateOverallAverage, 
  getSubDimensionName, 
  getDimensionName,
  getDimensionRadarData 
} from '../utils';

interface StudentVisualizationsProps {
  student: Student;
  assessment: Assessment | null;
}

export default function StudentVisualizations({ student, assessment }: StudentVisualizationsProps) {
  const [notEvaluatedItems, setNotEvaluatedItems] = useState<Array<{name: string, path: string}>>([]);
  const [historyData, setHistoryData] = useState<Array<{
    date: string;
    learningAbility: number;
    timeEfficiency: number;
    learningHabits: number;
    executionAbility: number;
  }>>([]);
  
  // 计算未评估指标
  useEffect(() => {
    if (!assessment) {
      setNotEvaluatedItems([]);
      return;
    }
    
    const notEvaluated: Array<{name: string, path: string}> = [];
    
    Object.entries(assessment.scores).forEach(([dimension, dimensionData]) => {
      Object.entries(dimensionData).forEach(([subDimension, subDimensionData]) => {
        Object.entries(subDimensionData as any).forEach(([indicator, value]) => {
          if (value === 0) {
            notEvaluated.push({
              path: `${dimension}.${subDimension}.${indicator}`,
              name: `${getDimensionName(dimension as DimensionKey)} - ${getSubDimensionName(subDimension as any)} - ${getIndicatorDisplayName(indicator)}`
            });
          }
        });
      });
    });
    
    setNotEvaluatedItems(notEvaluated);
  }, [assessment]);
  
  // 获取历史评估数据
  useEffect(() => {
    if (!student || !assessment) return;
    
    // 获取所有评估并按日期排序（最新的在前）
    const sortedAssessments = [...student.assessments].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    // 最多取最近4次评估
    const recentAssessments = sortedAssessments.slice(0, 4);
    
    // 生成趋势图数据（按日期从早到晚排序显示）
    const trendData = recentAssessments.reverse().map(assessment => {
      const dimensionScores = {
        learningAbility: calculateDimensionAverage(assessment.scores.learningAbility),
        timeEfficiency: calculateDimensionAverage(assessment.scores.timeEfficiency),
        learningHabits: calculateDimensionAverage(assessment.scores.learningHabits),
        executionAbility: calculateDimensionAverage(assessment.scores.executionAbility)
      };
      
      return {
        date: new Date(assessment.date).toLocaleDateString('zh-CN'),
        learningAbility: Number(dimensionScores.learningAbility.toFixed(1)),
        timeEfficiency: Number(dimensionScores.timeEfficiency.toFixed(1)),
        learningHabits: Number(dimensionScores.learningHabits.toFixed(1)),
        executionAbility: Number(dimensionScores.executionAbility.toFixed(1))
      };
    });
    
    setHistoryData(trendData);
  }, [student, assessment]);

  if (!assessment) {
    return (
      <div className="h-full flex items-center justify-center p-4 bg-gray-50">
        <div className="text-center text-gray-500">
          <p className="mb-2">尚无评估数据</p>
          <p>请先创建或选择一个评估</p>
        </div>
      </div>
    );
  }

  // 计算四大维度的分数
  const dimensionScores = {
    learningAbility: calculateDimensionAverage(assessment.scores.learningAbility),
    timeEfficiency: calculateDimensionAverage(assessment.scores.timeEfficiency),
    learningHabits: calculateDimensionAverage(assessment.scores.learningHabits),
    executionAbility: calculateDimensionAverage(assessment.scores.executionAbility)
  };

  // 计算总体得分
  const overallScore = calculateOverallAverage(assessment.scores);

  // 雷达图数据
  const radarData = [
    {
      subject: getDimensionName('learningAbility'),
      A: Number(dimensionScores.learningAbility.toFixed(1)),
      fullMark: 5,
    },
    {
      subject: getDimensionName('timeEfficiency'),
      A: Number(dimensionScores.timeEfficiency.toFixed(1)),
      fullMark: 5,
    },
    {
      subject: getDimensionName('learningHabits'),
      A: Number(dimensionScores.learningHabits.toFixed(1)),
      fullMark: 5,
    },
    {
      subject: getDimensionName('executionAbility'),
      A: Number(dimensionScores.executionAbility.toFixed(1)),
      fullMark: 5,
    },
  ];

  // 维度数据用于进度条展示
  const dimensionData = [
    {
      name: getDimensionName('learningAbility'),
      value: Number(dimensionScores.learningAbility.toFixed(1)),
      fill: '#8884d8'
    },
    {
      name: getDimensionName('timeEfficiency'),
      value: Number(dimensionScores.timeEfficiency.toFixed(1)),
      fill: '#82ca9d'
    },
    {
      name: getDimensionName('learningHabits'),
      value: Number(dimensionScores.learningHabits.toFixed(1)),
      fill: '#ffc658'
    },
    {
      name: getDimensionName('executionAbility'),
      value: Number(dimensionScores.executionAbility.toFixed(1)),
      fill: '#ff8042'
    }
  ];

  // 格式化子维度详细展示区
  const formatDetailedSection = (dimensionKey: DimensionKey, sectionName: string) => {
    const dimensionData = assessment.scores[dimensionKey];
    
    return (
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">{sectionName}</h3>
        {Object.entries(dimensionData).map(([subDimensionKey, subDimensionData]) => {
          // 计算子维度平均分（只计算已评估的指标）
          let totalScore = 0;
          let validCount = 0;
          
          Object.entries(subDimensionData as any).forEach(([_, value]) => {
            const score = value as number;
            if (score > 0) {
              totalScore += score;
              validCount++;
            }
          });
          
          const subDimensionAvg = validCount > 0 ? totalScore / validCount : 0;
          
          return (
            <div key={subDimensionKey} className="mb-4 bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-lg font-medium">{getSubDimensionName(subDimensionKey as any)}</h4>
                <span className="text-xl font-bold text-blue-600">{subDimensionAvg.toFixed(1)}</span>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(subDimensionData as any).map(([indicatorKey, indicatorValue]) => {
                  // 如果值为0，显示为未评估
                  if (indicatorValue === 0) {
                    return (
                      <div key={indicatorKey} className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">{getIndicatorDisplayName(indicatorKey)}</span>
                        <span className="text-sm text-gray-500">未评估</span>
                      </div>
                    );
                  }
                  
                  return (
                    <div key={indicatorKey} className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">{getIndicatorDisplayName(indicatorKey)}</span>
                      <div className="flex items-center">
                        {/* 星级评分 */}
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg 
                              key={star}
                              className={`w-5 h-5 ${star <= (indicatorValue as number) ? 'text-yellow-400' : 'text-gray-300'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="ml-2 text-gray-900 font-medium">
                          {Number(indicatorValue as number).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // 获取指标的中文显示名称
  const getIndicatorDisplayName = (indicator: string): string => {
    const displayNames: Record<string, string> = {
      // 学习能力 - 题目掌握度
      oneStar: '1⭐题正确率',
      twoStar: '2⭐题正确率',
      threeStar: '3⭐题正确率',
      fourStar: '4⭐题正确率',
      oneStarSimilar: '1⭐相似题正确率',
      twoStarSimilar: '2⭐相似题正确率',
      threeStarSimilar: '3⭐相似题正确率',
      fourStarSimilar: '4⭐相似题正确率',
      
      // 学习能力 - 错题自学能力
      selfUnderstandingRatio: '自学理解比例',
      explainToCoachRatio: '能向教练清晰讲解比例',
      initiativeWhenFacingDifficulties: '遇到困难主动寻求解决的积极性',
      
      // 学习能力 - 思维能力
      structuredThinking: '解题思路结构化能力',
      selfBottleneckIdentification: '自我卡点定位能力',
      knowledgeTransfer: '知识点联系与迁移能力',
      
      // 学习能力 - 学习元能力
      problemDescriptionAccuracy: '问题精确描述能力',
      aiToolUtilization: 'AI工具有效利用能力',
      selfReflection: '自我反思总结能力',
      
      // 时间利用效率 - 做题效率
      oneStarTimeEfficiency: '1⭐题平均完成时间效率',
      twoStarTimeEfficiency: '2⭐题平均完成时间效率',
      threeStarTimeEfficiency: '3⭐题平均完成时间效率',
      fourStarTimeEfficiency: '4⭐题平均完成时间效率',
      
      // 时间利用效率 - 错题攻克效率
      selfLearningSpeed: '错题自学理解速度',
      pomodoroEfficiency: '番茄钟利用效率',
      
      // 时间利用效率 - 注意力管理
      focusDuration: '专注持续时间',
      distractionHandling: '学习过程中干扰应对能力',
      goalClarity: '目标明确度',
      
      // 学习习惯 - 主动学习习惯
      activeQuestioning: '主动提问解决问题习惯',
      dualNoteMethod: '使用双格笔记法记录知识点和困惑的习惯',
      reviewHabits: '课前预习/课后复习习惯',
      
      // 学习习惯 - 工具使用习惯
      aiToolQuestioning: 'AI工具有效提问习惯',
      pomodoroUse: '合理运用番茄钟习惯',
      mistakeCollection: '错题收集整理习惯',
      
      // 学习习惯 - 学习系统性
      knowledgeIntegration: '知识整合与复习习惯',
      keyPointAwareness: '考点关联意识习惯',
      selfTesting: '自我检验习惯',
      
      // 配合执行力 - 任务执行
      taskCompletionRate: '任务完成度',
      taskQuality: '任务质量',
      taskInitiative: '任务主动性',
      
      // 配合执行力 - 教练互动
      proactiveCommunication: '主动沟通频率',
      feedbackReceptivity: '反馈接受度',
      guidanceImplementation: '指导落实度',
      
      // 配合执行力 - 心态管理
      positivityTowardsChallenges: '面对挑战积极性',
      frustrationHandling: '挫折应对能力',
      motivationSustainability: '学习动力持续性'
    };
    
    return displayNames[indicator] || indicator;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
  };

  return (
    <div className="h-full flex flex-col p-4 overflow-y-auto bg-gray-100">
      {/* 总览面板 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold mb-2">学习能力评估</h2>
            <p className="text-gray-600">评估日期: {formatDate(assessment.date)}</p>
          </div>
          <div className="text-right">
            <div className="inline-block rounded-full bg-blue-100 p-4">
              <span className="text-4xl font-bold text-blue-600">{overallScore.toFixed(1)}</span>
              <span className="text-lg text-blue-600">/5.0</span>
            </div>
            <p className="text-gray-600 mt-1">综合评分</p>
          </div>
        </div>
      </div>
      
      {/* 未评估指标 */}
      {notEvaluatedItems.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="font-semibold mb-4">本周未评估指标 ({notEvaluatedItems.length})</h3>
          <div className="max-h-40 overflow-y-auto">
            <ul className="space-y-1 pl-4">
              {notEvaluatedItems.map((item, index) => (
                <li key={index} className="text-sm text-gray-600 list-disc">
                  {item.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      {/* 雷达图和维度得分 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* 左列 - 维度得分 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 h-full">
            <h3 className="font-semibold mb-4">维度详细得分</h3>
            
            {dimensionData.map((item) => (
              <div key={item.name} className="mb-3">
                <div className="flex justify-between mb-1">
                  <span className="font-medium">{item.name}</span>
                  <span className="font-bold">{item.value.toFixed(1)}/5.0</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className="rounded-full h-4" 
                    style={{ width: `${(item.value/5)*100}%`, backgroundColor: item.fill }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* 右列 - 雷达图 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 h-full">
            <h3 className="font-semibold mb-4">四维学习力雷达图</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#4b5563', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: '#6b7280' }} />
                  <Radar 
                    name="能力水平" 
                    dataKey="A" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.6} 
                    isAnimationActive={false}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value} / 5.0`, '能力水平']} 
                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  />
                  <Legend 
                    iconType="circle" 
                    iconSize={10}
                    wrapperStyle={{ paddingTop: '10px' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
      
      {/* 评估趋势图 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="font-semibold mb-4">学习能力趋势 {historyData.length > 1 ? `(最近${historyData.length}次评估)` : ''}</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={historyData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              barGap={8}
              barSize={16}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                tick={{ fill: '#4b5563', fontSize: 12 }}
                axisLine={{ stroke: '#d1d5db' }}
              />
              <YAxis 
                domain={[0, 5]} 
                tick={{ fill: '#4b5563', fontSize: 12 }}
                axisLine={{ stroke: '#d1d5db' }}
                tickLine={{ stroke: '#d1d5db' }}
              />
              <Tooltip 
                formatter={(value) => [`${value} / 5.0`]} 
                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                cursor={{ fill: 'rgba(224, 231, 255, 0.2)' }}
              />
              <Legend 
                iconType="circle" 
                iconSize={8}
                wrapperStyle={{ paddingTop: '10px' }}
              />
              <Bar 
                dataKey="learningAbility" 
                name="学习能力" 
                fill="#8884d8" 
                radius={[4, 4, 0, 0]} 
                isAnimationActive={false}
              />
              <Bar 
                dataKey="timeEfficiency" 
                name="时间利用效率" 
                fill="#82ca9d" 
                radius={[4, 4, 0, 0]} 
                isAnimationActive={false}
              />
              <Bar 
                dataKey="learningHabits" 
                name="学习习惯" 
                fill="#ffc658" 
                radius={[4, 4, 0, 0]} 
                isAnimationActive={false}
              />
              <Bar 
                dataKey="executionAbility" 
                name="配合执行力" 
                fill="#ff8042" 
                radius={[4, 4, 0, 0]} 
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* 详细评估指标 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-bold mb-6">详细评估指标</h3>
        
        {/* 学习能力详细指标 */}
        {formatDetailedSection('learningAbility', getDimensionName('learningAbility'))}
        
        {/* 时间利用效率详细指标 */}
        {formatDetailedSection('timeEfficiency', getDimensionName('timeEfficiency'))}
        
        {/* 学习习惯详细指标 */}
        {formatDetailedSection('learningHabits', getDimensionName('learningHabits'))}
        
        {/* 配合执行力详细指标 */}
        {formatDetailedSection('executionAbility', getDimensionName('executionAbility'))}
      </div>
      
      {/* 教练反馈 */}
      {assessment.feedback && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-semibold mb-4">教练反馈</h3>
          <div className="border-l-4 border-blue-500 pl-4 py-2">
            <p className="text-gray-700 mb-2">
              <strong>优势：</strong> {assessment.feedback.strengths || '未填写'}
            </p>
            <p className="text-gray-700 mb-2">
              <strong>待提升：</strong> {assessment.feedback.improvements || '未填写'}
            </p>
            <p className="text-gray-700">
              <strong>下一步计划：</strong> {assessment.feedback.nextSteps || '未填写'}
            </p>
          </div>
          <div className="text-right mt-2">
            <p className="text-sm text-gray-500">评估日期: {formatDate(assessment.date)}</p>
          </div>
        </div>
      )}
    </div>
  );
} 