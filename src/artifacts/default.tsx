import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Plus, Save, Search, Pencil, Trash2, Settings, Grid, Layout, Download, Upload, LucideIcon, List, ShoppingBag, Leaf } from 'lucide-react';
import ContributionGrid from '../components/ContributionGrid';
import { useWindowSize } from '../components/hooks/useWindowSize';
import { ThemeToggle } from '../components/ThemeToggle';
import { PlantDisplay } from '../components/PlantDisplay';

// Plant types and their growth states
type PlantType = 'sunflower' | 'cactus' | 'tree' | 'flower' | 'bonsai' | 'none';

type PlantInfo = {
  type: PlantType;
  level: number;
  maxLevel: number;
  name: string;
  price: number;
};

type HabitData = {
  date: string;
  value: number;
};

type Habit = {
  id: string;
  name: string;
  unit: string;
  useTimer: boolean;
  plantType: PlantType;
  levels: {
    low: number;
    medium: number;
    high: number;
  };
  data: HabitData[];
};

const EmptyState = ({ onAddHabit }: { onAddHabit: () => void }) => (
  <div className="flex flex-col items-center justify-center h-[60vh] p-4 text-center">
    <div className="bg-gray-800 p-8 rounded-lg max-w-md w-full">
      <h2 className="text-xl font-bold mb-4">Welcome to Habit Tracker</h2>
      <p className="text-gray-400 mb-6">Start tracking your habits by creating your first one</p>
      <button
        onClick={onAddHabit}
        className="btn-primary flex items-center gap-2 mx-auto"
      >
        <Plus size={20} />
        Add First Habit
      </button>
    </div>
  </div>
);

