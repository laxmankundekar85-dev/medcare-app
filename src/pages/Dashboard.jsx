import React, { useState } from 'react';

export default function Dashboard() {
  const [weight, setWeight] = useState(64);
  const [sleep, setSleep] = useState('7h 20m');
  const [bp, setBp] = useState('120/80');
  const [bmi, setBmi] = useState(20.9);
  const [steps, setSteps] = useState(4231);
  const [avgBpm, setAvgBpm] = useState(72);

  // Modal States
  const [activeModal, setActiveModal] = useState(null);
  const [inputVal, setInputVal] = useState('');

  const handleOpenModal = (type, currentVal) => {
    setActiveModal(type);
    setInputVal(currentVal);
  };

  const handleSaveData = (e) => {
    e.preventDefault();
    if (!inputVal) return;

    if (activeModal === 'weight') setWeight(inputVal);
    if (activeModal === 'sleep') setSleep(inputVal);
    if (activeModal === 'bp') setBp(inputVal);
    if (activeModal === 'bmi') setBmi(inputVal);
    if (activeModal === 'steps') setSteps(inputVal);
    if (activeModal === 'bpm') setAvgBpm(inputVal);

    setActiveModal(null);
    setInputVal('');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto pb-32">
      {/* Greeting Section */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Hello, Laxman!</h1>
        <p className="text-gray-500 mt-1">Your health status looks stable today.</p>
      </div>

      {/* Personalized Advice Banner */}
      <div className="bg-teal-700 text-white rounded-3xl p-6 shadow-sm mb-6 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-teal-200 font-bold text-xs tracking-wider mb-2">
            💡 PERSONALIZED ADVICE
          </div>
          <p className="text-sm md:text-base leading-relaxed mb-4 pr-12">
            Your sleep pattern improved by 12% this week. Keeping a steady schedule helps maintain BMI levels.
          </p>
          <button
            onClick={() => alert('Generating full health intelligence report...')}
            className="bg-white text-teal-900 font-semibold px-5 py-2.5 rounded-2xl text-sm shadow hover:bg-teal-50 transition"
          >
            Full Report
          </button>
        </div>
      </div>

      {/* Grid Cards (Weight & Sleep) */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Weight Card */}
        <div 
          onClick={() => handleOpenModal('weight', weight)}
          className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm cursor-pointer hover:border-teal-300 transition"
        >
          <div className="flex justify-between items-start mb-3">
            <span className="p-2.5 bg-teal-50 text-teal-700 rounded-2xl text-lg">⚖️</span>
            <span className="text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full text-xs font-bold">-0.5kg</span>
          </div>
          <p className="text-gray-500 text-sm font-medium">Weight</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{weight} <span className="text-base font-normal text-gray-400">kg</span></h3>
        </div>

        {/* Sleep Card */}
        <div 
          onClick={() => handleOpenModal('sleep', sleep)}
          className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm cursor-pointer hover:border-teal-300 transition"
        >
          <div className="flex justify-between items-start mb-3">
            <span className="p-2.5 bg-teal-50 text-teal-700 rounded-2xl text-lg">🌙</span>
            <span className="text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full text-xs font-bold">+20m</span>
          </div>
          <p className="text-gray-500 text-sm font-medium">Sleep</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{sleep}</h3>
        </div>
      </div>

      {/* Blood Pressure Banner Card */}
      <div 
        onClick={() => handleOpenModal('bp', bp)}
        className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm mb-4 flex justify-between items-center cursor-pointer hover:border-teal-300 transition"
      >
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-rose-50 text-rose-600 rounded-2xl text-xl">
            🩺
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Blood Pressure</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{bp} <span className="text-sm font-normal text-gray-400">mmHg</span></h3>
          </div>
        </div>
        <span className="bg-teal-700 text-white px-3 py-1 rounded-full text-xs font-semibold">
          Normal
        </span>
      </div>

      {/* Grid Cards (BMI & Activity) */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* BMI Card */}
        <div 
          onClick={() => handleOpenModal('bmi', bmi)}
          className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm cursor-pointer hover:border-teal-300 transition"
        >
          <div className="mb-3">
            <span className="p-2.5 bg-teal-50 text-teal-700 rounded-2xl text-lg inline-block">📊</span>
          </div>
          <p className="text-gray-500 text-sm font-medium">BMI</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{bmi}</h3>
        </div>

        {/* Activity Card */}
        <div 
          onClick={() => handleOpenModal('steps', steps)}
          className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm cursor-pointer hover:border-teal-300 transition"
        >
          <div className="mb-3">
            <span className="p-2.5 bg-teal-50 text-teal-700 rounded-2xl text-lg inline-block">🏃‍♂️</span>
          </div>
          <p className="text-gray-500 text-sm font-medium">Activity</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{steps.toLocaleString()} <span className="text-xs font-normal text-gray-400">steps</span></h3>
        </div>
      </div>

      {/* Heart Rate Activity Chart Card */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 font-bold text-gray-900">
            <span className="text-rose-500 text-lg">❤️</span> Heart Rate Activity
          </div>
          <button 
            onClick={() => alert('Opening full heart rate analytics trends...')}
            className="text-teal-800 text-sm font-semibold hover:underline"
          >
            View Trends
          </button>
        </div>

        {/* Bar Visualizer */}
        <div className="flex items-end justify-between h-28 gap-2 mb-6 px-2">
          {[50, 35, 65, 80, 60, 45, 75].map((height, i) => (
            <div 
              key={i} 
              style={{ height: `${height}%` }}
              className="w-10 bg-teal-100/70 hover:bg-teal-700 rounded-t-2xl transition duration-200 cursor-pointer"
              title={`Heart rate intensity level ${height}%`}
            ></div>
          ))}
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{avgBpm} <span className="text-sm font-normal text-gray-400">Avg BPM</span></h3>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Last checked</p>
            <p className="text-xs font-semibold text-gray-700">5 mins ago</p>
          </div>
        </div>
      </div>

      {/* Update Data Modal */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 uppercase">Update {activeModal}</h3>
              <button 
                onClick={() => setActiveModal(null)}
                className="text-gray-400 hover:text-gray-600 font-bold text-xl"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveData} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Value for {activeModal}</label>
                <input
                  type="text"
                  required
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 py-2.5 rounded-xl font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-teal-800 hover:bg-teal-900 text-white py-2.5 rounded-xl font-medium transition shadow"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}