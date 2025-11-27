import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Code, Mic, Crown, TrendingUp, ArrowRight } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsageData();
  }, []);

  const fetchUsageData = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.INTERVIEWS.USAGE);
      setUsage(response.data.data);
    } catch (error) {
      console.error('Error fetching usage:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading your progress...</div>
      </div>
    );
  }

  const stats = [
    {
      icon: Code,
      label: 'Coding Interviews Used',
      value: `${usage?.coding.used || 0} / ${usage?.coding.total || 2}`,
      remaining: (usage?.coding.total || 2) - (usage?.coding.used || 0)
    },
    {
      icon: Mic,
      label: 'Behavioral Interviews Used',
      value: `${usage?.behavioral.used || 0} / ${usage?.behavioral.total || 2}`,
      remaining: (usage?.behavioral.total || 2) - (usage?.behavioral.used || 0)
    },
    {
      icon: TrendingUp,
      label: 'Total This Week',
      value: usage?.totalUsed || 0,
    }
  ];

  const handleStartInterview = (type) => {
    if (usage?.[type]?.used >= 2) return;
    navigate(`/${type}`);
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Track your weekly interview practice progress
        </p>
      </div>

      {/* Usage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  {stat.remaining !== undefined && (
                    <p className={`text-sm mt-1 ${stat.remaining > 0 ? 'text-green-600' : 'text-amber-600'
                      }`}>
                      {stat.remaining} remaining this week
                    </p>
                  )}
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Icon className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Bars */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Weekly Progress</h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Coding Interviews</span>
              <span>{usage?.coding.used || 0}/2</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-amber-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${((usage?.coding.used || 0) / 2) * 100}%` }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Behavioral Interviews</span>
              <span>{usage?.behavioral.used || 0}/2</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-amber-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${((usage?.behavioral.used || 0) / 2) * 100}% ` }}
              ></div>
            </div>
          </div>
        </div>
      </div >

      {/* Quick Actions */}
      < div className="grid grid-cols-1 md:grid-cols-2 gap-6" >
        <div className="bg-white rounded-xl p-6 text-black border-2 border-amber-600">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">Practice Coding</h3>
              <p className="text-gray-800 mb-4 font-medium">
                {usage?.coding.used === 2 ? 'Weekly limit reached' : 'Solve real coding challenges with AI feedback'}
              </p>
              <button
                onClick={() => handleStartInterview('coding')}
                className={`flex items-center px-4 py-2 rounded-lg font-semibold transition-all ${usage?.coding.used === 2
                    ? 'bg-amber-600 text-white cursor-not-allowed'
                    : 'bg-white text-amber-600 hover:bg-amber-50 hover:shadow-lg'
                  }`}
                disabled={usage?.coding.used === 2}
              >
                {usage?.coding.used === 2 ? 'Limit Reached' : 'Start Coding Interview'}
                {usage?.coding.used !== 2 && <ArrowRight className="w-4 h-4 ml-2" />}
              </button>
            </div>
            <Code className="w-12 h-12 text-amber-600" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">Practice Behavioral</h3>
              <p className="text-amber-100 mb-4">
                {usage?.behavioral.used === 2 ? 'Weekly limit reached' : 'Answer behavioral questions with audio analysis'}
              </p>
              <button
                onClick={() => handleStartInterview('behavioral')}
                className={`text-amber-600 flex items-center px-4 py-2 rounded-lg font-semibold transition-all ${usage?.behavioral.used === 2
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-white text-amber-600 hover:bg-amber-50 hover:shadow-lg'
                  }`}
                disabled={usage?.behavioral.used === 2}
              >
                {usage?.behavioral.used === 2 ? 'Limit Reached' : 'Start Behavioral Interview'}
                {usage?.behavioral.used !== 2 && <ArrowRight className="w-4 h-4 ml-2 text-amber-600" />}
              </button>
            </div>
            <Mic className="w-12 h-12 text-amber-600" />
          </div>
        </div>
      </div >

      {/* Upgrade Prompt */}
      {
        usage?.totalUsed >= 3 && (
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-6 text-white text-center">
            <Crown className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Ready for Unlimited Practice?</h3>
            <p className="text-amber-100 mb-4 max-w-2xl mx-auto">
              You've used {usage.totalUsed} of your 4 weekly interviews. Upgrade to Premium for unlimited AI interviews and human practice sessions.
            </p>
            <button className="bg-white text-amber-600 px-6 py-3 rounded-lg font-semibold hover:bg-amber-50 transition-colors">
              Upgrade to Premium
            </button>
          </div>
        )
      }
    </div >
  );
};

export default Dashboard;