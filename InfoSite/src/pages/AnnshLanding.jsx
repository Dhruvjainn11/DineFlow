import React, { useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { QrCode, Monitor, Clock, Settings, Check, MessageCircle, Mail, Phone, MapPin, Instagram, Facebook, Twitter } from 'lucide-react';

const AnnshLanding = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const { scrollYProgress } = useScroll();
  
  const sectionVariants = {
    hidden: { opacity: 0, y: 100 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  return (
    <div className="bg-[#f5f5dc] min-h-screen overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-[#f5f5dc]/90 backdrop-blur-sm z-50 border-b border-[#4b2e2e]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="text-2xl font-bold text-[#4b2e2e]">Annsh</div>
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
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.section 
        id="home" 
        className="min-h-screen flex items-center justify-center pt-16"
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-[#4b2e2e] mb-6">
              Smart Digital Menu & Ordering for Cafés
            </h1>
            <p className="text-xl text-[#4b2e2e]/70 mb-8 max-w-3xl mx-auto">
              Transform your café with QR code ordering, real-time kitchen management, and seamless customer experiences
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-[#4b2e2e] text-[#f5f5dc] px-8 py-4 rounded-lg text-lg font-semibold shadow-lg hover:bg-[#4b2e2e]/90 transition-colors"
            >
              Get Started
            </motion.button>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        id="features" 
        className="min-h-screen flex items-center py-20"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-[#4b2e2e] mb-4">Features</h2>
            <p className="text-xl text-[#4b2e2e]/70">Everything you need to run a modern café</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: QrCode, title: 'QR Code Ordering', desc: 'Customers scan and order instantly' },
              { icon: Monitor, title: 'Kitchen Dashboard', desc: 'Real-time order management system' },
              { icon: Clock, title: 'Real-Time Updates', desc: 'Live order status tracking' },
              { icon: Settings, title: 'Easy Menu Management', desc: 'Update menus with simple clicks' }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-xl shadow-lg border border-[#4b2e2e]/10"
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
      </motion.section>

      {/* Pricing Section */}
      <motion.section 
        id="pricing" 
        className="min-h-screen flex items-center py-20 bg-white"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-[#4b2e2e] mb-4">Pricing</h2>
            <p className="text-xl text-[#4b2e2e]/70">Choose the perfect plan for your café</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Basic Plan */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-[#f5f5dc] p-8 rounded-xl shadow-lg border border-[#4b2e2e]/10"
            >
              <h3 className="text-2xl font-bold text-[#4b2e2e] mb-4">Basic</h3>
              <div className="text-3xl font-bold text-[#4b2e2e] mb-6">₹999<span className="text-lg font-normal">/month*</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center"><Check className="text-green-600 mr-2" size={16} />Digital menu creation</li>
                <li className="flex items-center"><Check className="text-green-600 mr-2" size={16} />QR code ordering</li>
                <li className="flex items-center"><Check className="text-green-600 mr-2" size={16} />Basic order tracking</li>
                <li className="flex items-center"><Check className="text-green-600 mr-2" size={16} />Payment integration</li>
                <li className="flex items-center"><Check className="text-green-600 mr-2" size={16} />Kitchen dashboard (7 days)</li>
                <li className="flex items-center"><Check className="text-green-600 mr-2" size={16} />Analytics (7 days)</li>
                <li className="flex items-center"><Check className="text-green-600 mr-2" size={16} />Up to 5 tables</li>
              </ul>
              <button className="w-full bg-[#4b2e2e] text-[#f5f5dc] py-3 rounded-lg font-semibold hover:bg-[#4b2e2e]/90 transition-colors">
                Choose Plan
              </button>
            </motion.div>

            {/* Pro Plan - Highlighted */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              animate={{ y: [0, -5, 0] }}
              className="bg-[#4b2e2e] p-8 rounded-xl shadow-xl border-2 border-[#4b2e2e] relative"
            >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold text-[#f5f5dc] mb-4">Pro</h3>
              <div className="text-3xl font-bold text-[#f5f5dc] mb-6">₹1999<span className="text-lg font-normal">/month*</span></div>
              <ul className="space-y-3 mb-8 text-[#f5f5dc]">
                <li className="flex items-center"><Check className="text-green-400 mr-2" size={16} />Everything in Basic</li>
                <li className="flex items-center"><Check className="text-green-400 mr-2" size={16} />Kitchen dashboard (30 days)</li>
                <li className="flex items-center"><Check className="text-green-400 mr-2" size={16} />Analytics (30 days)</li>
                <li className="flex items-center"><Check className="text-green-400 mr-2" size={16} />Real-time order updates</li>
                <li className="flex items-center"><Check className="text-green-400 mr-2" size={16} />Advanced table management</li>
                <li className="flex items-center"><Check className="text-green-400 mr-2" size={16} />Unlimited tables</li>
                <li className="flex items-center"><Check className="text-green-400 mr-2" size={16} />Priority Support</li>
              </ul>
              <button className="w-full bg-[#f5f5dc] text-[#4b2e2e] py-3 rounded-lg font-semibold hover:bg-[#f5f5dc]/90 transition-colors">
                Choose Plan
              </button>
            </motion.div>

            {/* Enterprise Plan */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-[#f5f5dc] p-8 rounded-xl shadow-lg border border-[#4b2e2e]/10"
            >
              <h3 className="text-2xl font-bold text-[#4b2e2e] mb-4">Enterprise</h3>
              <div className="text-3xl font-bold text-[#4b2e2e] mb-6">Custom</div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center"><Check className="text-green-600 mr-2" size={16} />Everything in Pro</li>
                <li className="flex items-center"><Check className="text-green-600 mr-2" size={16} />Multi-location support</li>
                <li className="flex items-center"><Check className="text-green-600 mr-2" size={16} />Custom integrations</li>
                <li className="flex items-center"><Check className="text-green-600 mr-2" size={16} />Advanced reporting</li>
                <li className="flex items-center"><Check className="text-green-600 mr-2" size={16} />Dedicated account manager</li>
                <li className="flex items-center"><Check className="text-green-600 mr-2" size={16} />24/7 phone support</li>
              </ul>
              <button className="w-full bg-[#4b2e2e] text-[#f5f5dc] py-3 rounded-lg font-semibold hover:bg-[#4b2e2e]/90 transition-colors">
                Choose Plan
              </button>
            </motion.div>
          </div>
          
          {/* Setup Cost Note */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mt-8"
          >
            <p className="text-[#4b2e2e]/70 text-sm">
              * Plus one-time setup cost: ₹999 for Basic, ₹1999 for Pro
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Contact Section */}
      <motion.section 
        id="contact" 
        className="min-h-screen flex items-center py-20 bg-gradient-to-br from-[#4b2e2e]/5 to-[#4b2e2e]/10"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-[#4b2e2e] mb-4">Let's Connect</h2>
            <p className="text-xl text-[#4b2e2e]/70">Ready to transform your café? We'd love to hear from you!</p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-2"
            >
              <div className="bg-white p-8 rounded-2xl shadow-xl border border-[#4b2e2e]/10">
                <h3 className="text-2xl font-bold text-[#4b2e2e] mb-6">Send us a message</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-[#4b2e2e] mb-2">Full Name</label>
                      <input
                        type="text"
                        placeholder="Enter your name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full p-4 rounded-xl border-2 border-[#4b2e2e]/10 focus:border-[#4b2e2e] outline-none transition-colors bg-[#f5f5dc]/30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#4b2e2e] mb-2">Email Address</label>
                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full p-4 rounded-xl border-2 border-[#4b2e2e]/10 focus:border-[#4b2e2e] outline-none transition-colors bg-[#f5f5dc]/30"
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
                      className="w-full p-4 rounded-xl border-2 border-[#4b2e2e]/10 focus:border-[#4b2e2e] outline-none transition-colors bg-[#f5f5dc]/30 resize-none"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#4b2e2e] to-[#4b2e2e]/80 text-[#f5f5dc] py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <Mail size={20} />
                    <span>Send Message</span>
                  </motion.button>
                </form>
              </div>
            </motion.div>

            {/* Contact Info & Social */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              {/* Quick Contact */}
              <div className="bg-white p-6 rounded-2xl shadow-xl border border-[#4b2e2e]/10">
                <h4 className="text-xl font-bold text-[#4b2e2e] mb-4">Quick Contact</h4>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-[#4b2e2e]/10 p-2 rounded-lg">
                      <Phone className="text-[#4b2e2e]" size={18} />
                    </div>
                    <div>
                      <p className="text-sm text-[#4b2e2e]/70">Phone</p>
                      <p className="font-semibold text-[#4b2e2e]">+91 98765 43210</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-[#4b2e2e]/10 p-2 rounded-lg">
                      <Mail className="text-[#4b2e2e]" size={18} />
                    </div>
                    <div>
                      <p className="text-sm text-[#4b2e2e]/70">Email</p>
                      <p className="font-semibold text-[#4b2e2e]">hello@annsh.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-[#4b2e2e]/10 p-2 rounded-lg">
                      <MapPin className="text-[#4b2e2e]" size={18} />
                    </div>
                    <div>
                      <p className="text-sm text-[#4b2e2e]/70">Location</p>
                      <p className="font-semibold text-[#4b2e2e]">Mumbai, India</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* WhatsApp */}
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="https://wa.me/919876543210"
                className="block bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex items-center justify-center space-x-3">
                  <MessageCircle size={24} />
                  <span className="text-lg">Chat on WhatsApp</span>
                </div>
                <p className="text-center text-green-100 text-sm mt-2">Get instant support & demos</p>
              </motion.a>

              {/* Social Links */}
              <div className="bg-white p-6 rounded-2xl shadow-xl border border-[#4b2e2e]/10">
                <h4 className="text-xl font-bold text-[#4b2e2e] mb-4">Follow Us</h4>
                <div className="flex space-x-4">
                  <motion.a
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    href="https://instagram.com/annsh_official"
                    className="bg-gradient-to-r from-pink-500 to-purple-600 p-3 rounded-xl text-white hover:shadow-lg transition-all"
                  >
                    <Instagram size={20} />
                  </motion.a>
                  <motion.a
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    href="https://facebook.com/annsh"
                    className="bg-blue-600 p-3 rounded-xl text-white hover:shadow-lg transition-all"
                  >
                    <Facebook size={20} />
                  </motion.a>
                  <motion.a
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    href="https://twitter.com/annsh_official"
                    className="bg-sky-500 p-3 rounded-xl text-white hover:shadow-lg transition-all"
                  >
                    <Twitter size={20} />
                  </motion.a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

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