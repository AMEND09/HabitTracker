import { useState } from 'react';
// ...existing imports

const App = () => {
  const [activeTab, setActiveTab] = useState<'grid' | 'list'>('grid');

  const tabs: Array<{ id: 'grid' | 'list', label: string }> = [
    { id: 'grid', label: 'Grid' },
    { id: 'list', label: 'List View' }
  ];

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100">
      <div className="w-full max-w-7xl mx-auto">
        {/* ...existing header... */}

        <div className="w-full flex flex-col gap-4 items-center p-4">
          {/* Make tab bar width fit content */}
          <div className="inline-block border-b border-gray-600">
            <nav className="flex" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    px-4 py-2 text-sm font-medium
                    ${activeTab === tab.id 
                      ? 'border-b-2 border-blue-500 text-blue-500'
                      : 'text-gray-400 hover:text-gray-200'
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* ...rest of existing code... */}
        </div>
      </div>
    </div>
  );
};

export default App;
