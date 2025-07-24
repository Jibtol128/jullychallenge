import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { 
  Target, 
  CheckCircle, 
  BarChart3, 
  Clock, 
  Users, 
  Zap,
  Star,
  ArrowRight,
  ChevronRight,
  Play,
  Shield,
  Smartphone,
  Globe
} from 'lucide-react';
import DemoModal from './modals/DemoModal';

const HomePage = () => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const features = [
    {
      icon: Target,
      title: "Eisenhower Matrix",
      description: "Organize tasks by urgency and importance using the proven Eisenhower Matrix methodology."
    },
    {
      icon: Zap,
      title: "AI-Powered Prioritization",
      description: "Let AI analyze your tasks and automatically categorize them for maximum productivity."
    },
    {
      icon: BarChart3,
      title: "Analytics & Insights",
      description: "Track your productivity patterns and get insights to optimize your workflow."
    },
    {
      icon: Clock,
      title: "Time Tracking",
      description: "Monitor time spent on tasks and improve your time management skills."
    },
    {
      icon: Smartphone,
      title: "Responsive Design",
      description: "Access your tasks anywhere, anytime with our mobile-optimized interface."
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your data is encrypted and secured with enterprise-grade security measures."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Product Manager",
      avatar: "SC",
      content: "TaskMatrix transformed how I manage my workload. The AI prioritization is incredibly accurate and saves me hours every week.",
      rating: 5
    },
    {
      name: "Michael Rodriguez",
      role: "Entrepreneur",
      avatar: "MR",
      content: "Finally, a task manager that understands priorities. The Eisenhower Matrix implementation is flawless.",
      rating: 5
    },
    {
      name: "Emily Johnson",
      role: "Software Developer",
      avatar: "EJ",
      content: "The analytics feature helped me identify my productivity patterns. I'm 40% more efficient now!",
      rating: 5
    }
  ];

  const stats = [
    { number: "10,000+", label: "Active Users" },
    { number: "500K+", label: "Tasks Completed" },
    { number: "98%", label: "Satisfaction Rate" },
    { number: "24/7", label: "Support Available" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-600 rounded-lg">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">TaskMatrix</h1>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-primary-600 transition-colors">Features</a>
              <a href="#testimonials" className="text-gray-600 hover:text-primary-600 transition-colors">Testimonials</a>
              <a href="#pricing" className="text-gray-600 hover:text-primary-600 transition-colors">Pricing</a>
              {isAuthenticated && user ? (
                <>
                  <Link to="/dashboard" className="text-gray-600 hover:text-primary-600 transition-colors flex items-center space-x-2">
                    <span className="font-semibold">{user.username}</span>
                    <img
                      src={user.avatarUrl || undefined}
                      alt={user.username}
                      className="w-7 h-7 rounded-full border ml-2"
                      style={{ display: user.avatarUrl ? 'block' : 'none' }}
                    />
                  </Link>
                  <Link to="/dashboard" className="btn-primary">Profile</Link>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-600 hover:text-primary-600 transition-colors">Login</Link>
                  <Link to="/register" className="btn-primary">Get Started</Link>
                </>
              )}
            </nav>

            {/* Mobile menu button */}
            <button className="md:hidden p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                  Master Your
                  <span className="text-primary-600"> Productivity</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl">
                  Transform chaos into clarity with AI-powered task management. 
                  Prioritize smartly, work efficiently, and achieve more with TaskMatrix.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register" className="btn-primary px-8 py-4 text-lg font-semibold flex items-center justify-center space-x-2">
                  <span>Start Free Trial</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <button 
                  onClick={() => setIsDemoModalOpen(true)}
                  className="btn-outline px-8 py-4 text-lg font-semibold flex items-center justify-center space-x-2"
                >
                  <Play className="h-5 w-5" />
                  <span>Watch Demo</span>
                </button>
              </div>

              <div className="flex items-center space-x-8 pt-4">
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full border-2 border-white flex items-center justify-center text-white text-sm font-semibold">
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">10,000+ happy users</span>
                </div>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-sm text-gray-600 ml-2">4.9/5 rating</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-blue-500 rounded-3xl transform rotate-6 opacity-20"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Today's Tasks</h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">4 completed</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {[
                      { title: "Review project proposal", priority: "high", completed: true },
                      { title: "Team standup meeting", priority: "medium", completed: true },
                      { title: "Update documentation", priority: "low", completed: false },
                      { title: "Client presentation prep", priority: "high", completed: false }
                    ].map((task, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'
                        }`}>
                          {task.completed && <CheckCircle className="w-3 h-3 text-white" />}
                        </div>
                        <div className="flex-1">
                          <span className={`text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {task.title}
                          </span>
                        </div>
                        <div className={`px-2 py-1 text-xs rounded-full ${
                          task.priority === 'high' ? 'bg-red-100 text-red-700' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {task.priority}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to stay productive
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful features designed to help you prioritize, organize, and accomplish more every day.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="p-3 bg-primary-100 rounded-lg w-fit mb-4">
                  <feature.icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How TaskMatrix Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get started in minutes with our simple, intuitive workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Add Your Tasks",
                description: "Simply type in your tasks or let our AI extract them from your notes and emails.",
                icon: "📝"
              },
              {
                step: "2",
                title: "AI Prioritization",
                description: "Our AI analyzes your tasks and automatically sorts them using the Eisenhower Matrix.",
                icon: "🤖"
              },
              {
                step: "3",
                title: "Focus & Complete",
                description: "Work on what matters most with clear priorities and actionable insights.",
                icon: "✅"
              }
            ].map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
                  <div className="text-4xl mb-4">{step.icon}</div>
                  <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mx-auto mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ChevronRight className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What our users say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of professionals who've transformed their productivity with TaskMatrix.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">"{testimonial.content}"</p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the perfect plan for your productivity needs. Always know what you'll pay.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Free</h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">$0</div>
                <div className="text-gray-600">Forever</div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Up to 50 tasks</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Basic AI prioritization</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Eisenhower Matrix</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Mobile app</span>
                </li>
              </ul>
              <Link to="/register" className="btn-outline w-full text-center block">
                Get Started Free
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-white rounded-xl p-8 shadow-lg border-2 border-primary-500 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-primary-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              </div>
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Pro</h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">$12</div>
                <div className="text-gray-600">per month</div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Unlimited tasks</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Advanced AI features</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Analytics & insights</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Calendar integration</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Priority support</span>
                </li>
              </ul>
              <Link to="/register" className="btn-primary w-full text-center block">
                Start Pro Trial
              </Link>
            </div>

            {/* Team Plan */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Team</h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">$24</div>
                <div className="text-gray-600">per month</div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Everything in Pro</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Team collaboration</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Shared workspaces</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Admin dashboard</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">24/7 support</span>
                </li>
              </ul>
              <Link to="/register" className="btn-outline w-full text-center block">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to transform your productivity?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who've made the switch to smarter task management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
              Start Free Trial
            </Link>
            <button className="border border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-primary-600 rounded-lg">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">TaskMatrix</h3>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                The smart way to manage tasks, prioritize work, and achieve your goals with AI-powered productivity tools.
              </p>
              <div className="flex space-x-4">
                <Globe className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
                <Users className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
                <Shield className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
                <li><a href="#" className="hover:text-white">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Status</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">© 2025 TaskMatrix. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>

      <DemoModal 
        isOpen={isDemoModalOpen} 
        onClose={() => setIsDemoModalOpen(false)} 
      />
    </div>
  );
};

export default HomePage;
