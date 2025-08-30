import React, { useState } from 'react';
import emailjs from 'emailjs-com';
import { motion, useScroll, useTransform } from 'framer-motion';
import { QrCode, Monitor, Clock, Settings, Check, MessageCircle, Mail, Phone, MapPin, Instagram, Facebook, Twitter, Menu, X } from 'lucide-react';

const AnnshLanding = () => {
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', message: '' });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState({ type: '', text: '' });
  const { scrollYProgress } = useScroll();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Form validation
    if (!formData.name.trim() || !formData.phone.trim() || !formData.email.trim() || !formData.message.trim()) {
      setPopupMessage({ type: 'error', text: 'Please fill in all fields before submitting.' });
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
      return;
    }

    emailjs
      .send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,   // Service ID
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,  // Template ID
        {
          from_name: formData.name,
          from_phone: formData.phone,
          from_email: formData.email,
          message: formData.message,
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY  // Public Key
      )
      .then(
        (result) => {
          setPopupMessage({ type: 'success', text: 'Message sent successfully!' });
          setShowPopup(true);
          setFormData({ name: '',phone:'', email: '', message: '' });
          setTimeout(() => setShowPopup(false), 3000);
        },
        (error) => {
          setPopupMessage({ type: 'error', text: 'Failed to send message. Please try again.' });
          setShowPopup(true);
          setTimeout(() => setShowPopup(false), 3000);
          console.error(error);
        }
      );
  };
  
  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
    setIsMenuOpen(false);
  };

  return (
    <div className="bg-[#f5f5dc] min-h-screen overflow-x-hidden scroll-smooth">
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-[#4b2e2e] origin-left z-50"
        style={{ scaleX: scrollYProgress }}
      />
      
      {/* Navbar */}
      <nav className="fixed top-1 w-full bg-[#f5f5dc]/90 backdrop-blur-sm z-40 border-b border-[#4b2e2e]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="text-xl sm:text-2xl font-bold text-[#4b2e2e]">Annsh</div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-8">
              {['Home', 'Features', 'Pricing', 'Contact'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item.toLowerCase())}
                  className="text-[#4b2e2e] hover:text-[#4b2e2e]/70 transition-colors"
                >
                  {item}
                </button>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-[#4b2e2e] hover:bg-[#4b2e2e]/10 rounded-lg transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden absolute top-16 left-0 right-0 bg-[#f5f5dc] border-b border-[#4b2e2e]/10 shadow-lg"
            >
              <div className="px-4 py-2 space-y-1">
                {['Home', 'Features', 'Pricing', 'Contact'].map((item) => (
                  <button
                    key={item}
                    onClick={() => scrollToSection(item.toLowerCase())}
                    className="block w-full text-left px-4 py-3 text-[#4b2e2e] hover:bg-[#4b2e2e]/10 rounded-lg transition-colors"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section 
        id="home" 
        className="min-h-screen flex items-center justify-center pt-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#4b2e2e] mb-6 leading-tight px-4">
              Smart Digital Menu & Ordering for Cafés
            </h1>
            <p className="text-lg sm:text-xl text-[#4b2e2e]/70 mb-8 max-w-3xl mx-auto px-4">
              Transform your café with QR code ordering, real-time kitchen management, and seamless customer experiences
            </p>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(75, 46, 46, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              className="bg-[#4b2e2e] text-[#f5f5dc] px-8 py-4 rounded-lg text-lg font-semibold shadow-lg hover:bg-[#4b2e2e]/90 transition-all duration-300"
              onClick={() => scrollToSection("pricing")}

            >
              Get Started
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section 
        id="features" 
        className="py-20 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#4b2e2e] mb-4">Features</h2>
            <p className="text-lg sm:text-xl text-[#4b2e2e]/70">Everything you need to run a modern café</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              { icon: QrCode, title: 'QR Code Ordering', desc: 'Customers scan and order instantly' },
              { icon: Monitor, title: 'Kitchen Dashboard', desc: 'Real-time order management system' },
              { icon: Clock, title: 'Real-Time Updates', desc: 'Live order status tracking' },
              { icon: Settings, title: 'Easy Menu Management', desc: 'Update menus with simple clicks' }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-xl shadow-lg border border-[#4b2e2e]/10 hover:shadow-xl transition-shadow"
              >
                <div className="bg-[#4b2e2e]/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="text-[#4b2e2e]" size={24} />
                </div>
                <h3 className="text-xl font-bold text-[#4b2e2e] mb-2">{feature.title}</h3>
                <p className="text-[#4b2e2e]/70">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section 
        id="pricing" 
        className="py-20 bg-[#f5f5dc]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#4b2e2e]">Pricing</h2>
            <p className="text-lg sm:text-xl text-[#4b2e2e]/70">Choose the perfect plan for your café</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Basic Plan */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 0 30px rgba(75, 46, 46, 0.2)",
                borderColor: "rgba(75, 46, 46, 0.4)"
              }}
              transition={{ 
                duration: 0.5, 
                ease: "easeInOut"
              }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-xl shadow-md border border-[#4b2e2e]/10 transition-all duration-300 cursor-pointer"
            >
              <h3 className="text-2xl font-bold text-[#4b2e2e] mb-4">Basic</h3>
              <div className="text-3xl font-bold text-[#4b2e2e] mb-6">₹999<span className="text-lg font-normal">/month*</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center"><Check className="text-green-600 mr-2" size={16} />Digital menu creation</li>
                <li className="flex items-center"><Check className="text-green-600 mr-2" size={16} />QR code ordering</li>
                <li className="flex items-center"><Check className="text-green-600 mr-2" size={16} />Order tracking</li>
                <li className="flex items-center"><Check className="text-green-600 mr-2" size={16} />Real-time updates</li>
                <li className="flex items-center"><Check className="text-green-600 mr-2" size={16} />Kitchen dashboard</li>
                <li className="flex items-center"><Check className="text-green-600 mr-2" size={16} />Analytics (7 days)</li>
                <li className="flex items-center"><Check className="text-green-600 mr-2" size={16} />Up to 5 tables</li>
              </ul>
              <motion.button 
                whileHover={{ scale: 1.05, boxShadow: "0 8px 20px rgba(75, 46, 46, 0.3)" }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-[#4b2e2e] text-[#f5f5dc] py-3 rounded-lg font-semibold hover:bg-[#4b2e2e]/90 transition-all duration-300"
              >
                Start Free Trial
              </motion.button>
            </motion.div>

            {/* Pro Plan - Highlighted */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              whileHover={{ 
                scale: 1.03,
                boxShadow: "0 0 40px rgba(245, 245, 220, 0.3), 0 0 60px rgba(75, 46, 46, 0.2)"
              }}
              transition={{ 
                duration: 0.3, 
                ease: "easeOut",
                delay: 0.1
              }}
              viewport={{ once: true }}
              className="bg-[#4b2e2e] p-6 sm:p-8 rounded-xl shadow-lg border-2 border-[#4b2e2e] relative md:transform md:scale-105 transition-all duration-300 cursor-pointer"
            >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold text-[#f5f5dc] mb-4">Pro</h3>
              <div className="text-3xl font-bold text-[#f5f5dc] mb-6">₹1999<span className="text-lg font-normal">/month*</span></div>
              <ul className="space-y-3 mb-8 text-[#f5f5dc]">
                <li className="flex items-center"><Check className="text-green-400 mr-2" size={16} />Everything in Basic</li>
                <li className="flex items-center"><Check className="text-green-400 mr-2" size={16} />WhiteLabeling</li>
                <li className="flex items-center"><Check className="text-green-400 mr-2" size={16} />Analytics (30 days)</li>
                <li className="flex items-center"><Check className="text-green-400 mr-2" size={16} />Payment Integration</li>
                <li className="flex items-center"><Check className="text-green-400 mr-2" size={16} />Customize Menu Theme</li>
                <li className="flex items-center"><Check className="text-green-400 mr-2" size={16} />Advanced table management</li>
                <li className="flex items-center"><Check className="text-green-400 mr-2" size={16} />Up to 10 tables</li>
                <li className="flex items-center"><Check className="text-green-400 mr-2" size={16} />Priority Support</li>
              </ul>
              <motion.button 
                whileHover={{ scale: 1.05, boxShadow: "0 8px 20px rgba(255, 255, 255, 0.3)" }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-[#f5f5dc] text-[#4b2e2e] py-3 rounded-lg font-semibold hover:bg-white transition-all duration-300"
              >
                Get Started 
              </motion.button>
            </motion.div>

            {/* Enterprise Plan */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 0 30px rgba(75, 46, 46, 0.2)",
                borderColor: "rgba(75, 46, 46, 0.4)"
              }}
              transition={{ 
                duration: 0.3, 
                ease: "easeOut",
                delay: 0.2
              }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-xl shadow-md border border-[#4b2e2e]/10 transition-all duration-300 cursor-pointer"
            >
              <h3 className="text-2xl font-bold text-[#4b2e2e] mb-4">Enterprise</h3>
              <div className="text-3xl font-bold text-[#4b2e2e] mb-6">Custom</div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center"><Check className="text-green-600 mr-2" size={16} />Everything in Pro</li>
                <li className="flex items-center"><Check className="text-green-600 mr-2" size={16} />Multi-location support</li>
                <li className="flex items-center"><Check className="text-green-600 mr-2" size={16} />Custom integrations</li>
                <li className="flex items-center"><Check className="text-green-600 mr-2" size={16} />Advanced reporting</li>
                <li className="flex items-center"><Check className="text-green-600 mr-2" size={16} />24/7 phone support</li>
              </ul>
              <motion.button 
                whileHover={{ scale: 1.05, boxShadow: "0 8px 20px rgba(75, 46, 46, 0.3)" }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-[#4b2e2e] text-[#f5f5dc] py-3 rounded-lg font-semibold hover:bg-[#4b2e2e]/90 transition-all duration-300"
              >
                Contact Sales
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section 
        id="contact" 
        className="py-20 bg-white"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#4b2e2e] mb-4">Let's Connect</h2>
            <p className="text-lg sm:text-xl text-[#4b2e2e]/70">Ready to transform your café? We'd love to hear from you!</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              viewport={{ once: true }}
              className="lg:col-span-2"
            >
              <div className="bg-[#f5f5dc] p-6 sm:p-8 rounded-2xl shadow-xl border border-[#4b2e2e]/10">
                <h3 className="text-2xl font-bold text-[#4b2e2e] mb-6">Send us a message</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-[#4b2e2e] mb-2">Full Name</label>
                      <input
                        type="text"
                        placeholder="Enter your name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full p-3 sm:p-4 rounded-xl border-2 border-[#4b2e2e]/10 focus:border-[#4b2e2e] outline-none transition-colors bg-white text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#4b2e2e] mb-2">Contact No</label>
                      <input
                        type="tel"
                        placeholder="Enter your Contact No"
                        name="from_phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full p-3 sm:p-4 rounded-xl border-2 border-[#4b2e2e]/10 focus:border-[#4b2e2e] outline-none transition-colors bg-white text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#4b2e2e] mb-2">Email Address</label>
                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full p-3 sm:p-4 rounded-xl border-2 border-[#4b2e2e]/10 focus:border-[#4b2e2e] outline-none transition-colors bg-white text-sm sm:text-base"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#4b2e2e] mb-2">Message</label>
                    <textarea
                      placeholder="Tell us about your café and how we can help..."
                      rows="5"
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      className="w-full p-3 sm:p-4 rounded-xl border-2 border-[#4b2e2e]/10 focus:border-[#4b2e2e] outline-none transition-colors bg-white resize-none text-sm sm:text-base"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(75, 46, 46, 0.3)" }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full bg-[#4b2e2e] text-[#f5f5dc] py-3 sm:py-4 rounded-xl font-semibold hover:bg-[#4b2e2e]/90 transition-all duration-300 flex items-center cursor-pointer justify-center space-x-2 text-sm sm:text-base"
                  >
                    <Mail size={20} />
                    <span>Send Message</span>
                  </motion.button>
                </form>
              </div>
            </motion.div>

            {/* Contact Info & Social */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              {/* Quick Contact */}
              <div className="bg-[#f5f5dc] p-6 rounded-2xl shadow-xl border border-[#4b2e2e]/10">
                <h4 className="text-xl font-bold text-[#4b2e2e] mb-4">Quick Contact</h4>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-[#4b2e2e]/10 p-2 rounded-lg">
                      <Phone className="text-[#4b2e2e]" size={18} />
                    </div>
                    <div>
                      <p className="text-sm text-[#4b2e2e]/70">Phone</p>
                      <p className="font-semibold text-[#4b2e2e]">+91 70439 74792</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-[#4b2e2e]/10 p-2 rounded-lg">
                      <Mail className="text-[#4b2e2e]" size={18} />
                    </div>
                    <div>
                      <p className="text-sm text-[#4b2e2e]/70">Email</p>
                      <p className="font-semibold text-[#4b2e2e]">dhruvjainn25@gmail.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-[#4b2e2e]/10 p-2 rounded-lg">
                      <MapPin className="text-[#4b2e2e]" size={18} />
                    </div>
                    <div>
                      <p className="text-sm text-[#4b2e2e]/70">Location</p>
                      <p className="font-semibold text-[#4b2e2e]">Ahmedabad, India</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="bg-[#f5f5dc] p-6 rounded-2xl shadow-xl border border-[#4b2e2e]/10">
                <h4 className="text-xl font-bold text-[#4b2e2e] mb-4">Follow Us</h4>
                <div className="flex space-x-4">
                  <motion.a
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    href="https://instagram.com/theannsh"
                    className="bg-gradient-to-r from-pink-500 to-purple-600 p-3 rounded-xl text-white hover:shadow-lg transition-all"
                  >
                    <Instagram size={20} />
                  </motion.a>
                  {/* <motion.a
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    href="https://facebook.com/annsh"
                    className="bg-blue-600 p-3 rounded-xl text-white hover:shadow-lg transition-all"
                  >
                    <Facebook size={20} />
                  </motion.a>
                  <motion.a
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    href="https://twitter.com/annsh_official"
                    className="bg-sky-500 p-3 rounded-xl text-white hover:shadow-lg transition-all"
                  >
                    <Twitter size={20} />
                  </motion.a> */}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Sticky CTA Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2, duration: 0.5 }}
        className="fixed bottom-6 right-6 z-30"
      >
        <motion.button
          whileHover={{ scale: 1.1, boxShadow: "0 10px 30px rgba(75, 46, 46, 0.4)" }}
          whileTap={{ scale: 0.9 }}
          onClick={() => scrollToSection('contact')}
          className="bg-[#4b2e2e] text-[#f5f5dc] px-6 py-3 rounded-full font-semibold shadow-lg hover:bg-[#4b2e2e]/90 transition-all duration-300 flex items-center space-x-2"
        >
          <MessageCircle size={20} />
          <span className="hidden sm:inline">Request Demo</span>
        </motion.button>
      </motion.div>

      {/* Popup Message */}
      {showPopup && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed top-20 right-4 z-50 max-w-sm"
        >
          <div className={`p-4 rounded-xl shadow-2xl border-2 ${
            popupMessage.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center space-x-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                popupMessage.type === 'success' ? 'bg-green-500' : 'bg-red-500'
              }`}>
                {popupMessage.type === 'success' ? (
                  <Check className="text-white" size={16} />
                ) : (
                  <X className="text-white" size={16} />
                )}
              </div>
              <p className="font-semibold">{popupMessage.text}</p>
              <button
                onClick={() => setShowPopup(false)}
                className="ml-auto text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Footer */}
      <footer className="bg-[#4b2e2e] text-[#f5f5dc] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-2xl font-bold mb-4 md:mb-0">Annsh</div>
            <div className="flex space-x-6">
              <a href="#privacy" className="hover:text-[#f5f5dc]/70 transition-colors">Privacy</a>
              <a href="#terms" className="hover:text-[#f5f5dc]/70 transition-colors">Terms</a>
              <a href="#support" className="hover:text-[#f5f5dc]/70 transition-colors">Support</a>
            </div>
          </div>
          <div className="border-t border-[#f5f5dc]/20 mt-8 pt-8 text-center">
            <p className="text-[#f5f5dc]/70">© 2025 Annsh. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AnnshLanding;
