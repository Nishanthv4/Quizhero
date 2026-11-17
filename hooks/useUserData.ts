import { useState, useEffect, useCallback, useMemo } from 'react';
import type { User, GameHistoryEntry, AchievementId, LevelProgress } from '../types';
import { allUsers as initialUsers, currentUser as initialCurrentUser } from '../data/users';

const USER_DATA_KEY = 'quizHeroUserData';

export interface SavedUserData {
  currentUser: User;
  gameHistory: GameHistoryEntry[];
  unlockedAchievements: AchievementId[];
  landmarkProgress: LevelProgress;
  usedStaticQuestions: string[];
}

const DEFAULT_LANDMARK_PROGRESS: LevelProgress = {
  1: { unlocked: true, stars: 0, highScore: 0 },
};

export function loadUserData(): SavedUserData {
  try {
    const data = localStorage.getItem(USER_DATA_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed.currentUser && parsed.gameHistory) {
        return {
          ...parsed,
          usedStaticQuestions: Array.isArray(parsed.usedStaticQuestions)
            ? parsed.usedStaticQuestions
            : [],
          landmarkProgress: parsed.landmarkProgress || DEFAULT_LANDMARK_PROGRESS,
          unlockedAchievements: Array.isArray(parsed.unlockedAchievements)
            ? parsed.unlockedAchievements
            : [],
        };
      }
    }
  } catch (e) {
    console.error('Failed to load user data:', e);
  }

  return {
    currentUser: initialCurrentUser,
    gameHistory: [],
    unlockedAchievements: [],
    landmarkProgress: DEFAULT_LANDMARK_PROGRESS,
    usedStaticQuestions: [],
  };
}

/**
 * Manages persisted user profile, history, achievements, and landmark progress.
 */
export function useUserData() {
  const savedData = useMemo(() => loadUserData(), []);

  const [currentUser, setCurrentUser] = useState<User>(savedData.currentUser);
  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const others = initialUsers.filter((u) => u.id !== savedData.currentUser.id);
    return [savedData.currentUser, ...others];
  });
  const [gameHistory, setGameHistory] = useState<GameHistoryEntry[]>(savedData.gameHistory);
  const [unlockedAchievements, setUnlockedAchievements] = useState<AchievementId[]>(
    savedData.unlockedAchievements
  );
  const [landmarkProgress, setLandmarkProgress] = useState<LevelProgress>(
    savedData.landmarkProgress
  );
  const [usedStaticQuestions, setUsedStaticQuestions] = useState<Set<string>>(
    () => new Set(savedData.usedStaticQuestions)
  );

  // Persist to localStorage whenever key fields change
  useEffect(() => {
    const dataToSave: SavedUserData = {
      currentUser,
      gameHistory,
      unlockedAchievements,
      landmarkProgress,
      usedStaticQuestions: Array.from(usedStaticQuestions),
    };
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(dataToSave));
  }, [currentUser, gameHistory, unlockedAchievements, landmarkProgress, usedStaticQuestions]);

  const markQuestionsUsed = useCallback((keys: string[]) => {
    setUsedStaticQuestions((prev) => new Set([...prev, ...keys]));
  }, []);

  return {
    currentUser,
    setCurrentUser,
    allUsers,
    setAllUsers,
    gameHistory,
    setGameHistory,
    unlockedAchievements,
    setUnlockedAchievements,
    landmarkProgress,
    setLandmarkProgress,
    usedStaticQuestions,
    markQuestionsUsed,
  };
}
