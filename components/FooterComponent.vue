<template>
  <footer class="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
    <!-- Background Pattern -->
    <div class="absolute inset-0 opacity-5">
      <div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, white 1px, transparent 0); background-size: 20px 20px;"></div>
    </div>
    
    <div class="relative">
      <!-- Main Footer Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <!-- Brand Section -->
          <div class="lg:col-span-2">
            <div class="flex items-center space-x-3 mb-4">
              <div class="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <span class="text-white font-bold text-xl">V</span>
              </div>
              <div>
                <h3 class="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                  VitalAid
                </h3>
                <p class="text-gray-400 text-sm">AI-Powered Health & Community Platform</p>
              </div>
            </div>
            <p class="text-gray-300 max-w-md leading-relaxed">
              Empowering communities through technology, connecting health experts with those in need, 
              and fostering sustainable engagement for a better tomorrow.
            </p>
            
            <!-- Tech Stack Badge -->
            <div class="mt-6 flex flex-wrap gap-2">
              <span class="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">
                Laravel
              </span>
              <span class="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full border border-blue-500/30">
                Nuxt.js
              </span>
              <span class="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full border border-purple-500/30">
                MongoDB
              </span>
              <span class="px-3 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full border border-orange-500/30">
                AI Integration
              </span>
            </div>
          </div>

          <!-- Quick Links -->
          <div>
            <h4 class="text-lg font-semibold mb-4 text-white">Platform</h4>
            <ul class="space-y-2 text-gray-300">
              <li>
                <NuxtLink to="/events" class="hover:text-green-400 transition-colors duration-200 flex items-center space-x-2">
                  <Calendar class="w-4 h-4" />
                  <span>Events</span>
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/consultations" class="hover:text-blue-400 transition-colors duration-200 flex items-center space-x-2">
                  <MessageCircle class="w-4 h-4" />
                  <span>Consultations</span>
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/donate" class="hover:text-red-400 transition-colors duration-200 flex items-center space-x-2">
                  <Heart class="w-4 h-4" />
                  <span>Donate</span>
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/community" class="hover:text-purple-400 transition-colors duration-200 flex items-center space-x-2">
                  <Users class="w-4 h-4" />
                  <span>Community</span>
                </NuxtLink>
              </li>
            </ul>
          </div>

          <!-- Support -->
          <div>
            <h4 class="text-lg font-semibold mb-4 text-white">Support</h4>
            <ul class="space-y-2 text-gray-300">
              <li>
                <a href="#" class="hover:text-green-400 transition-colors duration-200 flex items-center space-x-2">
                  <HelpCircle class="w-4 h-4" />
                  <span>Help Center</span>
                </a>
              </li>
              <li>
                <a href="#" class="hover:text-blue-400 transition-colors duration-200 flex items-center space-x-2">
                  <Shield class="w-4 h-4" />
                  <span>Privacy Policy</span>
                </a>
              </li>
              <li>
                <a href="#" class="hover:text-purple-400 transition-colors duration-200 flex items-center space-x-2">
                  <FileText class="w-4 h-4" />
                  <span>Terms of Service</span>
                </a>
              </li>
              <li>
                <a href="mailto:support@vitalaid.com" class="hover:text-orange-400 transition-colors duration-200 flex items-center space-x-2">
                  <Mail class="w-4 h-4" />
                  <span>Contact Us</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="border-t border-gray-700/50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div class="text-center md:text-left">
              <p class="text-gray-400 text-sm">
                © 2025 <span class="font-semibold text-white">VitalAid</span>. All rights reserved.
              </p>
              <p class="text-gray-500 text-xs mt-1">
                Final Year Project • Empowering Communities Through Technology 🚀
              </p>
            </div>
            
            <!-- Social Links or Status Indicators -->
            <div class="flex items-center space-x-4">
              <div class="flex items-center space-x-2 text-xs text-gray-500">
                <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>System Online</span>
              </div>
              <div class="flex items-center space-x-2 text-xs text-gray-500">
                <Zap class="w-3 h-3" />
                <span>AI Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { 
  Calendar, MessageCircle, Heart, Users, 
  HelpCircle, Shield, FileText, Mail, Zap 
} from 'lucide-vue-next'
</script>