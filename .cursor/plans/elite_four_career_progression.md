# Elite Four Career Progression System

## Overview
Implement a career progression system for Elite Four challenges with two modes:
1. **Free Play Mode**: Current behavior - choose any unlocked region
2. **Career Mode**: Sequential progression through regions with unlocks

## Career Mode Features

### Mode Selection
- Add mode selector in lobby (Free Play vs Career Mode)
- Career Mode tracks progression through all 6 regions sequentially
- Free Play allows choosing any unlocked region

### Region Unlocking System
- **Kanto**: Unlocked by default
- **Johto**: Unlock after completing Kanto
- **Hoenn**: Unlock after completing Johto
- **Sinnoh**: Unlock after completing Hoenn
- **Unova**: Unlock after completing Sinnoh
- **Kalos**: Unlock after completing Unova

### Master Mode
- Unlocks after completing all 6 regions in Career Mode
- All 6 regions in sequence without breaks
- More challenging - complete all regions consecutively
- Special achievements/recognition for completing Master Mode

## Implementation Plan

### 1. Create Career Store

**File: `src/store/eliteFourCareerStore.ts`**

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getAllEliteFourConfigs } from "@/data/eliteFour";

export type GameMode = "free" | "career" | "master";

export interface CareerProgress {
  unlockedRegions: string[]; // Region IDs that are unlocked
  completedRegions: string[]; // Region IDs that have been completed
  currentRegion: string | null; // Current region in career mode
  masterModeUnlocked: boolean;
  masterModeCompleted: boolean;
}

interface EliteFourCareerStore {
  gameMode: GameMode;
  setGameMode: (mode: GameMode) => void;
  careerProgress: CareerProgress;
  unlockRegion: (regionId: string) => void;
  completeRegion: (regionId: string) => void;
  startCareer: () => void;
  startMasterMode: () => void;
  resetCareer: () => void;
  getNextUnlockedRegion: () => string | null;
  isRegionUnlocked: (regionId: string) => boolean;
  isRegionCompleted: (regionId: string) => boolean;
}

export const useEliteFourCareerStore = create<EliteFourCareerStore>()(
  persist(
    (set, get) => ({
      gameMode: "free",
      setGameMode: (mode) => set({ gameMode: mode }),
      
      careerProgress: {
        unlockedRegions: ["kanto"], // Kanto unlocked by default
        completedRegions: [],
        currentRegion: "kanto",
        masterModeUnlocked: false,
        masterModeCompleted: false,
      },
      
      unlockRegion: (regionId) => {
        const progress = get().careerProgress;
        if (!progress.unlockedRegions.includes(regionId)) {
          set({
            careerProgress: {
              ...progress,
              unlockedRegions: [...progress.unlockedRegions, regionId],
            },
          });
        }
      },
      
      completeRegion: (regionId) => {
        const progress = get().careerProgress;
        const isNewlyCompleted = !progress.completedRegions.includes(regionId);
        
        if (isNewlyCompleted) {
          const allRegions = getAllEliteFourConfigs();
          const currentIndex = allRegions.findIndex(r => r.id === regionId);
          const nextRegion = currentIndex < allRegions.length - 1 
            ? allRegions[currentIndex + 1] 
            : null;
          
          // Unlock next region
          let newUnlocked = [...progress.unlockedRegions];
          let masterModeUnlocked = progress.masterModeUnlocked;
          
          if (nextRegion) {
            if (!newUnlocked.includes(nextRegion.id)) {
              newUnlocked.push(nextRegion.id);
            }
          } else {
            // Completed all regions - unlock Master Mode
            masterModeUnlocked = true;
          }
          
          set({
            careerProgress: {
              ...progress,
              completedRegions: [...progress.completedRegions, regionId],
              unlockedRegions: newUnlocked,
              masterModeUnlocked,
              currentRegion: nextRegion?.id || null,
            },
          });
        }
      },
      
      startCareer: () => {
        const progress = get().careerProgress;
        // Start from first uncompleted region, or Kanto if all completed
        const allRegions = getAllEliteFourConfigs();
        const firstUncompleted = allRegions.find(
          r => !progress.completedRegions.includes(r.id)
        );
        
        set({
          gameMode: "career",
          careerProgress: {
            ...progress,
            currentRegion: firstUncompleted?.id || "kanto",
          },
        });
      },
      
      startMasterMode: () => {
        set({ gameMode: "master" });
      },
      
      resetCareer: () => {
        set({
          careerProgress: {
            unlockedRegions: ["kanto"],
            completedRegions: [],
            currentRegion: "kanto",
            masterModeUnlocked: false,
            masterModeCompleted: false,
          },
          gameMode: "free",
        });
      },
      
      getNextUnlockedRegion: () => {
        const progress = get().careerProgress;
        const allRegions = getAllEliteFourConfigs();
        const uncompleted = allRegions.find(
          r => progress.unlockedRegions.includes(r.id) && 
               !progress.completedRegions.includes(r.id)
        );
        return uncompleted?.id || null;
      },
      
      isRegionUnlocked: (regionId) => {
        return get().careerProgress.unlockedRegions.includes(regionId);
      },
      
      isRegionCompleted: (regionId) => {
        return get().careerProgress.completedRegions.includes(regionId);
      },
    }),
    {
      name: "pokemon-elite-four-career",
    }
  )
);
```

### 2. Update Elite Four Lobby

**File: `src/components/elite-four/EliteFourLobby.tsx`**

**Changes:**
- Add mode selector (Free Play / Career Mode / Master Mode)
- In Career Mode: Show only unlocked regions, auto-select current region
- Show lock icons for locked regions in Free Play mode
- Display career progress indicator
- Show "Unlock Next Region" message after completing a region in Career Mode

**UI Structure:**
```
[Mode Selector: Free Play | Career Mode | Master Mode]
  ↓
