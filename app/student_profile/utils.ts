import { 
  Student, 
  Assessment, 
  AssessmentScores, 
  DimensionKey, 
  SubDimensionKey 
} from './types';

// 本地存储键
const STUDENTS_STORAGE_KEY = 'studentProfiles';

// 工具函数：从localStorage获取学生数据
export const getStudentsFromStorage = (): Student[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const storedData = localStorage.getItem(STUDENTS_STORAGE_KEY);
    return storedData ? JSON.parse(storedData) : [];
  } catch (error) {
    console.error('Error getting students from storage:', error);
    return [];
  }
};

// 工具函数：保存学生数据到localStorage
export const saveStudentsToStorage = (students: Student[]): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(students));
  } catch (error) {
    console.error('Error saving students to storage:', error);
  }
};

// 生成唯一ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
};

// 计算子维度平均分
export const calculateSubDimensionAverage = (
  scores: Record<string, number>,
  skipZeros: boolean = true
): number => {
  const values = Object.values(scores).filter(val => !skipZeros || val > 0);
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
};

// 计算维度平均分
export const calculateDimensionAverage = (
  dimension: any,
  skipZeros: boolean = true
): number => {
  const subDimensions = Object.values(dimension);
  
  const subDimensionScores = subDimensions.map(subDim => {
    if (typeof subDim === 'object') {
      return calculateSubDimensionAverage(subDim as Record<string, number>, skipZeros);
    }
    return 0;
  });
  
  const validScores = subDimensionScores.filter(score => !skipZeros || score > 0);
  if (validScores.length === 0) return 0;
  
  return validScores.reduce((sum, score) => sum + score, 0) / validScores.length;
};

// 计算总平均分
export const calculateOverallAverage = (scores: AssessmentScores): number => {
  const dimensions = Object.values(scores);
  const dimensionScores = dimensions.map(dim => {
    return calculateDimensionAverage(dim);
  });
  
  const validScores = dimensionScores.filter(score => score > 0);
  if (validScores.length === 0) return 0;
  
  return validScores.reduce((sum, score) => sum + score, 0) / validScores.length;
};

// 获取某一维度的所有子维度值作为雷达图数据点
export const getDimensionRadarData = (
  assessment: Assessment,
  dimension: DimensionKey
): number[] => {
  const dimensionData = assessment.scores[dimension];
  return Object.entries(dimensionData).map(([_, subDimension]) => 
    calculateSubDimensionAverage(subDimension as Record<string, number>)
  );
};

// 获取维度的中文名称
export const getDimensionName = (dimension: DimensionKey): string => {
  const nameMap: Record<DimensionKey, string> = {
    learningAbility: '学习能力',
    timeEfficiency: '时间利用效率',
    learningHabits: '学习习惯',
    executionAbility: '配合执行力'
  };
  return nameMap[dimension];
};

// 获取子维度的中文名称
export const getSubDimensionName = (subDimension: SubDimensionKey): string => {
  const nameMap: Record<SubDimensionKey, string> = {
    problemMastery: '题目掌握度',
    selfLearning: '错题自学能力',
    thinkingAbility: '思维能力',
    metaLearning: '学习元能力',
    problemSolvingEfficiency: '做题效率',
    mistakeOvercomingEfficiency: '错题攻克效率',
    attentionManagement: '注意力管理',
    proactiveHabits: '主动学习习惯',
    toolUseHabits: '工具使用习惯',
    systematicLearning: '学习系统性',
    taskExecution: '任务执行',
    coachInteraction: '教练互动',
    mentalityManagement: '心态管理'
  };
  return nameMap[subDimension];
};

// 创建新的评估对象
export const createEmptyAssessment = (studentId: string): Assessment => {
  return {
    id: generateId(),
    date: new Date().toISOString(),
    studentId,
    scores: {
      learningAbility: {
        problemMastery: {
          oneStar: 0,
          twoStar: 0,
          threeStar: 0,
          fourStar: 0,
          oneStarSimilar: 0,
          twoStarSimilar: 0,
          threeStarSimilar: 0,
          fourStarSimilar: 0
        },
        selfLearning: {
          selfUnderstandingRatio: 0,
          explainToCoachRatio: 0,
          initiativeWhenFacingDifficulties: 0
        },
        thinkingAbility: {
          structuredThinking: 0,
          selfBottleneckIdentification: 0,
          knowledgeTransfer: 0
        },
        metaLearning: {
          problemDescriptionAccuracy: 0,
          aiToolUtilization: 0,
          selfReflection: 0
        }
      },
      timeEfficiency: {
        problemSolvingEfficiency: {
          oneStarTimeEfficiency: 0,
          twoStarTimeEfficiency: 0,
          threeStarTimeEfficiency: 0,
          fourStarTimeEfficiency: 0
        },
        mistakeOvercomingEfficiency: {
          selfLearningSpeed: 0,
          pomodoroEfficiency: 0
        },
        attentionManagement: {
          focusDuration: 0,
          distractionHandling: 0,
          goalClarity: 0
        }
      },
      learningHabits: {
        proactiveHabits: {
          activeQuestioning: 0,
          dualNoteMethod: 0,
          reviewHabits: 0
        },
        toolUseHabits: {
          aiToolQuestioning: 0,
          pomodoroUse: 0,
          mistakeCollection: 0
        },
        systematicLearning: {
          knowledgeIntegration: 0,
          keyPointAwareness: 0,
          selfTesting: 0
        }
      },
      executionAbility: {
        taskExecution: {
          taskCompletionRate: 0,
          taskQuality: 0,
          taskInitiative: 0
        },
        coachInteraction: {
          proactiveCommunication: 0,
          feedbackReceptivity: 0,
          guidanceImplementation: 0
        },
        mentalityManagement: {
          positivityTowardsChallenges: 0,
          frustrationHandling: 0,
          motivationSustainability: 0
        }
      }
    },
    feedback: {
      strengths: '',
      improvements: '',
      nextSteps: ''
    }
  };
}; 