import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { QrCode, Monitor, Clock, Settings, Check, MessageCircle, Mail, Phone, MapPin, Instagram, Menu, X, ChevronRight, Star, Coffee, Utensils, ArrowRight, Sparkles, ChevronDown, Zap, Shield, TrendingUp, Users, Award, PlayCircle } from 'lucide-react';
import emailjs from "emailjs-com";

const AnnshLanding = () => {
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', message: '' });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState({ type: '', text: '' });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const { scrollYProgress } = useScroll();
  const springScrollProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);


const handleSubmit = async (e) => {
  e.preventDefault();

  if (
    !formData.name.trim() ||
    !formData.phone.trim() ||
    !formData.email.trim() ||
    !formData.message.trim()
  ) {
    setPopupMessage({ type: "error", text: "Please fill in all fields before submitting." });
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000);
    return;
  }

  setIsLoading(true);

  try {
    const templateParams = {
      from_name: formData.name,
      from_email: formData.email,
      from_phone: formData.phone,
      message: formData.message,
    };

    await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      templateParams,
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    );

    setPopupMessage({
      type: "success",
      text: "Message sent successfully! We'll get back to you within 24 hours.",
    });
    setShowPopup(true);
    setFormData({ name: "", phone: "", email: "", message: "" });
  } catch (error) {
    console.error("EmailJS Error:", error);
    setPopupMessage({
      type: "error",
      text: "Failed to send message. Please try again later.",
    });
    setShowPopup(true);
  } finally {
    setIsLoading(false);
    setTimeout(() => setShowPopup(false), 4000);
  }
};

  
  const scrollToSection = (id) => {
    console.log('Scrolling to:', id); // Debug log
    const targetId = id === 'demo' ? 'contact' : id;
    const element = document.getElementById(targetId);
    console.log('Element found:', element); // Debug log
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
    setIsMenuOpen(false);
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  return (
    <div className="bg-neutral-50 min-h-screen overflow-x-hidden scroll-smooth font-sans relative">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-96 h-96 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full blur-3xl opacity-30"
          style={{
            x: useTransform(scrollYProgress, [0, 1], [0, 100]),
            y: useTransform(scrollYProgress, [0, 1], [0, -100]),
          }}
          initial={{ x: -200, y: -200 }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-l from-amber-200 to-yellow-100 rounded-full blur-3xl opacity-20"
          style={{
            x: useTransform(scrollYProgress, [0, 1], [0, -150]),
            y: useTransform(scrollYProgress, [0, 1], [0, 100]),
          }}
          initial={{ x: 200, y: 200 }}
        />
      </div>

      {/* Enhanced Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-800 via-amber-700 to-amber-900 origin-left z-50 shadow-lg"
        style={{ scaleX: springScrollProgress }}
      />
      
      {/* Navbar with glassmorphism */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed top-0 w-full bg-white/80 backdrop-blur-xl z-40 border-b border-amber-200/50 shadow-xl"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <motion.div 
              className="flex items-center"
             transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <img
              className='h-50 w-auto '
              src="/AnnshLogo-text.png" alt="" />
            </motion.div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-10">
              {['Home', 'Features', 'Pricing', 'Contact'].map((item) => (
                <motion.button
                  key={item}
                  onClick={() => scrollToSection(item.toLowerCase())}
                  className="text-gray-700 hover:text-amber-800 transition-colors font-semibold relative group text-lg"
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  {item}
                  <motion.span 
                    className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-amber-800 to-amber-700"
                    initial={{ width: 0 }}
                    whileHover={{ width: "100%" }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:bg-amber-100 rounded-xl transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ rotate: isMenuOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </motion.div>
            </motion.button>
          </div>

          {/* Mobile Menu */}
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ 
              opacity: isMenuOpen ? 1 : 0, 
              height: isMenuOpen ? 'auto' : 0 
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-amber-200/50 shadow-2xl overflow-hidden z-50 ${isMenuOpen ? 'block' : 'hidden'}`}
          >
            <div className="px-4 py-6 space-y-2">
              {['Home', 'Features', 'Pricing', 'Contact'].map((item, index) => (
                <motion.button
                  key={item}
                  onClick={() => scrollToSection(item.toLowerCase())}
                  className="block w-full text-left px-6 py-4 text-gray-700 hover:bg-amber-100 rounded-xl transition-colors font-semibold text-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: 10 }}
                >
                  {item}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.nav>

      {/* Enhanced Hero Section */}
      <section 
        id="home" 
        className="min-h-screen flex items-center justify-center pt-16 sm:pt-20 relative overflow-hidden"
      >
        {/* Dynamic background particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-amber-300/20 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              animate={{
                y: [null, -20, 20],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                repeatType: "reverse",
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="relative"
          >
            <motion.div 
              variants={fadeInUp}
              className="hidden sm:inline-flex items-center bg-[#F5F5DC] text-[#654321] px-8 py-4 rounded-full mb-8 border border-amber-200/50 shadow-lg backdrop-blur-sm"
            >
              <Sparkles size={20} className="mr-3" />
              <span className="text-sm font-semibold tracking-wide">✨ Revolutionizing Café Experiences</span>
            </motion.div>
            
            <motion.h1 
              variants={fadeInUp}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-gray-900 mb-6 sm:mb-8 leading-tight px-4 sm:px-0"
            >
              Elevate Your Café with{' '}
              <motion.span 
                className="bg-[#8B4513] bg-clip-text text-transparent"
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                Digital Excellence
              </motion.span>


            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-lg sm:text-xl text-gray-600 mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed font-light px-4 sm:px-0"
            >
              Transform your café with our seamless QR code ordering system, real-time kitchen management, and enhanced customer experiences that boost efficiency and satisfaction by up to 40%.
            </motion.p>
            
            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4 sm:px-0"
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#F5F5DC] text-[#654321] px-8 sm:px-12 py-4 sm:py-5 rounded-2xl text-base sm:text-lg font-semibold shadow-2xl hover:shadow-amber-500/25 transition-all duration-500 flex items-center gap-3 group relative overflow-hidden w-full sm:w-auto justify-center"
                onClick={() => scrollToSection("pricing")}
              >
                <div className="absolute inset-0 bg-[#F5F5DC] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <span className="relative z-10 flex items-center gap-3">
                  Get Started 
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: "rgba(251, 191, 36, 0.1)" }}
                whileTap={{ scale: 0.95 }}
                className="bg-transparent border-2 border-[#F5F5DC] text-[#654321] px-8 sm:px-12 py-4 sm:py-5 rounded-2xl text-base sm:text-lg font-semibold transition-all duration-300 group backdrop-blur-sm w-full sm:w-auto justify-center"
                onClick={() => scrollToSection("features")}
              >
                <span className="flex items-center gap-3">
                  <PlayCircle size={20} />
                  Watch Demo
                  <ChevronDown size={20} className="group-hover:translate-y-1 transition-transform" />
                </span>
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
                
      </section>

      {/* Enhanced Features Section */}
      <section 
        id="features" 
        className="py-8 sm:py-16 lg:py-24 bg-gradient-to-b from-white to-amber-50/50 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-amber-100/20 to-amber-50/20" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-24"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="inline-flex items-center bg-[#F5F5DC] text-[#654321] px-6 py-3 rounded-full mb-6 border border-amber-200"
            >
              <Award size={18} className="mr-2" />
              <span className="text-sm font-semibold">Premium Features</span>
            </motion.div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 px-4 sm:px-0">Sophisticated Features</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto font-light px-4 sm:px-0">Everything you need to transform your café into a modern, efficient establishment</p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {[
              { 
                icon: QrCode, 
                title: 'QR Code Ordering', 
                desc: 'Customers scan and order instantly from their phones, reducing wait times and improving experience.',
                color: 'from-amber-200 to-amber-100',
                iconColor: 'text-amber-800'
              },
              { 
                icon: Monitor, 
                title: 'Kitchen Dashboard', 
                desc: 'Real-time order management system that streamlines kitchen operations and reduces errors.',
                color: 'from-blue-100 to-indigo-100',
                iconColor: 'text-blue-600'
              },
              { 
                icon: Clock, 
                title: 'Real-Time Updates', 
                desc: 'Live order status tracking keeps both staff and customers informed throughout the process.',
                color: 'from-green-100 to-emerald-100',
                iconColor: 'text-green-600'
              },
              { 
                icon: Settings, 
                title: 'Easy Menu Management', 
                desc: 'Update menus, prices, and specials with simple clicks - no technical expertise needed.',
                color: 'from-purple-100 to-violet-100',
                iconColor: 'text-purple-600'
              },
              { 
                icon: TrendingUp, 
                title: 'Advanced Analytics', 
                desc: 'Gain insights into popular items, peak hours, and customer preferences to optimize your offerings.',
                color: 'from-pink-100 to-rose-100',
                iconColor: 'text-pink-600'
              },
              { 
                icon: Shield, 
                title: 'Secure Payments', 
                desc: 'Integrated secure payment processing with multiple payment options and fraud protection.',
                color: 'from-cyan-100 to-teal-100',
                iconColor: 'text-cyan-600'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -15 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 lg:p-8 rounded-3xl shadow-xl border border-white/50 hover:shadow-2xl transition-shadow duration-200 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className={`bg-gradient-to-br ${feature.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <feature.icon className={feature.iconColor} size={28} />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed font-light">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>


      {/* Enhanced Pricing Section */}
      <section 
        id="pricing" 
        className="py-16 sm:py-24 lg:py-32 bg-gradient-to-b from-amber-50/30 to-white relative overflow-hidden"
      >
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-0 w-96 h-96 bg-gradient-to-r from-amber-200/30 to-orange-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-gradient-to-l from-orange-200/30 to-amber-200/30 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 ">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-20"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="inline-flex items-center bg-[#F5F5DC] text-[#654321] px-6 py-3 rounded-full mb-6 border border-amber-200"
            >
              <Star size={18} className="mr-2" />
              <span className="text-sm font-semibold">Transparent Pricing</span>
            </motion.div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 px-4 sm:px-0">Choose Your Plan</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto font-light px-4 sm:px-0">Flexible pricing options designed to grow with your business</p>
          </motion.div>

          {/* Pricing Cards Container */}
          <div className="max-w-7xl mx-auto  ">
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 px-4 justify-items-center"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              {/* Essential Plan */}
              <motion.div
                variants={fadeInUp}
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="w-full max-w-sm bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-500 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gray-400 to-gray-600" />
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Basic</h3>
                  <div className="text-5xl font-bold text-gray-900 mb-2">₹999</div>
                  <div className="text-gray-600 font-medium">/month</div>
                  <div className="mt-4">
                    <span className="inline-flex items-center bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium">
                      Perfect for small cafés
                    </span>
                  </div>
                </div>
                
                <div className="space-y-4 mb-8">
                  {['Digital menu creation', 'QR code ordering', 'Order tracking', 'Real-time updates', 'Kitchen dashboard', 'Analytics (7 days)', 'Up to 5 tables QR-Code'].map((item, i) => (
                    <div key={i} className="flex items-start">
                      <Check className="text-green-500 mr-3 mt-1 flex-shrink-0" size={18} />
                      <span className="text-gray-700 text-sm leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
                
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gray-100 text-gray-900 py-4 rounded-2xl font-semibold hover:bg-gray-200 transition-all duration-300"
                  onClick={() => scrollToSection("contact")}
                >
                  Get Started Now
                </motion.button>
              </motion.div>

              {/* Professional Plan - Featured */}
              <motion.div
                variants={fadeInUp}
                whileHover={{ y: -12 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="w-full max-w-sm bg-[#8B4513] text-white p-8 rounded-3xl shadow-2xl relative border-2 border-amber-400 xl:scale-110 xl:z-10"
              >
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#F5F5DC] text-[#654321] px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                  ⭐ Most Popular
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-3xl" />
                
                <div className="relative z-10">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-white mb-3">Pro</h3>
                    <div className="text-5xl font-bold text-white mb-2">₹1999</div>
                    <div className="text-white/80 font-medium">/month</div>
                    <div className="mt-4">
                      <span className="inline-flex items-center bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                        Most chosen by cafés
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mb-8">
                    {['Everything in Essential', 'WhiteLabeling', 'Analytics (30 days)', 'Payment Integration', 'Customize Menu Theme', 'Advanced table management', 'Up to 10 tables QR-Code', 'Priority Support'].map((item, i) => (
                      <div key={i} className="flex items-start">
                        <Check className="text-green-300 mr-3 mt-1 flex-shrink-0" size={18} />
                        <span className="text-white/90 text-sm leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                  
                  <motion.button 
                    whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(255, 255, 255, 0.2)" }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-[#F5F5DC] text-[#654321] py-4 rounded-2xl font-semibold hover:bg-amber-50 transition-all duration-300 shadow-lg"
                    onClick={() => scrollToSection("contact")}
                  >
                    Get Started Now
                  </motion.button>
                </div>
              </motion.div>

              {/* Enterprise Plan */}
              <motion.div
                variants={fadeInUp}
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="w-full max-w-sm bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-500 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 to-indigo-600" />
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Enterprise</h3>
                  <div className="text-5xl font-bold text-gray-900 mb-2">Custom</div>
                  <div className="text-gray-600 font-medium">pricing</div>
                  <div className="mt-4">
                    <span className="inline-flex items-center bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium">
                      For large operations
                    </span>
                  </div>
                </div>
                
                <div className="space-y-4 mb-8">
                  {['Everything in Professional', 'Multi-location support', 'Custom integrations', 'Advanced reporting', '24/7 phone support', 'Custom development'].map((item, i) => (
                    <div key={i} className="flex items-start">
                      <Check className="text-green-500 mr-3 mt-1 flex-shrink-0" size={18} />
                      <span className="text-gray-700 text-sm leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
                
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-2xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-300"
                  onClick={() => scrollToSection("contact")}
                >
                  Contact Sales
                </motion.button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Enhanced Contact Section */}
      <section 
        id="contact" 
        className="py-16 sm:py-24 lg:py-32 bg-gradient-to-b from-white to-amber-50/50 relative overflow-hidden"
      >
        {/* Background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-gradient-to-r from-amber-200/20 to-orange-200/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-l from-orange-200/20 to-amber-200/20 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-20"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="inline-flex items-center bg-[#F5F5DC] text-[#654321] px-6 py-3 rounded-full mb-6 border border-amber-200"
            >
              <MessageCircle size={18} className="mr-2" />
              <span className="text-sm font-semibold">Get In Touch</span>
            </motion.div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 px-4 sm:px-0">Let's Connect</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto font-light px-4 sm:px-0">Ready to transform your café? We'd love to hear from you and help you get started!</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
            {/* Enhanced Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true, margin: "-50px" }}
              className="lg:col-span-2"
            >
              <div className="bg-[#f7f7ee] backdrop-blur-sm p-6 sm:p-8 lg:p-12 rounded-3xl shadow-2xl border border-white/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-transparent" />
                <div className="relative z-10">
                  <h3 className="text-3xl font-bold text-[#654321] mb-2">Send us a message</h3>
                  <p className="text-gray-600 mb-8">We'll get back to you within 24 hours</p>
                  
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 gap-6">
                      <motion.div
                        whileFocus={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      >
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Full Name</label>
                        <input
                          type="text"
                          placeholder="Enter your name"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full p-5 rounded-2xl border border-gray-200 focus:border-amber-600 focus:ring-4 focus:ring-amber-200 outline-none transition-all bg-white/70 backdrop-blur-sm text-gray-900 placeholder-gray-400 shadow-sm"
                        />
                      </motion.div>
                      <motion.div
                        whileFocus={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      >
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Contact Number</label>
                        <input
                          type="tel"
                          placeholder="Enter your phone number"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="w-full p-5 rounded-2xl border border-gray-200 focus:border-amber-600 focus:ring-4 focus:ring-amber-200 outline-none transition-all bg-white/70 backdrop-blur-sm text-gray-900 placeholder-gray-400 shadow-sm"
                        />
                      </motion.div>
                      <motion.div
                        whileFocus={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      >
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Email Address</label>
                        <input
                          type="email"
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full p-5 rounded-2xl border border-gray-200 focus:border-amber-600 focus:ring-4 focus:ring-amber-200 outline-none transition-all bg-white/70 backdrop-blur-sm text-gray-900 placeholder-gray-400 shadow-sm"
                        />
                      </motion.div>
                    </div>
                    <motion.div
                      whileFocus={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Message</label>
                      <textarea
                        placeholder="Tell us about your café and how we can help..."
                        rows="6"
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        className="w-full p-5 rounded-2xl border border-gray-200 focus:border-amber-600 focus:ring-4 focus:ring-amber-200 outline-none transition-all bg-white/70 backdrop-blur-sm text-gray-900 placeholder-gray-400 resize-none shadow-sm"
                      />
                    </motion.div>
                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-[#F5F5DC] text-[#654321] py-5 rounded-2xl font-semibold hover:from-[#f6f6c6] hover:to-[#f6ecc6] transition-all duration-300 flex items-center justify-center gap-3 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Mail size={20} />
                          <span>Send Message</span>
                        </>
                      )}
                    </motion.button>
                  </form>
                </div>
              </div>
            </motion.div>

            {/* Enhanced Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true, margin: "-50px" }}
              className="space-y-8"
            >
              {/* Quick Contact */}
              <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-50/30 to-transparent" />
                <div className="relative z-10">
                  <h4 className="text-2xl font-bold text-gray-900 mb-6">Quick Contact</h4>
                  <div className="space-y-6">
                    {[
                      { icon: Phone, label: "Phone", value: "+91 70439 74792", color: "from-green-400 to-emerald-500" },
                      { icon: Mail, label: "Email", value: "theannsh.info@gmail.com", color: "from-blue-400 to-indigo-500" },
                      { icon: MapPin, label: "Location", value: "Ahmedabad, India", color: "from-red-400 to-pink-500" }
                    ].map((item, index) => (
                      <motion.div 
                        key={index} 
                        className="flex items-center space-x-4 group cursor-pointer"
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <div className={`bg-gradient-to-br ${item.color} p-4 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow`}>
                          <item.icon className="text-white" size={22} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-medium">{item.label}</p>
                          <p className="font-semibold text-gray-900 text-lg">{item.value}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Enhanced Social Links */}
              <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-50/30 to-transparent" />
                <div className="relative z-10">
                  <h4 className="text-2xl font-bold text-gray-900 mb-6">Follow Our Journey</h4>
                  <div className="flex space-x-4">
                    <motion.a
                      whileHover={{ scale: 1.15, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      href="https://instagram.com/theannsh"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 p-5 rounded-2xl text-white hover:shadow-2xl transition-all duration-300 relative overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 via-red-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <Instagram size={28} className="relative z-10" />
                    </motion.a>
                  </div>
                  <p className="text-gray-600 mt-4 text-sm">Stay updated with our latest features and success stories</p>
                </div>
              </div>

             
            </motion.div>
          </div>
        </div>
      </section>

      {/* Enhanced Floating CTA */}
      <motion.div
        initial={{ opacity: 0, scale: 0, rotate: -180 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ delay: 2, duration: 0.8, type: "spring", stiffness: 200 }}
        className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-30"
      >
        <motion.button
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => scrollToSection('contact')}
          className="bg-[#F5F5DC] text-[#654321] px-4 sm:px-8 py-3 sm:py-5 rounded-full font-semibold shadow-2xl hover:shadow-amber-500/50 transition-all duration-300 flex items-center space-x-2 sm:space-x-3 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-[#F5F5DC] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <MessageCircle size={20} className="relative z-10 sm:w-6 sm:h-6" />
          <span className="hidden sm:inline relative z-10 text-sm sm:text-base">Get Free Demo</span>
          <motion.div
            className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"
            animate={{ scale: [1, 1.2, 2] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.button>
      </motion.div>

      {/* Enhanced Popup Message */}
      {showPopup && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.8, rotate: -10 }}
          animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, y: 50, scale: 0.8, rotate: 10 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="fixed top-20 sm:top-24 right-4 sm:right-8 z-50 max-w-sm sm:max-w-md mx-4 sm:mx-0"
        >
          <div className={`p-8 rounded-3xl shadow-2xl border-2 backdrop-blur-sm ${
            popupMessage.type === 'success' 
              ? 'bg-green-50/90 border-green-200 text-green-800' 
              : 'bg-red-50/90 border-red-200 text-red-800'
          }`}>
            <div className="flex items-start space-x-3 sm:space-x-4">
              <motion.div 
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-lg ${
                  popupMessage.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                }`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
              >
                {popupMessage.type === 'success' ? (
                  <Check className="text-white" size={16} />
                ) : (
                  <X className="text-white" size={16} />
                )}
              </motion.div>
              <div className="flex-1">
                <h4 className="font-bold text-lg mb-1">
                  {popupMessage.type === 'success' ? 'Success!' : 'Oops!'}
                </h4>
                <p className="font-medium">{popupMessage.text}</p>
              </div>
              <motion.button
                onClick={() => setShowPopup(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={20} />
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Enhanced Footer */}
      <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-12 sm:py-16 lg:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 to-orange-900/20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-12 sm:mb-16"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {/* Brand Column */}
            <div className="sm:col-span-2 ">
              <motion.div 
                className="block sm:hidden text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent mb-6"
                whileHover={{ scale: 1.05 }}
              >
                Annsh
              </motion.div>
              <p className="text-gray-300 text-base sm:text-lg leading-relaxed mb-6 max-w-md ">
                Revolutionizing café experiences with cutting-edge digital solutions. Join hundreds of satisfied customers who've transformed their business with us.
              </p>
              <div className="flex space-x-4">
                <motion.div 
                  className="bg-amber-600/20 p-3 rounded-xl"
                  whileHover={{ scale: 1.1, backgroundColor: "rgba(251, 191, 36, 0.3)" }}
                >
                  <Star className="text-amber-400" size={24} />
                </motion.div>
                <motion.div 
                  className="bg-amber-600/20 p-3 rounded-xl"
                  whileHover={{ scale: 1.1, backgroundColor: "rgba(251, 191, 36, 0.3)" }}
                >
                  <Shield className="text-amber-400" size={24} />
                </motion.div>
                <motion.div 
                  className="bg-amber-600/20 p-3 rounded-xl"
                  whileHover={{ scale: 1.1, backgroundColor: "rgba(251, 191, 36, 0.3)" }}
                >
                  <Zap className="text-amber-400" size={24} />
                </motion.div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xl font-bold mb-6 text-amber-400">Quick Links</h4>
              <ul className="space-y-4">
                {['Features', 'Pricing', 'Contact', 'Demo'].map((item) => (
                  <motion.li 
                    key={item}
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <button 
                      onClick={() => scrollToSection(item.toLowerCase())}
                      className="text-gray-300 hover:text-amber-400 transition-colors cursor-pointer"
                    >
                      {item}
                    </button>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-xl font-bold mb-6 text-amber-400">Support</h4>
              <ul className="space-y-4">
                {[
                  { text: 'Help Center', href: '#help' },
                  { text: 'Privacy Policy', href: '#privacy' },
                  { text: 'Terms of Service', href: '#terms' },
                  { text: 'Documentation', href: '#docs' }
                ].map((item) => (
                  <motion.li 
                    key={item.text}
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <a 
                      href={item.href} 
                      className="text-gray-300 hover:text-amber-400 transition-colors"
                    >
                      {item.text}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Footer Bottom */}
          <div className="border-t border-gray-700 pt-12">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
              <motion.p 
                className="text-gray-400 mb-4 sm:mb-0 text-center sm:text-left"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                viewport={{ once: true }}
              >
                © 2025 Annsh. All rights reserved. Made with ❤️ in India.
              </motion.p>
              <motion.div 
                className="flex items-center space-x-4 sm:space-x-6"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                viewport={{ once: true }}
              >
                <span className="text-gray-400">Follow us:</span>
                <motion.a
                  href="https://instagram.com/theannsh"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-gray-400 hover:text-amber-400 transition-colors"
                >
                  <Instagram size={24} />
                </motion.a>
              </motion.div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AnnshLanding;