const NavButton = ({ 
  active, 
  onClick, 
  icon: Icon, 
  children 
}: { 
  active: boolean; 
  onClick: () => void; 
  icon: LucideIcon; 
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className={active ? 'nav-tab-active' : 'nav-tab'}
  >
    <Icon size={20} className={active ? 'text-accent' : ''} />
    <span className="hidden sm:inline">{children}</span>
  </button>
);

// Available plants for purchase
const availablePlants: PlantInfo[] = [
  { type: 'sunflower', level: 0, maxLevel: 5, name: 'Sunflower', price: 50 },
  { type: 'cactus', level: 0, maxLevel: 5, name: 'Cactus', price: 100 },
  { type: 'tree', level: 0, maxLevel: 5, name: 'Tree', price: 150 },
  { type: 'flower', level: 0, maxLevel: 5, name: 'Flower', price: 75 },
  { type: 'bonsai', level: 0, maxLevel: 5, name: 'Bonsai', price: 200 }
];

export default function HabitTracker() {
  // Update initial state to empty array
  const [habits, setHabits] = useState<Habit[]>(() => {
    try {
      const saved = localStorage.getItem('habits');
      const parsedHabits = saved ? JSON.parse(saved) : [];
      // Add plantType if it doesn't exist in saved habits
      return parsedHabits.map((h: any) => ({
        ...h,
        plantType: h.plantType || 'none'
      }));
    } catch (error) {
      console.error('Error loading habits:', error);
      return [];
    }
  });

  // Initialize activeHabit to null or undefined when no habits exist
  const [activeHabit, setActiveHabit] = useState<string>(() => {
    return habits.length > 0 ? habits[0].id : '';
  });

  // Add coins/money state
  const [coins, setCoins] = useState<number>(() => {
    try {
      const savedCoins = localStorage.getItem('coins');
      return savedCoins ? parseInt(savedCoins) : 0;
    } catch (error) {
      console.error('Error loading coins:', error);
      return 0;
    }
  });

  const [activeView, setActiveView] = useState<'dashboard' | 'single'>('single');
  const [showHabitForm, setShowHabitForm] = useState(false);
  
  // Timer related state
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [targetMinutes, setTargetMinutes] = useState(25);
  const [showLogForm, setShowLogForm] = useState(false);
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [logMinutes, setLogMinutes] = useState(25);
  const [activeTab, setActiveTab] = useState<'grid' | 'list'>('grid'); // Changed from 'history'
  const [searchDate, setSearchDate] = useState('');
  const [editingEntry, setEditingEntry] = useState<HabitData | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Add new state for habit form
  const [newHabit, setNewHabit] = useState({
    name: '',
    unit: '',
    useTimer: false,
    plantType: 'none' as PlantType,
    levels: {
      low: 30,
      medium: 60,
      high: 120
    }
  });

  // Add settings state
  const [showSettings, setShowSettings] = useState(false);

  // Add shop state
  const [showShop, setShowShop] = useState(false);
  const [ownedPlants, setOwnedPlants] = useState<PlantInfo[]>(() => {
    try {
      const saved = localStorage.getItem('ownedPlants');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading owned plants:', error);
      return [];
    }
  });

  // Add new state for habit editing
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [deleteHabitConfirm, setDeleteHabitConfirm] = useState<string | null>(null);

  // Save to localStorage whenever habits change
  useEffect(() => {
    localStorage.setItem('habits', JSON.stringify(habits));
  }, [habits]);

  // Save coins to localStorage
  useEffect(() => {
    localStorage.setItem('coins', coins.toString());
  }, [coins]);

  // Save owned plants to localStorage
  useEffect(() => {
    localStorage.setItem('ownedPlants', JSON.stringify(ownedPlants));
  }, [ownedPlants]);

  const addHabit = (habit: Omit<Habit, 'id' | 'data'>) => {
    const newHabit = {
      ...habit,
      id: Date.now().toString(),
      data: []
    };
    setHabits(prev => [...prev, newHabit]);
    setActiveHabit(newHabit.id); // Set the active habit to the newly created one
  };

  const deleteHabit = (habitId: string) => {
    setHabits(prev => prev.filter(h => h.id !== habitId));
    if (activeHabit === habitId) {
      setActiveHabit(habits.find(h => h.id !== habitId)?.id || '');
    }
    setDeleteHabitConfirm(null);
  };

  const updateHabit = (habitId: string, updates: Partial<Omit<Habit, 'id' | 'data'>>) => {
    setHabits(prev => prev.map(h => 
      h.id === habitId ? { ...h, ...updates } : h
    ));
  };

  const exportData = () => {
    const data = JSON.stringify({
      habits,
      activeHabit,
      activeView,
      activeTab,
      coins,
      ownedPlants
    }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'habits-all-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        setHabits(imported.habits || imported); // Handle both new and old format
        if (imported.activeHabit) setActiveHabit(imported.activeHabit);
        if (imported.activeView) setActiveView(imported.activeView);
        if (imported.activeTab) setActiveTab(imported.activeTab);
        if (imported.coins) setCoins(imported.coins);
        if (imported.ownedPlants) setOwnedPlants(imported.ownedPlants);
        setShowSettings(false);
      } catch (error) {
        alert('Error importing data. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  // Function to calculate plant growth level based on habit data
  const calculatePlantLevel = (habit: Habit): number => {
    if (habit.plantType === 'none') return 0;
    
    // Calculate total minutes/units logged
    const totalValue = habit.data.reduce((sum, entry) => sum + entry.value, 0);
    
    // Find matching plant info
    const plantInfo = availablePlants.find(p => p.type === habit.plantType);
    if (!plantInfo) return 0;
    
    // Calculate level based on total value and thresholds
    const thresholdPerLevel = 200; // Example: 200 minutes/units per level
    let level = Math.floor(totalValue / thresholdPerLevel);
    
    // Cap at max level
    return Math.min(level, plantInfo.maxLevel);
  };

  const saveFocusTime = () => {
    const today = new Date().toISOString().split('T')[0];
    setHabits(prev => prev.map(h => {
      if (h.id !== activeHabit) return h;
      const existingEntry = h.data.find(d => d.date === today);
      const newData = existingEntry
        ? h.data.map(d => d.date === today ? { ...d, value: d.value + targetMinutes } : d)
        : [...h.data, { date: today, value: targetMinutes }];
      return { ...h, data: newData };
    }));
    
    // Add coins when completing timer
    const earnedCoins = Math.floor(targetMinutes / 5); // 1 coin per 5 minutes
    setCoins(prev => prev + earnedCoins);
  };

  const logCurrentTime = () => {
    const elapsedMinutes = Math.ceil(seconds / 60); // Round up to nearest minute
    if (elapsedMinutes === 0) return;

    const today = new Date().toISOString().split('T')[0];
    setHabits(prev => prev.map(h => {
      if (h.id !== activeHabit) return h;
      const existingEntry = h.data.find(d => d.date === today);
      const newData = existingEntry
        ? h.data.map(d => d.date === today ? { ...d, value: d.value + elapsedMinutes } : d)
        : [...h.data, { date: today, value: elapsedMinutes }];
      return { ...h, data: newData };
    }));
    
    // Add coins when logging time
    const earnedCoins = Math.floor(elapsedMinutes / 5); // 1 coin per 5 minutes
    setCoins(prev => prev + earnedCoins);
    
    setSeconds(0);
  };

  // Add useEffect to update activeHabit when habits change
  useEffect(() => {
    if (habits.length > 0 && !habits.find(h => h.id === activeHabit)) {
      setActiveHabit(habits[0].id);
    }
  }, [habits, activeHabit]);

  // Add new function to buy plants
  const buyPlant = (plant: PlantInfo) => {
    if (coins >= plant.price) {
      setCoins(prev => prev - plant.price);
      setOwnedPlants(prev => [...prev, {...plant, level: 0}]);
    }
  };

  // Add new function to set plant for a habit
  const setPlantForHabit = (habitId: string, plantType: PlantType) => {
    setHabits(prev => prev.map(h => 
      h.id === habitId ? { ...h, plantType } : h
    ));
  };

  // Add timer and other state/functions
  // Add new state for timer
  const [startTime, setStartTime] = useState<number | null>(null);

  // Replace timer logic
  const syncTimer = () => {
    if (!startTime || !isRunning) return;
    
    const now = Date.now();
    const elapsed = Math.floor((now - startTime) / 1000);
    
    // Check if timer should stop
    if (elapsed >= targetMinutes * 60) {
      setIsRunning(false);
      setStartTime(null);
      setSeconds(0);
      saveFocusTime();
    } else {
      setSeconds(elapsed);
    }
  };

  // Update toggleTimer
  const toggleTimer = () => {
    if (isRunning) {
      // Stopping the timer
      setIsRunning(false);
      setStartTime(null);
    } else {
      // Starting the timer
      const now = Date.now();
      setStartTime(now - (seconds * 1000)); // Account for existing seconds
      setIsRunning(true);
    }
  };

  // Update resetTimer
  const resetTimer = () => {
    setIsRunning(false);
    setStartTime(null);
    setSeconds(0);
  };

  // Replace timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning) {
      // Sync immediately
      syncTimer();
      
      // Then sync every second
      interval = setInterval(() => {
        syncTimer();
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, startTime, targetMinutes]);

  // Add effect to restore timer state on page load
  useEffect(() => {
    const savedTimer = localStorage.getItem('timerState');
    if (savedTimer) {
      const { startTime, targetMinutes } = JSON.parse(savedTimer);
      if (startTime) {
        setStartTime(startTime);
        setTargetMinutes(targetMinutes);
        setIsRunning(true);
      }
    }
  }, []);

  // Add effect to save timer state
  useEffect(() => {
    if (startTime) {
      localStorage.setItem('timerState', JSON.stringify({
        startTime,
        targetMinutes
      }));
    } else {
      localStorage.removeItem('timerState');
    }
  }, [startTime, targetMinutes]);

  // Add cleanup effect
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isRunning) {
        syncTimer();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [isRunning, startTime]);

  const logContribution = (e: React.FormEvent) => {
    e.preventDefault();
    setHabits(prev => prev.map(h => {
      if (h.id !== activeHabit) return h;
      if (editingEntry) {
        // Replace the existing entry completely rather than adding to it
        return {
          ...h,
          data: h.data.map(d => d.date === editingEntry.date 
            ? { date: logDate, value: logMinutes }
            : d
          )
        };
      }
      const existingEntry = h.data.find(d => d.date === logDate);
      const newData = existingEntry
        ? h.data.map(d => d.date === logDate 
            ? { ...d, value: logMinutes } // Replace value instead of adding
            : d
          )
        : [...h.data, { date: logDate, value: logMinutes }];
      return { ...h, data: newData };
    }));
    
    // Add coins when manually logging
    if (!editingEntry) {
      const earnedCoins = Math.floor(logMinutes / 5); // 1 coin per 5 minutes
      setCoins(prev => prev + earnedCoins);
    }
    
    setShowLogForm(false);
    setEditingEntry(null);
  };

  const handleEditEntry = (entry: HabitData) => {
    setEditingEntry(entry);
    setLogDate(entry.date);
    setLogMinutes(entry.value); // Use the value from the cell being edited
    setShowLogForm(true);
  };

  const handleDeleteEntry = (date: string) => {
    setDeleteConfirm(date);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      setHabits(prev => prev.map(h => {
        if (h.id !== activeHabit) return h;
        return { ...h, data: h.data.filter(d => d.date !== deleteConfirm) };
      }));
      setDeleteConfirm(null);
    }
  };

  const filteredHistory = () => {
    const habit = habits.find(h => h.id === activeHabit);
    if (!habit) return [];
    return [...habit.data]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .filter(entry => entry.date.includes(searchDate));
  };

  // Effects
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds(s => {
          if (s + 1 >= targetMinutes * 60) {
            setIsRunning(false);
            saveFocusTime();
            return 0;
          }
          return s + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, targetMinutes]);

  const handleHabitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addHabit(newHabit);
    setShowHabitForm(false);
    setNewHabit({
      name: '',
      unit: '',
      useTimer: false,
      plantType: 'none',
      levels: {
        low: 30,
        medium: 60,
        high: 120
      }
    });
  };

  // Add useEffect to update activeHabit when habits change
  useEffect(() => {
    if (habits.length > 0 && !habits.find(h => h.id === activeHabit)) {
      setActiveHabit(habits[0].id);
    }
  }, [habits, activeHabit]);

  // Update the convertToGridData function with null checks
  const convertToGridData = (habit?: Habit) => {
    if (!habit) return {};
    
    const data: Record<string, number> = {};
    habit.data.forEach(entry => {
      data[entry.date] = entry.value;
    });
    return data;
  };

  // Add helper to get cell value
  const getCellValue = (date: string) => {
    const habit = habits.find(h => h.id === activeHabit);
    const entry = habit?.data.find(d => d.date === date);
    return entry?.value || 0;
  };

  // Update cell click handler in both grid views
  const handleCellClick = (date: string) => {
    setLogDate(date);
    setLogMinutes(getCellValue(date)); // Set the exact value from the cell
    setShowLogForm(true);
  };

  const windowWidth = useWindowSize();
  const shouldSplitYear = windowWidth < 768; // Split on screens smaller than medium breakpoint

  // In the render logic, add optional chaining and null checks
  return (
    <div className="min-h-screen bg-background text-foreground">
      {habits.length === 0 ? (
        <EmptyState onAddHabit={() => setShowHabitForm(true)} />
      ) : (
        <div className="max-w-6xl mx-auto px-4 py-4 sm:p-8">
          {/* Update card backgrounds */}
          <div className="flex justify-between items-center mb-6 sm:mb-8">
            <div className="flex gap-2 sm:gap-4">
              <NavButton
                active={activeView === 'dashboard'}
                onClick={() => setActiveView('dashboard')}
                icon={Layout}
              >
                Dashboard
              </NavButton>
              <NavButton
                active={activeView === 'single'}
                onClick={() => setActiveView('single')}
                icon={Grid}
              >
                Single View
              </NavButton>
            </div>
            <div className="flex items-center gap-2">
              {/* Money counter display */}
              <div className="flex items-center px-3 py-1 bg-card rounded-full mr-2">
                <span className="text-yellow-400 mr-1">⚡</span>
                <span className="font-semibold">{coins}</span>
              </div>
              
              <button
                onClick={() => setShowShop(true)}
                className="btn-secondary flex items-center gap-2"
              >
                <ShoppingBag size={20} />
                <span className="hidden sm:inline">Shop</span>
              </button>
              
              <ThemeToggle />
              <button
                onClick={() => setShowSettings(true)}
                className="btn-secondary flex items-center gap-2"
              >
                <Settings size={20} />
                <span className="hidden sm:inline">Settings</span>
              </button>
              <button
                onClick={() => setShowHabitForm(true)}
                className="btn-primary flex items-center gap-2 sm:px-4"
              >
                <Plus size={20} />
                <span className="hidden sm:inline">Add Habit</span>
              </button>
            </div>
          </div>

          {activeView === 'dashboard' ? (
            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
              {habits.map(habit => (
                <div key={habit.id} className="bg-card p-4 sm:p-6 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">{habit.name}</h2>
                    <span className="text-sm text-gray-400">Unit: {habit.unit}</span>
                  </div>
                  
                  {/* Add plant display in dashboard */}
                  {habit.plantType !== 'none' && (
                    <div className="mb-4 flex justify-center">
                      <PlantDisplay 
                        type={habit.plantType} 
                        level={calculatePlantLevel(habit)} 
                      />
                    </div>
                  )}
                  
                  <div className="space-y-6 overflow-auto"> {/* Added overflow-auto */}
                    <div className="min-w-fit"> {/* Added min-w-fit to prevent shrinking */}
                      <h3 className="text-sm text-gray-400 mb-2">Jan - June</h3>
                      {habit && (
                        <ContributionGrid
                          data={convertToGridData(habit)}
                          levels={habit.levels}
                          unit={habit.unit}
                          onCellClick={handleCellClick}
                          size="small"
                          timeRange="first-half"
                        />
                      )}
                    </div>
                    <div className="min-w-fit"> {/* Added min-w-fit to prevent shrinking */}
                      <h3 className="text-sm text-gray-400 mb-2">July - Dec</h3>
                      {habit && (
                        <ContributionGrid
                          data={convertToGridData(habit)}
                          levels={habit.levels}
                          unit={habit.unit}
                          onCellClick={handleCellClick}
                          size="small"
                          timeRange="second-half"
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-card rounded-lg">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 gap-4 sm:gap-0">
                <select
                  value={activeHabit}
                  onChange={(e) => setActiveHabit(e.target.value)}
                  className="select w-full sm:w-auto"
                >
                  {habits.map(h => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>

              {/* Plant Display Section */}
              {habits.find(h => h.id === activeHabit)?.plantType !== 'none' && (
                <div className="p-4 sm:p-6 border-t border-gray-700 flex justify-center items-center">
                  <div className="text-center">
                    <PlantDisplay 
                      type={habits.find(h => h.id === activeHabit)!.plantType} 
                      level={calculatePlantLevel(habits.find(h => h.id === activeHabit)!)} 
                      size="large"
                    />
                    <button 
                      onClick={() => setShowShop(true)}
                      className="mt-4 btn-primary flex items-center gap-2 mx-auto"
                    >
                      <Leaf size={16} />
                      Change Plant
                    </button>
                  </div>
                </div>
              )}

              {/* Timer Section */}
              {habits.find(h => h.id === activeHabit)?.useTimer && (
                <div className="p-4 sm:p-6 border-t border-gray-700">
                  <div className="text-3xl sm:text-4xl font-bold mb-4 text-center">
                    {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 sm:gap-4 justify-center">
                    <input
                      type="number"
                      value={targetMinutes}
                      onChange={(e) => setTargetMinutes(Math.max(1, parseInt(e.target.value) || 0))}
                      className="input w-20"
                      min="1"
                    />
                    <button
                      onClick={toggleTimer}
                      className="btn-success flex items-center gap-2 flex-1 sm:flex-none justify-center"
                    >
                      {isRunning ? <Pause size={20} /> : <Play size={20} />}
                      {isRunning ? 'Pause' : 'Start'}
                    </button>
                    {!isRunning && seconds > 0 && (
                      <button
                        onClick={logCurrentTime}
                        className="btn-success flex items-center gap-2"
                      >
                        <Save size={20} />
                        Log Current {habits.find(h => h.id === activeHabit)?.unit}
                      </button>
                    )}
                    <button
                      onClick={resetTimer}
                      className="btn-destructive flex items-center gap-2"
                    >
                      <Square size={20} />
                      Reset
                    </button>
                  </div>
                </div>
              )}

              {/* History Section */}
              <div className="border-t border-gray-700">
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-xl font-bold">{habits.find(h => h.id === activeHabit)?.name} History</h2>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
                      <button
                        onClick={() => {
                          setShowLogForm(true);
                          setEditingEntry(null);
                        }}
                        className="btn-primary flex items-center justify-center gap-2"
                      >
                        <Plus size={20} />
                        Log {habits.find(h => h.id === activeHabit)?.unit}
                      </button>
                      <div className="flex gap-1"> {/* Removed bg-gray-700 class */}
                        <button
                          onClick={() => setActiveTab('grid')}
                          className={`view-tab ${
                            activeTab === 'grid' 
                              ? 'view-tab-active' 
                              : 'view-tab-inactive'
                          }`}
                        >
                          <Grid 
                            size={16} 
                            className={activeTab === 'grid' ? 'text-accent' : ''} 
                          />
                          <span className="ml-2">Grid View</span>
                        </button>
                        <button
                          onClick={() => setActiveTab('list')}
                          className={`view-tab ${
                            activeTab === 'list' 
                              ? 'view-tab-active' 
                              : 'view-tab-inactive'
                          }`}
                        >
                          <List 
                            size={16} 
                            className={activeTab === 'list' ? 'text-accent' : ''} 
                          />
                          <span className="ml-2">List View</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Delete Confirmation Dialog */}
                  {deleteConfirm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-gray-800 p-6 rounded-lg max-w-sm w-full mx-4 shadow-xl">
                        <h3 className="text-lg font-semibold mb-4">Delete Entry</h3>
                        <p className="mb-6">Are you sure you want to delete the entry for {deleteConfirm}?</p>
                        <div className="flex justify-end gap-4">
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="btn-secondary"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={confirmDelete}
                            className="btn-destructive"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {showLogForm && (
                    <form onSubmit={logContribution} className="form mb-4 p-4 bg-gray-700 rounded-lg">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block mb-2">Date</label>
                          <input
                            type="date"
                            value={logDate}
                            onChange={(e) => setLogDate(e.target.value)}
                            className="input w-full"
                            max={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                        <div>
                          <label className="block mb-2">{habits.find(h => h.id === activeHabit)?.unit}</label>
                          <input
                            type="number"
                            value={logMinutes}
                            onChange={(e) => setLogMinutes(Math.max(1, parseInt(e.target.value) || 0))}
                            className="input w-full"
                            min="1"
                          />
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowLogForm(false)}
                          className="btn-secondary"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn-primary"
                        >
                          Save
                        </button>
                      </div>
                    </form>
                  )}

                  {activeTab === 'list' ? (
                    <div className="mt-4">
                      <div className="flex gap-4 mb-4">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                          <input
                            type="text"
                            placeholder="Search by date (YYYY-MM-DD)"
                            value={searchDate}
                            onChange={(e) => setSearchDate(e.target.value)}
                            className="input w-full pl-10 pr-4"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        {filteredHistory().map((entry) => (
                          <div
                            key={entry.date}
                            className="flex items-center justify-between bg-gray-700 p-3 rounded"
                          >
                            <div>
                              <span className="font-medium">{entry.date}</span>
                              <span className="ml-4 text-gray-300">{entry.value} {habits.find(h => h.id === activeHabit)?.unit}</span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditEntry(entry)}
                                className="p-1 hover:bg-gray-600 rounded"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteEntry(entry.date)}
                                className="p-1 hover:bg-gray-600 rounded text-red-400"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 overflow-x-auto pb-4"> {/* Added overflow handling */}
                      <div className="flex justify-center min-w-fit"> {/* Ensure minimum width fits content */}
                        <div className="w-[98%] md:w-[95%]"> {/* Adjusted width and made it responsive */}
                          <div className="space-y-4 sm:space-y-6">
                            {shouldSplitYear ? (
                              // Split view for small screens
                              <>
                                <div>
                                  <h3 className="text-sm text-gray-400 mb-1"> {/* Reduced margin */}
                                    <ContributionGrid
                                      data={convertToGridData(habits.find(h => h.id === activeHabit)!)}
                                      levels={habits.find(h => h.id === activeHabit)!.levels}
                                      unit={habits.find(h => h.id === activeHabit)!.unit}
                                      onCellClick={handleCellClick}
                                      size="default"
                                      timeRange="first-half"
                                    />
                                  </h3>
                                </div>
                                <div>
                                  <h3 className="text-sm text-gray-400 mb-1"> {/* Reduced margin */}
                                    <ContributionGrid
                                      data={convertToGridData(habits.find(h => h.id === activeHabit)!)}
                                      levels={habits.find(h => h.id === activeHabit)!.levels}
                                      unit={habits.find(h => h.id === activeHabit)!.unit}
                                      onCellClick={handleCellClick}
                                      size="default"
                                      timeRange="second-half"
                                    />
                                  </h3>
                                </div>
                              </>
                            ) : (
                              // Full year view for larger screens
                              <div>
                                <h3 className="text-sm text-gray-400 mb-1"> {/* Reduced margin */}
                                  <ContributionGrid
                                    data={convertToGridData(habits.find(h => h.id === activeHabit)!)}
                                    levels={habits.find(h => h.id === activeHabit)!.levels}
                                    unit={habits.find(h => h.id === activeHabit)!.unit}
                                    onCellClick={handleCellClick}
                                    size="default"
                                    timeRange="full-year"
                                  />
                                </h3>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Habit form modal */}
      {showHabitForm && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Add New Habit</h3>
            <form onSubmit={handleHabitSubmit} className="form">
              <div className="space-y-4">
                <div>
                  <label className="block mb-2">Habit Name</label>
                  <input
                    type="text"
                    value={newHabit.name}
                    onChange={(e) => setNewHabit(prev => ({ ...prev, name: e.target.value }))}
                    className="input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2">Unit Type</label>
                  <input
                    type="text"
                    value={newHabit.unit}
                    onChange={(e) => setNewHabit(prev => ({ ...prev, unit: e.target.value }))}
                    className="input w-full"
                    placeholder="e.g., minutes, pages, steps"
                    required
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input 
                      type="checkbox"
                      checked={newHabit.useTimer}
                      onChange={(e) => setNewHabit(prev => ({ ...prev, useTimer: e.target.checked }))}
                    />
                    Enable Timer
                  </label>
                </div>
                
                {/* Plant selection */}
                <div>
                  <label className="block mb-2">Plant Type</label>
                  <select
                    value={newHabit.plantType}
                    onChange={(e) => setNewHabit(prev => ({ 
                      ...prev, 
                      plantType: e.target.value as PlantType 
                    }))}
                    className="select w-full"
                  >
                    <option value="none">No Plant</option>
                    {ownedPlants.map(plant => (
                      <option key={plant.type} value={plant.type}>{plant.name}</option>
                    ))}
                  </select>
                  {newHabit.plantType === 'none' && ownedPlants.length > 0 && (
                    <p className="text-sm text-gray-400 mt-1">
                      Select a plant to visualize your progress!
                    </p>
                  )}
                  {ownedPlants.length === 0 && (
                    <p className="text-sm text-gray-400 mt-1">
                      Visit the shop to buy plants first!
                    </p>
                  )}
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-2">Low</label>
                    <input
                      type="number"
                      value={newHabit.levels.low}
                      onChange={(e) => setNewHabit(prev => ({
                        ...prev,
                        levels: { ...prev.levels, low: parseInt(e.target.value) || 0 }
                      }))}
                      className="input w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-2">Medium</label>
                    <input
                      type="number"
                      value={newHabit.levels.medium}
                      onChange={(e) => setNewHabit(prev => ({
                        ...prev,
                        levels: { ...prev.levels, medium: parseInt(e.target.value) || 0 }
                      }))}
                      className="input w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-2">High</label>
                    <input
                      type="number"
                      value={newHabit.levels.high}
                      onChange={(e) => setNewHabit(prev => ({
                        ...prev,
                        levels: { ...prev.levels, high: parseInt(e.target.value) || 0 }
                      }))}
                      className="input w-full"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowHabitForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Add Habit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Plant Shop Modal */}
      {showShop && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Plant Shop</h3>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 bg-gray-700 rounded-full">
                  <span className="text-yellow-400 mr-1">⚡</span>
                  <span className="font-semibold">{coins}</span>
                </div>
                <button
                  onClick={() => setShowShop(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {availablePlants.map(plant => {
                const isOwned = ownedPlants.some(p => p.type === plant.type);
                const currentHabitPlant = habits.find(h => h.id === activeHabit)?.plantType === plant.type;
                
                return (
                  <div key={plant.type} className="bg-gray-800 p-4 rounded-lg text-center">
                    <div className="h-32 flex items-center justify-center">
                      <PlantDisplay type={plant.type} level={plant.maxLevel} />
                    </div>
                    <h4 className="font-medium mt-2">{plant.name}</h4>
                    <p className="text-sm text-gray-400 mb-2">Max Level: {plant.maxLevel}</p>
                    
                    {isOwned ? (
                      currentHabitPlant ? (
                        <button 
                          className="btn-secondary w-full mt-2 opacity-50 cursor-not-allowed" 
                          disabled
                        >
                          Current Plant
                        </button>
                      ) : (
                        <button 
                          onClick={() => {
                            setPlantForHabit(activeHabit, plant.type);
                            setShowShop(false);
                          }}
                          className="btn-primary w-full mt-2"
                        >
                          Select for Habit
                        </button>
                      )
                    ) : (
                      <button 
                        onClick={() => buyPlant(plant)}
                        className={`w-full mt-2 ${
                          coins >= plant.price 
                            ? 'btn-success' 
                            : 'btn-secondary opacity-50 cursor-not-allowed'
                        }`}
                        disabled={coins < plant.price}
                      >
                        Buy for {plant.price} ⚡
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            
            {ownedPlants.length > 0 && (
              <div className="mt-8">
                <h4 className="font-medium mb-4">Remove Plant from Current Habit</h4>
                <button 
                  onClick={() => {
                    setPlantForHabit(activeHabit, 'none');
                    setShowShop(false);
                  }}
                  className="btn-destructive"
                >
                  Remove Plant
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Settings</h3>
              <button
                onClick={() => {
                  setShowSettings(false);
                  setEditingHabit(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Habit Settings */}
              <div>
                <h4 className="text-sm font-medium mb-4">Habit Settings</h4>
                <div className="space-y-4">
                  {habits.map(habit => (
                    <div key={habit.id} className="bg-gray-700 p-4 rounded-lg">
                      {editingHabit?.id === habit.id ? (
                        <div className="space-y-4">
                          <div>
                            <label className="block mb-2">Name</label>
                            <input
                              type="text"
                              value={editingHabit.name}
                              onChange={(e) => setEditingHabit(prev => 
                                prev ? { ...prev, name: e.target.value } : prev
                              )}
                              className="input w-full"
                            />
                          </div>
                          <div>
                            <label className="block mb-2">Unit</label>
                            <input
                              type="text"
                              value={editingHabit.unit}
                              onChange={(e) => setEditingHabit(prev => 
                                prev ? { ...prev, unit: e.target.value } : prev
                              )}
                              className="input w-full"
                            />
                          </div>
                          <div>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={editingHabit.useTimer}
                                onChange={(e) => setEditingHabit(prev => 
                                  prev ? { ...prev, useTimer: e.target.checked } : prev
                                )}
                              />
                              Enable Timer
                            </label>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            {['low', 'medium', 'high'].map(level => (
                              <div key={level}>
                                <label className="block mb-2 capitalize">{level}</label>
                                <input
                                  type="number"
                                  value={editingHabit.levels[level as keyof typeof editingHabit.levels]}
                                  onChange={(e) => setEditingHabit(prev => 
                                    prev ? {
                                      ...prev,
                                      levels: {
                                        ...prev.levels,
                                        [level]: parseInt(e.target.value) || 0
                                      }
                                    } : prev
                                  )}
                                  className="input w-full"
                                />
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setEditingHabit(null)}
                              className="btn-secondary"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => {
                                if (editingHabit) {
                                  updateHabit(editingHabit.id, {
                                    name: editingHabit.name,
                                    unit: editingHabit.unit,
                                    useTimer: editingHabit.useTimer,
                                    levels: editingHabit.levels
                                  });
                                }
                                setEditingHabit(null);
                              }}
                              className="btn-primary"
                            >
                              Save Changes
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium">{habit.name}</h5>
                            <p className="text-sm text-gray-400">Unit: {habit.unit}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingHabit(habit)}
                              className="p-1.5 rounded hover:bg-gray-600"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => setDeleteHabitConfirm(habit.id)}
                              className="p-1.5 rounded hover:bg-gray-600 text-red-400"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-700 my-6"></div>

              {/* Export/Import Section */}
              <div>
                <h4 className="text-sm font-medium mb-4">Data Management</h4>
                <div className="space-y-4">
                  <button
                    onClick={exportData}
                    className="btn-success w-full flex items-center justify-center gap-2"
                  >
                    <Download size={16} />
                    Export All Data
                  </button>
                  <label className="btn-success w-full flex items-center justify-center gap-2 cursor-pointer">
                    <Upload size={16} />
                    Import Data
                    <input
                      type="file"
                      accept=".json"
                      onChange={importData}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-400">
                    Warning: Importing data will replace all current habits and settings
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Habit Confirmation */}
      {deleteHabitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Delete Habit</h3>
            <p className="mb-6">Are you sure you want to delete this habit? This action cannot be undone.</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setDeleteHabitConfirm(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteHabit(deleteHabitConfirm)}
                className="btn-destructive"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