[Region Selector - with lock indicators in Free Play]
  ↓
[Career Progress Indicator - if Career Mode]
  ↓
[Your Challengers]
  ↓
[Choose Your Pokemon]
```

### 3. Update Victory Screen

**File: `src/components/elite-four/EliteFourVictory.tsx`**

**Changes:**
- In Career Mode: Check if region completion unlocks next region
- Show unlock animation/message if new region unlocked
- Show Master Mode unlock message if all regions completed
- Add "Continue Career" button to proceed to next region (Career Mode)
- Add "Start Master Mode" button if Master Mode just unlocked

### 4. Master Mode Implementation

**Master Mode Rules:**
- All 6 regions in sequence
- No breaks between regions (automatic progression)
- Track overall progress (e.g., "Region 3 of 6")
- Special victory screen when completing all 6
- Track completion time for entire Master Mode run

**File: `src/hooks/useEliteFourMaster.ts`** (new file)

Create specialized hook for Master Mode that:
- Manages sequential region progression
- Tracks overall master mode progress
- Automatically starts next region after victory
- Handles master mode completion

### 5. Update useEliteFour Hook

**File: `src/hooks/useEliteFour.ts`**

**Changes:**
- Integrate with career store
- Track region completion
- Handle mode-specific logic

### 6. Career Progress Component

**File: `src/components/elite-four/EliteFourCareerProgress.tsx`** (new file)

Display component showing:
- All 6 regions with completion status
- Lock/unlock indicators
- Current progress in Career Mode
- Master Mode status

## Data Flow

### Career Mode Flow:
1. User selects Career Mode in lobby
2. System shows only unlocked regions (starts with Kanto)
3. User selects Pokemon and starts challenge
4. On victory: `completeRegion()` called → unlocks next region
5. If all 6 completed → Master Mode unlocked
6. User can continue to next region or return to lobby

### Master Mode Flow:
1. User selects Master Mode (must have completed all 6 regions)
2. Starts with Kanto, progresses automatically
3. After each region victory, immediately starts next region
4. Tracks overall progress (Region X of 6)
5. Special completion screen after all 6 regions

### Free Play Flow:
- Current behavior maintained
- All unlocked regions selectable
- No progression tracking (for scoring/achievements only)

## UI/UX Considerations

1. **Mode Selector**: Toggle or tabs at top of lobby
2. **Region Lock Icons**: Visual lock overlay on locked regions
3. **Unlock Animation**: Celebration when region unlocks
4. **Progress Indicators**: Visual progress bar showing career advancement
5. **Master Mode Badge**: Special indicator when Master Mode is available

## Testing Checklist

- [ ] Kanto unlocked by default
- [ ] Completing Kanto unlocks Johto
- [ ] Sequential unlocking works correctly
- [ ] Completing all 6 unlocks Master Mode
- [ ] Master Mode progresses through all regions automatically
- [ ] Free Play still allows selecting any unlocked region
- [ ] Career progress persists across sessions
- [ ] Reset career function works correctly



