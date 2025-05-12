export interface Student {
  id: string;
  name: string;
  grade: string;
  createdAt: string;
  assessments: Assessment[];
}

export interface Assessment {
  id: string;
  date: string;
  studentId: string;
  scores: AssessmentScores;
  feedback: Feedback;
}

export interface Feedback {
  strengths: string;
  improvements: string;
  nextSteps: string;
}

export interface AssessmentScores {
  learningAbility: LearningAbilityScores;
  timeEfficiency: TimeEfficiencyScores;
  learningHabits: LearningHabitsScores;
  executionAbility: ExecutionAbilityScores;
}

export interface LearningAbilityScores {
  problemMastery: {
    oneStar: number;
    twoStar: number;
    threeStar: number;
    fourStar: number;
    oneStarSimilar: number;
    twoStarSimilar: number;
    threeStarSimilar: number;
    fourStarSimilar: number;
  };
  selfLearning: {
    selfUnderstandingRatio: number;
    explainToCoachRatio: number;
    initiativeWhenFacingDifficulties: number;
  };
  thinkingAbility: {
    structuredThinking: number;
    selfBottleneckIdentification: number;
    knowledgeTransfer: number;
  };
  metaLearning: {
    problemDescriptionAccuracy: number;
    aiToolUtilization: number;
    selfReflection: number;
  };
}

export interface TimeEfficiencyScores {
  problemSolvingEfficiency: {
    oneStarTimeEfficiency: number;
    twoStarTimeEfficiency: number;
    threeStarTimeEfficiency: number;
    fourStarTimeEfficiency: number;
  };
  mistakeOvercomingEfficiency: {
    selfLearningSpeed: number;
    pomodoroEfficiency: number;
  };
  attentionManagement: {
    focusDuration: number;
    distractionHandling: number;
    goalClarity: number;
  };
}

export interface LearningHabitsScores {
  proactiveHabits: {
    activeQuestioning: number;
    dualNoteMethod: number;
    reviewHabits: number;
  };
  toolUseHabits: {
    aiToolQuestioning: number;
    pomodoroUse: number;
    mistakeCollection: number;
  };
  systematicLearning: {
    knowledgeIntegration: number;
    keyPointAwareness: number;
    selfTesting: number;
  };
}

export interface ExecutionAbilityScores {
  taskExecution: {
    taskCompletionRate: number;
    taskQuality: number;
    taskInitiative: number;
  };
  coachInteraction: {
    proactiveCommunication: number;
    feedbackReceptivity: number;
    guidanceImplementation: number;
  };
  mentalityManagement: {
    positivityTowardsChallenges: number;
    frustrationHandling: number;
    motivationSustainability: number;
  };
}

export type DimensionKey = 'learningAbility' | 'timeEfficiency' | 'learningHabits' | 'executionAbility';
export type SubDimensionKey = 
  'problemMastery' | 'selfLearning' | 'thinkingAbility' | 'metaLearning' | 
  'problemSolvingEfficiency' | 'mistakeOvercomingEfficiency' | 'attentionManagement' | 
  'proactiveHabits' | 'toolUseHabits' | 'systematicLearning' | 
  'taskExecution' | 'coachInteraction' | 'mentalityManagement'; 