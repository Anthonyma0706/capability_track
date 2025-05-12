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
  getDimensionName
} from '../utils';

interface OverviewProps {
  student: Student;
  onSelectAssessment: (studentId: string, assessmentId: string) => void;
  onCreateAssessment: () => void;
}

export default function Overview({ student, onSelectAssessment, onCreateAssessment }: OverviewProps) {
  const [historyData, setHistoryData] = useState<Array<{
    date: string;
    learningAbility: number;
    timeEfficiency: number;
    learningHabits: number;
    executionAbility: number;
    overall: number;
  }>>([]);
  
  const [latestRadarData, setLatestRadarData] = useState<Array<{
    subject: string;
    A: number;
    fullMark: number;
  }>>([]);
  
  const [latestAssessment, setLatestAssessment] = useState<Assessment | null>(null);
  
  // 获取历史评估数据
  useEffect(() => {
    if (!student || student.assessments.length === 0) return;
    
    // 获取所有评估并按日期排序（最新的在前）
    const sortedAssessments = [...student.assessments].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    // 设置最新的评估
    setLatestAssessment(sortedAssessments[0]);
    
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
      
      const overall = calculateOverallAverage(assessment.scores);
      
      return {
        date: new Date(assessment.date).toLocaleDateString('zh-CN'),
        learningAbility: Number(dimensionScores.learningAbility.toFixed(1)),
        timeEfficiency: Number(dimensionScores.timeEfficiency.toFixed(1)),
        learningHabits: Number(dimensionScores.learningHabits.toFixed(1)),
        executionAbility: Number(dimensionScores.executionAbility.toFixed(1)),
        overall: Number(overall.toFixed(1))
      };
    });
    
    setHistoryData(trendData);
    
    // 生成最新评估的雷达图数据
    const latest = sortedAssessments[0];
    if (latest) {
      const dimensionScores = {
        learningAbility: calculateDimensionAverage(latest.scores.learningAbility),
        timeEfficiency: calculateDimensionAverage(latest.scores.timeEfficiency),
        learningHabits: calculateDimensionAverage(latest.scores.learningHabits),
        executionAbility: calculateDimensionAverage(latest.scores.executionAbility)
      };
      
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
      
      setLatestRadarData(radarData);
    }
  }, [student]);
  
  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };
  
  // 如果没有评估记录
  if (!student.assessments || student.assessments.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-gray-50">
        <div className="text-center max-w-md">
          <svg 
            className="w-16 h-16 mx-auto text-gray-400 mb-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">暂无评估记录</h2>
          <p className="text-gray-600 mb-6">
            {student.name} 目前还没有任何评估记录。创建第一次评估来开始追踪学习进度。
          </p>
          <button
            onClick={onCreateAssessment}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md inline-flex items-center transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <svg 
              className="w-5 h-5 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M12 4v16m8-8H4" 
              />
            </svg>
            创建首次评估
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto bg-gray-100">
      {/* 学生信息和最新评估总览 */}
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold">{student.name} 的学习总览</h2>
              <p className="text-gray-600">{student.grade}</p>
            </div>
            {latestAssessment && (
              <div className="text-right">
                <div className="inline-block rounded-full bg-blue-100 p-4">
                  <span className="text-4xl font-bold text-blue-600">
                    {calculateOverallAverage(latestAssessment.scores).toFixed(1)}
                  </span>
                  <span className="text-lg text-blue-600">/5.0</span>
                </div>
                <p className="text-gray-600 mt-1">最新综合评分</p>
              </div>
            )}
          </div>
          
          <div className="flex items-center mt-4">
            <div className="bg-blue-50 px-3 py-1 rounded-full text-blue-700 text-sm font-medium">
              共 {student.assessments.length} 次评估
            </div>
            {latestAssessment && (
              <div className="ml-3 text-gray-600 text-sm">
                最近评估日期: {formatDate(latestAssessment.date)}
              </div>
            )}
            <div className="ml-auto">
              <button
                onClick={onCreateAssessment}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md inline-flex items-center"
              >
                <svg 
                  className="w-4 h-4 mr-1" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M12 4v16m8-8H4" 
                  />
                </svg>
                新建评估
              </button>
            </div>
          </div>
        </div>
        
        {/* 雷达图和趋势图 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* 左侧 - 雷达图 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold mb-4">最新能力雷达图</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius="70%" data={latestRadarData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#4b5563', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: '#6b7280' }} />
                  <Radar 
                    name="能力水平" 
                    dataKey="A" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.6} 
                    animationDuration={1000}
                    animationEasing="ease-in-out"
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
          
          {/* 右侧 - 趋势图 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold mb-4">学习能力趋势 {historyData.length > 1 ? `(最近${historyData.length}次评估)` : ''}</h3>
            <div className="h-72">
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
                    dataKey="overall" 
                    name="综合评分" 
                    fill="#3b82f6" 
                    radius={[4, 4, 0, 0]} 
                    animationDuration={800}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        {/* 维度详细趋势 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="font-semibold mb-4">各维度能力趋势</h3>
          <div className="h-80">
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
                  animationDuration={1000}
                />
                <Bar 
                  dataKey="timeEfficiency" 
                  name="时间利用效率" 
                  fill="#82ca9d" 
                  radius={[4, 4, 0, 0]} 
                  animationDuration={1200}
                />
                <Bar 
                  dataKey="learningHabits" 
                  name="学习习惯" 
                  fill="#ffc658" 
                  radius={[4, 4, 0, 0]} 
                  animationDuration={1400}
                />
                <Bar 
                  dataKey="executionAbility" 
                  name="配合执行力" 
                  fill="#ff8042" 
                  radius={[4, 4, 0, 0]} 
                  animationDuration={1600}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* 评估历史记录 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-semibold mb-4">全部评估历史</h3>
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    评估日期
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    综合评分
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {student.assessments
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  // 使用 Map 去重，确保同一天的评估只显示最新的一条
                  .filter((assessment, index, self) => 
                    index === self.findIndex(a => formatDate(a.date) === formatDate(assessment.date))
                  )
                  .map((assessment, index) => {
                    const dateKey = formatDate(assessment.date);
                    const overallScore = calculateOverallAverage(assessment.scores);
                    
                    return (
                      <tr 
                        key={`assessment-${assessment.id}-${index}`} 
                        className={`hover:bg-blue-50 cursor-pointer transition-colors ${index === 0 ? 'bg-blue-50' : ''}`}
                        onClick={() => onSelectAssessment(student.id, assessment.id)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatDate(assessment.date)}
                            {index === 0 && (
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                最新
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-medium">{overallScore.toFixed(1)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation(); // 阻止事件冒泡
                              onSelectAssessment(student.id, assessment.id);
                            }}
                            className="text-blue-600 hover:text-blue-900 mr-4 flex items-center"
                          >
                            查看详情
                            <svg 
                              className="w-4 h-4 ml-1" 
                              xmlns="http://www.w3.org/2000/svg" 
                              viewBox="0 0 20 20" 
                              fill="currentColor"
                            >
                              <path 
                                fillRule="evenodd" 
                                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" 
                                clipRule="evenodd" 
                              />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 