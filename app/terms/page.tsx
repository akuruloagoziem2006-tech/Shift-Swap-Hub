'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="size-10 rounded-xl bg-gradient-to-br blue-500 blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold">ShiftSwap</span>
            </Link>
            <Link href="/">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="pt-32 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="size-4" />
            Back to Home
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold mb-8">Terms of Service</h1>
          
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <p className="text-sm text-muted-foreground">Last updated: January 2025</p>

            <h2 className="text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p>
              By accessing or using ShiftSwap, you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our services.
            </p>

            <h2 className="text-xl font-semibold text-foreground">2. Description of Service</h2>
            <p>
              ShiftSwap provides a platform for shift-based teams to manage schedules, 
              post available shifts, request shift swaps, and obtain manager approvals. 
              Our service facilitates communication between team members regarding shift coverage.
            </p>

            <h2 className="text-xl font-semibold text-foreground">3. User Accounts</h2>
            <p>
              To use ShiftSwap, you must:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Create an account with accurate information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Be responsible for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use</li>
            </ul>

            <h2 className="text-xl font-semibold text-foreground">4. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Use the service for any illegal purpose</li>
              <li>Post false, misleading, or deceptive shift information</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with the proper operation of the service</li>
            </ul>

            <h2 className="text-xl font-semibold text-foreground">5. Shift Responsibilities</h2>
            <p>
              Users are responsible for:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>The accuracy of shift information they post</li>
              <li>Fulfilling approved shift swaps</li>
              <li>Obtaining necessary approvals from managers</li>
              <li>Communicating promptly with colleagues</li>
            </ul>

            <h2 className="text-xl font-semibold text-foreground">6. Intellectual Property</h2>
            <p>
              ShiftSwap and its original content, features, and functionality are owned by us 
              and are protected by international copyright, trademark, and other intellectual property laws.
            </p>

            <h2 className="text-xl font-semibold text-foreground">7. Disclaimer of Warranties</h2>
            <p>
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, 
              EITHER EXPRESS OR IMPLIED. WE DO NOT GUARANTEE THAT THE SERVICE WILL BE UNINTERRUPTED, 
              SECURE, OR ERROR-FREE.
            </p>

            <h2 className="text-xl font-semibold text-foreground">8. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, ShiftSwap shall not be liable for any indirect, 
              incidental, special, consequential, or punitive damages resulting from your use of the service.
            </p>

            <h2 className="text-xl font-semibold text-foreground">9. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. We will notify users of 
              significant changes via email or through the service. Continued use after changes 
              constitutes acceptance of the new terms.
            </p>

            <h2 className="text-xl font-semibold text-foreground">10. Contact</h2>
            <p>
              For questions about these Terms of Service, please contact us at{' '}
              <a href="mailto:akuruloagoziem2006@gmail.com" className="text-blue-500 hover:text-blue-400">
                akuruloagoziem2006@gmail.com
              </a>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} ShiftSwap. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
