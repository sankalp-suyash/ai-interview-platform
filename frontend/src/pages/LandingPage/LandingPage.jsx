import React from 'react';
import { Code, Mic, Users, Zap, Crown, Check, ArrowRight, Clock, Shield, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const features = [
    {
      icon: Code,
      title: 'AI-Powered Coding Interviews',
      description: 'Practice with realistic coding challenges evaluated by advanced AI with instant feedback.'
    },
    {
      icon: Mic,
      title: 'Behavioral Interview Simulator',
      description: 'Record your answers to common behavioral questions and get AI analysis on your communication skills.'
    },
    {
      icon: Users,
      title: 'Human Interview Practice',
      description: 'Connect with real interviewers for mock interviews and personalized feedback.'
    },
    {
      icon: Zap,
      title: 'Instant Feedback & Analytics',
      description: 'Get detailed performance metrics and improvement suggestions immediately after each practice session.'
    }
  ];

  const freePlanFeatures = [
    '2 Coding Interviews per week',
    '2 Behavioral Interviews per week',
    'Basic AI Feedback',
    'Performance Dashboard',
    'Community Support'
  ];

  const premiumPlanFeatures = [
    'Unlimited AI Interviews',
    'Unlimited Human Interviews',
    'Advanced AI Analytics',
    'Priority Human Matching',
    'Personalized Learning Path',
    'Export Interview Reports',
    '24/7 Premium Support'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                  <Code className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold">
                  <span className="text-black">MIND</span>
                  <span className="text-amber-500">MOCK</span>
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-700 hover:text-gray-900 font-medium">
                Sign In
              </Link>
              <Link 
                to="/signup" 
                className="bg-amber-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-amber-600 transition-colors"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Master Your Next
            <span className="block">
              <span className="text-black">Technical </span>
              <span className="text-amber-500">Interview</span>
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            The only platform that combines AI-powered practice with real human interviews. 
            Get the perfect blend of technology and human touch to ace your interviews.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              to="/signup" 
              className="bg-amber-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-amber-600 transition-colors flex items-center"
            >
              Start Practicing Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <button className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors">
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* Why Better Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why MIND<span className="text-amber-500">MOCK</span> Beats the Competition
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Other platforms give you either AI or human practice. We give you both - plus a structured path to success.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Our Advantage</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <Clock className="w-5 h-5 text-amber-500 mr-3" />
                  <span><strong>2 Coding + 2 Behavioral</strong> interviews every week</span>
                </li>
                <li className="flex items-center">
                  <Users className="w-5 h-5 text-amber-500 mr-3" />
                  <span><strong>AI + Human</strong> interview combination</span>
                </li>
                <li className="flex items-center">
                  <Zap className="w-5 h-5 text-amber-500 mr-3" />
                  <span><strong>Structured weekly practice</strong> for consistent improvement</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                  <X className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Others Lack</h3>
              </div>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-red-400 rounded-full mr-3" />
                  <span>Limited practice sessions</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-red-400 rounded-full mr-3" />
                  <span>Only AI or only human options</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-red-400 rounded-full mr-3" />
                  <span>No structured learning path</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From coding challenges to behavioral questions, we've got every aspect of technical interviews covered.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Choose Your Plan
            </h2>
            <p className="text-gray-400 text-lg">
              Start free, upgrade when you're ready to accelerate your interview prep
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Free Plan</h3>
                <div className="text-4xl font-bold text-gray-900 mb-4">$0</div>
                <p className="text-gray-600">Perfect for getting started</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                {freePlanFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link 
                to="/signup" 
                className="w-full bg-gray-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors text-center block"
              >
                Get Started Free
              </Link>
            </div>

            {/* Premium Plan */}
            <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <div className="bg-white text-amber-600 px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                  <Crown className="w-4 h-4 mr-1" />
                  POPULAR
                </div>
              </div>
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Premium Plan</h3>
                <div className="text-4xl font-bold text-white mb-4">$29<span className="text-amber-100 text-lg">/month</span></div>
                <p className="text-amber-100">Unlock unlimited potential</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                {premiumPlanFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Shield className="w-5 h-5 text-white mr-3" />
                    <span className="text-white font-medium">{feature}</span>
                  </li>
                ))}
              </ul>

              <button className="w-full bg-white text-amber-600 py-3 px-6 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Upgrade to Premium
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-amber-500">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Ace Your Interviews?
          </h2>
          <p className="text-amber-100 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of developers who landed their dream jobs with MINDMOCK
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/signup" 
              className="bg-white text-amber-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
            >
              Start Free Today
            </Link>
            <button className="border border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-amber-600 transition-colors">
              See Success Stories
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
              <Code className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold">
              <span className="text-white">MIND</span>
              <span className="text-amber-500">MOCK</span>
            </span>
          </div>
          <p className="text-gray-400 mb-4">
            The ultimate AI+Human interview preparation platform
          </p>
          <p className="text-gray-500 text-sm">
            © 2025 MINDMOCK. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;